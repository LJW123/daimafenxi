const QMapGl = window.QMapboxGl;
const Evented = QMapGl.Evented;
const MercatorCoordinate = QMapGl.MercatorCoordinate;

const THREE = window.THREE;
const {
  AmbientLight,
  BoxGeometry,
  BufferAttribute,
  Camera,
  Color,
  DirectionalLight,
  DoubleSide,
  Group,
  InstancedBufferGeometry,
  InstancedMesh,
  InstancedBufferAttribute,
  Matrix4,
  Mesh,
  MeshLambertMaterial,
  RawShaderMaterial,
  Scene,
  Vector4,
  WebGLRenderer,
} = THREE;

interface MercatorBounds {
  x: number;
  y: number;
  dx: number;
  dy: number;
}

const RESOLUTION_X = 64;
const RESOLUTION_Y = 64;

const boxGeometry = new BoxGeometry(1, -1, 1);
boxGeometry.translate(0.5, 0.5, 0.5);

const rainVertexBuffer = new Float32Array([
  // Front
  -0.002, 0.002, 0.01, 0.002, 0.002, 0.01, -0.002, 0.002, -0.01, 0.002, 0.002,
  -0.01,
  // Left
  -0.002, -0.002, 0.01, -0.002, 0.002, 0.01, -0.002, -0.002, -0.01, -0.002,
  0.002, -0.01,
  // Top
  -0.002, 0.002, 0.01, 0.002, 0.002, 0.01, -0.002, -0.002, 0.01, 0.002, -0.002,
  0.01,
]);

const rainIndices = new Uint16Array([
  0, 1, 2, 2, 1, 3, 4, 5, 6, 6, 5, 7, 8, 9, 10, 10, 9, 11,
]);

const snowVertexBuffer = new Float32Array([
  // Front
  -0.004, 0.004, 0.001, 0.004, 0.004, 0.001, -0.004, 0.004, -0.001, 0.004,
  0.004, -0.001,
  // Left
  -0.004, -0.004, 0.001, -0.004, 0.004, 0.001, -0.004, -0.004, -0.001, -0.004,
  0.004, -0.001,
  // Top
  -0.004, 0.004, 0.001, 0.004, 0.004, 0.001, -0.004, -0.004, 0.001, 0.004,
  -0.004, 0.001,
]);

const snowIndices = new Uint16Array([
  0, 1, 2, 2, 1, 3, 4, 5, 6, 6, 5, 7, 8, 9, 10, 10, 9, 11,
]);

const rainVertexShader = `
    precision highp float;
    uniform mat4 modelViewMatrix;
    uniform mat4 projectionMatrix;
    uniform float time;
    uniform float scale;
    attribute vec3 position;
    attribute vec3 offset;

    void main(void) {
        vec3 translate = vec3(position.x * scale + offset.x, position.y * scale + offset.y, position.z + mod(offset.z - time + 1.0, 1.0));
        gl_Position = projectionMatrix * modelViewMatrix * vec4(translate, 1.0);
    }
`;

const rainFragmentShader = `
    precision highp float;
    uniform vec4 color;

    void main(void) {
        gl_FragColor = color;
    }
`;

const legendColors = [
  {
    value: 0,
    color: '#000000',
  },
  {
    value: 5,
    color: '#69E5E4',
  },
  {
    value: 10,
    color: '#4599E9',
  },
  {
    value: 15,
    color: '#0F02E7',
  },
  {
    value: 20,
    color: '#72F44A',
  },
  {
    value: 25,
    color: '#59C239',
  },
  {
    value: 30,
    color: '#3E8B27',
  },
  {
    value: 35,
    color: '#F8F551',
  },
  {
    value: 40,
    color: '#DDBC3F',
  },
  {
    value: 45,
    color: '#EA9736',
  },
  {
    value: 50,
    color: '#E33323',
  },
  {
    value: 55,
    color: '#BF281C',
  },
  {
    value: 60,
    color: '#A72318',
  },
  {
    value: 65,
    color: '#E131F0',
  },
  {
    value: 70,
    color: '#8D54BF',
  },
  {
    value: 75,
    color: '#FEFEFE',
  },
];

const tiles = ['http://192.168.1.127/dataTiles/rainsnow/{z}_{y}_{x}.png'];
// const tiles = ['http://localhost:9901/weather/{z}_{y}_{x}.png'];

const tileSize = 256;
const minzoom = 1;
const maxzoom = 20;

// 返回默认值或value
function valueOrDefault(value: any, defaultValue: any) {
  return value === undefined ? defaultValue : value;
}

/**
 * 一个解析嵌套属性键的函数。
 * @param object 要解析的对象。
 * @param key 以点分割或包含方括号的嵌套属性键。
 * @returns 返回根据键在对象中找到的值。
 */
function resolve(object: any, key: any) {
  let first = key.split(/\.|(?=\[)/)[0];
  const rest = key.slice(first.length).replace(/^\./, '');

  if (Array.isArray(object) && first.match(/^\[-?\d+\]$/)) {
    first = +first.slice(1, -1);
    if (first < 0) {
      first += object.length;
    }
  }
  if (first in object && rest) {
    return resolve(object[first], rest);
  }

  return object[first];
}

/**
 * 根据提供的字典对文本中的占位符进行格式化替换。
 * @param text 需要格式化的文本，可能包含占位符（如"${key}"）。
 * @param dict 用于替换占位符的字典对象，键值对形式。
 * @returns 格式化后的文本，占位符被相应的字典值替换。
 */
function format(text: any, dict: any) {
  // 查找文本中所有占位符
  const matches = text.match(/\$\{[^}]+\}/g);

  if (matches) {
    // 遍历所有匹配到的占位符，进行替换
    for (const match of matches) {
      text = text.replace(match, resolve(dict, match.slice(2, -1)));
    }
  }
  return text;
}

// 获取范围  经纬度转墨卡托
/**
 * 根据给定的标准化坐标（canonical），计算并返回墨卡托投影边界的对象。
 *
 * @param canonical 包含地图瓦片坐标（x, y, z）的对象，其中z是瓦片的缩放级别。
 * @returns 返回一个对象，包含墨卡托投影边界在x和y方向上的起始坐标（x, y）以及宽度（dx）和高度（dy）。
 */
function getMercatorBounds(canonical: any): MercatorBounds {
  const { x, y, z } = canonical;
  const n = Math.pow(2, z);
  const lng1 = (x / n) * 360 - 180;
  const lat1 =
    (Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / n))) * 180) / Math.PI;
  const lng2 = ((x + 1) / n) * 360 - 180;
  const lat2 =
    (Math.atan(Math.sinh(Math.PI * (1 - (2 * (y + 1)) / n))) * 180) / Math.PI;
  const coord1 = MercatorCoordinate.fromLngLat([lng1, lat1]);
  const coord2 = MercatorCoordinate.fromLngLat([lng2, lat2]);

  return {
    x: coord1.x,
    y: coord1.y,
    dx: coord2.x - coord1.x,
    dy: coord2.y - coord1.y,
  };
}

// 创建盒子实体
/**
 * 创建一个盒状网格Mesh，用于在3D场景中表示气象数据。
 *
 * @param z 高度层级，影响网格的分辨率和缩放。
 * @param mercatorBounds 经纬度范围，用于设置Mesh的位置和大小。
 * @param dbz 储存雷达回波强度数据的数组。
 * @param scaleColors 根据雷达回波强度分级的颜色配置。
 * @param material Mesh的材质。
 * @returns 返回创建的InstancedMesh对象，如果没有实例则返回undefined。
 */
function createBoxMesh(
  z: number,
  mercatorBounds: MercatorBounds,
  dbz: any,
  scaleColors: any,
  material: any,
) {
  // 计算分辨率和缩放因子
  const factor = 1 / Math.pow(2, (z - 1) / 3);
  const resolutionX = Math.floor(RESOLUTION_X * factor);
  const resolutionY = Math.floor(RESOLUTION_Y * factor);
  // 颜色分级的阈值
  const threshold = scaleColors[0][0];
  const instances = []; // 存储所有实例的数据

  // 遍历每个网格点，根据dbz数据决定是否添加到实例中
  for (let y = 0; y < resolutionY; y++) {
    for (let x = 0; x < resolutionX; x++) {
      const level =
        dbz[
          Math.floor(((y + 0.5) / resolutionY) * 256) * 256 +
            Math.floor(((x + 0.5) / resolutionX) * 256)
        ] & 127;
      if (level >= threshold) {
        // 查找对应的颜色等级
        for (let p = 1; p < scaleColors.length; p++) {
          if (level < scaleColors[p][0]) {
            instances.push({ x, y, p });
            break;
          }
        }
      }
    }
  }
  // 如果没有实例，则直接返回
  if (instances.length === 0) {
    return;
  }

  // 创建实例化网格
  const mesh = new InstancedMesh(boxGeometry, material, instances.length);
  // 设置每个实例的位置和颜色
  for (let i = 0; i < instances.length; i++) {
    const { x, y, p } = instances[i];
    const matrix = new Matrix4()
      .makeScale(1 / resolutionX, 1 / resolutionY, 1)
      .setPosition(x / resolutionX, y / resolutionY, 0);
    mesh.setMatrixAt(i, matrix);
    mesh.setColorAt(i, scaleColors[p][1]);
  }
  // 设置Mesh的全局位置和缩放，基于经纬度范围
  mesh.position.x = mercatorBounds.x;
  mesh.position.y = mercatorBounds.y;
  mesh.scale.x = mercatorBounds.dx;
  mesh.scale.y = mercatorBounds.dy;
  mesh.scale.z =
    Math.pow(2, z < 10 ? 10 - z : z < 14 ? 0 : (14 - z) * 0.8) * 0.0002;
  mesh.updateMatrix();
  mesh.matrixAutoUpdate = false; // 禁止自动更新矩阵以优化性能
  mesh.renderOrder = 1; // 设置渲染顺序
  return mesh;
}

// 创建 雨或雪实体
/**
 * 创建表示雨滴或雪花的网格对象。
 * @param z 高度层级，影响网格的细节和分布。
 * @param mercatorBounds 梅卡托投影的边界对象，用于设置网格的位置和大小。
 * @param dbz 一个数组，包含雷达回波强度数据，用于决定在什么位置创建雨滴或雪花。
 * @param scaleColors 一个颜色标度数组，用于根据雷达回波强度确定颜色。
 * @param material 网格的材质对象。
 * @param snow 布尔值，指示是否创建雪花而不是雨滴。 false 雨   true 雪
 * @returns 返回一个Mesh对象，代表雨或雪的图形实例，如果没有实例则返回undefined。
 */
function createRainMesh(
  z: number,
  mercatorBounds: MercatorBounds,
  dbz: any,
  scaleColors: any,
  material: any,
  snow?: boolean,
) {
  // 根据高度层级计算网格分辨率
  const factor = 1 / Math.pow(2, (z - 1) / 3);
  const resolutionX = Math.floor(RESOLUTION_X * factor);
  const resolutionY = Math.floor(RESOLUTION_Y * factor);
  // 获取颜色标度的阈值
  const threshold = scaleColors[0][0];
  const instances = []; // 用于存储雨滴或雪花实例的数据

  // 双重循环遍历分辨率网格，根据dbz数据创建雨滴或雪花实例
  for (let y = 0; y < resolutionY; y++) {
    for (let x = 0; x < resolutionX; x++) {
      const level =
        dbz[
          Math.floor(((y + 0.5) / resolutionY) * 256) * 256 +
            Math.floor(((x + 0.5) / resolutionX) * 256)
        ];
      // 根据level值判断是否创建雨滴或雪花实例
      if (!snow === !(level & 128) && (level & 127) >= threshold) {
        for (
          let i = 0;
          i <
          Math.pow(2, ((level & 127) - threshold) / 10) * Math.max(1, z - 14);
          i++
        ) {
          instances.push({ x, y });
        }
      }
    }
  }

  // 如果没有实例，则直接返回
  if (instances.length === 0) {
    return;
  }

  // 创建实例化缓冲区几何体，用于高效绘制大量同类几何体
  const instancedBufferGeometry = new InstancedBufferGeometry();

  // 设置几何体的位置属性，雪花和雨滴使用不同的顶点缓冲
  const positions = new BufferAttribute(
    snow ? snowVertexBuffer : rainVertexBuffer,
    3,
  );
  instancedBufferGeometry.setAttribute('position', positions);

  // 设置几何体的索引属性
  instancedBufferGeometry.setIndex(
    new BufferAttribute(snow ? snowIndices : rainIndices, 1),
  );

  // 为每个实例生成随机偏移量，用于模拟雨滴或雪花的随机飘落
  const rainOffsetBuffer = new Float32Array(instances.length * 3);
  const offsets = new InstancedBufferAttribute(rainOffsetBuffer, 3);
  for (let i = 0; i < instances.length; i++) {
    const { x, y } = instances[i];
    offsets.setXYZ(
      i,
      (x + Math.random()) / resolutionX,
      (y + Math.random()) / resolutionY,
      Math.random(),
    );
  }
  instancedBufferGeometry.setAttribute('offset', offsets);

  // 创建网格对象，并设置其位置、大小和材质
  const mesh = new Mesh(instancedBufferGeometry, material);
  mesh.position.x = mercatorBounds.x;
  mesh.position.y = mercatorBounds.y;
  mesh.scale.x = mercatorBounds.dx;
  mesh.scale.y = mercatorBounds.dy;
  // 根据高度调整网格的z缩放，以模拟距离感
  mesh.scale.z =
    Math.pow(2, z < 10 ? 10 - z : z < 14 ? 0 : (14 - z) * 0.8) * 0.0002 * 20;
  mesh.updateMatrix();
  mesh.matrixAutoUpdate = false; // 禁用自动矩阵更新以提高性能
  mesh.frustumCulled = false; // 禁用视锥体剪裁以显示所有实例
  return mesh;
}

// 清除  注销 实体
/**
 * 释放网格资源
 * @param mesh {Object} 待释放的网格对象。可以是标准网格或实例化网格。
 * 该函数检查传入的网格对象类型，并根据类型释放相应的资源。
 * 对于实例化缓冲几何体和实例化网格，分别调用其dispose方法来释放资源。
 */
function disposeMesh(mesh: any) {
  // 如果网格的几何体是实例化缓冲几何体，则释放几何体资源
  if (mesh.geometry instanceof InstancedBufferGeometry) {
    mesh.geometry.dispose();
  }
  // 如果网格本身是实例化网格，则释放网格资源
  if (mesh instanceof InstancedMesh) {
    mesh.dispose();
  }
}

/**
 * 加载瓦片数据的函数。
 * @param tile 一个包含瓦片信息的对象，任意类型，但应包含瓦片ID和纹理等信息。
 * @param callback 加载完成后的回调函数，接受一个错误参数。
 */
function loadTile(tile: any, callback: any) {
  // 使用原型链上的loadTile方法来实际加载瓦片，并在加载完成后执行回调
  this.constructor.prototype.loadTile.call(this, tile, (err: any) => {
    // 解构出瓦片ID中的坐标和层级信息
    const { x, y, z } = tile.tileID.canonical;
    // 根据坐标和层级信息生成瓦片的唯一标识符
    const position = `${z}/${x}/${y}`;
    // 获取瓦片的纹理
    const texture = tile.texture;
    // 获取父图层引用
    const layer = this._parentLayer;
    // 获取瓦片字典引用
    const tileDict = this._tileDict;

    // 检查如果纹理存在、图层有效且该瓦片的标识符不在瓦片字典中，则进行处理
    if (texture && layer && !tileDict[position]) {
      // 获取WebGL上下文
      const gl = this.map.painter.context.gl;
      // 创建一个帧缓冲对象
      const fb = gl.createFramebuffer();
      // 获取纹理的尺寸
      const [width, height] = texture.size;
      // 创建一个用于存储像素数据的数组
      const pixels = new Uint8Array(width * height * 4);
      // 创建一个用于存储经过处理的瓦片数据的数组
      const dbz = (tile._dbz = new Uint8Array(width * height));
      // 计算瓦片的墨卡托边界
      const mercatorBounds = (tile._mercatorBounds = getMercatorBounds(
        tile.tileID.canonical,
      ));

      // 绑定帧缓冲对象，并将纹理绑定到帧缓冲对象上
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
      gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        gl.COLOR_ATTACHMENT0,
        gl.TEXTURE_2D,
        texture.texture,
        0,
      );
      // 从帧缓冲对象中读取像素数据
      gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
      // 解绑帧缓冲对象，并删除帧缓冲对象
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.deleteFramebuffer(fb);

      // 如果图层定义了颜色映射，则根据颜色映射处理瓦片数据
      if (layer._colors) {
        // 将颜色字符串转换为整数格式
        const colors = layer._colors.map((color: string) =>
          parseInt(color.replace('#', '0x'), 16),
        );
        // 根据颜色映射填充瓦片数据数组
        for (let i = 0; i < dbz.length; i++) {
          const color =
            (pixels[i * 4] * 256 + pixels[i * 4 + 1]) * 256 + pixels[i * 4 + 2];
          for (let j = 0; j < colors.length; j++) {
            if (color === colors[j]) {
              dbz[i] = j;
              break;
            }
          }
        }
      } else {
        // 若无颜色映射，则直接将像素值赋给瓦片数据数组
        for (let i = 0; i < dbz.length; i++) {
          dbz[i] = pixels[i * 4];
        }
      }

      // 根据瓦片数据创建并添加相应的三维模型（盒子、雨滴、雪花）
      const group = layer._zoomGroups[z - 1];
      const boxMesh = createBoxMesh(
        z,
        mercatorBounds,
        dbz,
        layer._scaleColors,
        layer._meshMaterial,
      );
      if (boxMesh) {
        tile._boxMesh = boxMesh;
        group.add(boxMesh);
      }
      const rainMesh = createRainMesh(
        z,
        mercatorBounds,
        dbz,
        layer._scaleColors,
        layer._rainMaterial,
      );
      if (rainMesh) {
        tile._rainMesh = rainMesh;
        group.add(rainMesh);
      }
      const snowMesh = createRainMesh(
        z,
        mercatorBounds,
        dbz,
        layer._scaleColors,
        layer._snowMaterial,
        true,
      );
      if (snowMesh) {
        tile._snowMesh = snowMesh;
        group.add(snowMesh);
      }

      // 将瓦片信息加入瓦片字典
      tileDict[position] = tile;
    }

    // 调用回调函数，传递可能发生的错误
    callback(err);
  });
}

/**
 * 卸载指定的瓦片资源。
 * @param tile 表示一个瓦片的对象，该对象应包含与瓦片相关的信息，如瓦片的ID和相关的三维网格。
 * @param callback 完成卸载后调用的回调函数，接受一个错误参数。
 */
function unloadTile(tile: any, callback: any) {
  // 通过原型链调用父类的unloadTile方法，完成基本的卸载操作，并传入一个错误处理回调
  this.constructor.prototype.unloadTile.call(this, tile, (err: any) => {
    // 解构获取瓦片ID的相关坐标信息，用于后续在_dict中定位该瓦片
    const { x, y, z } = tile.tileID.canonical;
    // 根据坐标信息生成在_dict中存储该瓦片的键
    const position = `${z}/${x}/${y}`;
    // 获取瓦片相关的三种网格资源
    const boxMesh = tile._boxMesh;
    const rainMesh = tile._rainMesh;
    const snowMesh = tile._snowMesh;

    // 对于存在的网格资源，先从其父对象中移除，然后释放资源，并从瓦片对象中删除对应的属性
    if (boxMesh) {
      boxMesh.parent.remove(boxMesh);
      disposeMesh(boxMesh);
      delete tile._boxMesh;
    }

    if (rainMesh) {
      rainMesh.parent.remove(rainMesh);
      disposeMesh(rainMesh);
      delete tile._rainMesh;
    }

    if (snowMesh) {
      snowMesh.parent.remove(snowMesh);
      disposeMesh(snowMesh);
      delete tile._snowMesh;
    }

    // 从当前对象的_tileDict属性中删除对应的瓦片记录
    delete this._tileDict[position];

    // 调用原始回调函数，传递可能发生的错误
    callback(err);
  });
}

export default class RainLayer extends Evented {
  constructor(options: any) {
    super();

    this.id = options.id;
    this.type = 'custom';
    this.renderingMode = '3d';

    this.minzoom = options.minzoom;
    this.maxzoom = options.maxzoom;

    this.source = options.source || 'rainviewer';

    // 雨  是否显示
    this.rainShow = false;
    // 雪  是否显示
    this.snowShow = false;

    // 雨的颜色
    this.rainColor = options.rainColor || '#ccf';
    // 雪的颜色
    this.snowColor = options.snowColor || '#fff';

    // 实体 外框  范围 透明度
    this.meshOpacity = valueOrDefault(options.meshOpacity, 0);
    // 是否重绘
    this.repaint = valueOrDefault(options.repaint, true);

    // 时间间隔
    this._interval = 600000;

    this._onZoom = this._onZoom.bind(this);
  }

  /**
   * 初始化函数，用于设置3D雨雪效果的相关参数和对象。
   * @param map 地图对象，提供地图的绘制上下文和交互功能。
   * @param gl WebGL绘制上下文，用于进行3D渲染。
   */
  onAdd(map: any, gl: any) {
    // 解析颜色的方法
    this._parseColor = map.painter.context.clearColor.default.constructor.parse;

    // 初始化场景和相机
    this._scene = new Scene();
    this._camera = new Camera();

    // 创建并设置主光源（定向光）
    this._directionalLight = new DirectionalLight(0xffffff);
    this._directionalLight.position.set(0, -70, 100).normalize();
    this._scene.add(this._directionalLight);

    // 创建并设置环境光
    this._ambientLight = new AmbientLight(0xffffff, 0.4);
    this._scene.add(this._ambientLight);

    // 创建网格材质，根据meshOpacity设定透明度
    this._meshMaterial = new MeshLambertMaterial({
      opacity: this.meshOpacity,
      transparent: this.meshOpacity < 1,
    });

    // 创建雨材质，基于rainColor
    let c = this._parseColor(this.rainColor);
    let alpha = this.rainShow ? 1 : 0;
    this._rainMaterial = new RawShaderMaterial({
      uniforms: {
        time: { type: 'f', value: 0.0 },
        scale: { type: 'f', value: 1.0 },
        color: { type: 'v4', value: new Vector4(c.r, c.g, c.b, alpha) },
      },
      vertexShader: rainVertexShader,
      fragmentShader: rainFragmentShader,
      transparent: alpha < 1,
      side: DoubleSide,
    });

    // 创建雪材质，基于snowColor
    c = this._parseColor(this.snowColor);
    alpha = this.snowShow ? 1 : 0;
    this._snowMaterial = new RawShaderMaterial({
      uniforms: {
        time: { type: 'f', value: 0.0 },
        scale: { type: 'f', value: 1.0 },
        color: { type: 'v4', value: new Vector4(c.r, c.g, c.b, alpha) },
      },
      vertexShader: rainVertexShader,
      fragmentShader: rainFragmentShader,
      transparent: alpha < 1,
      side: DoubleSide,
    });

    // 初始化不同缩放等级的图层分组
    this._baseZoom = Math.round(map.getZoom());
    this._zoomGroups = [];
    for (let i = 0; i <= 24; i++) {
      this._zoomGroups[i] = new Group();
      this._zoomGroups[i].visible = i === this._baseZoom;
      this._scene.add(this._zoomGroups[i]);
    }

    // 设置分级颜色，用于视觉效果
    this._scaleColors = legendColors.map(({ value, color }, index, array) => {
      const nextValue =
        index < array.length - 1 ? array[index + 1].value : Infinity;
      value = (value + nextValue) / 2;
      return [value + 32, new Color(color)];
    });

    // 将当前雨雪效果图层与地图关联，并设置图层的可见缩放范围
    this._map = map;
    this._map.setLayerZoomRange(this.id, this.minzoom, this.maxzoom);
    this._map.on('zoom', this._onZoom);

    // 初始化WebGL渲染器
    this._renderer = new WebGLRenderer({
      canvas: map.getCanvas(),
      context: gl,
      antialias: true,
    });

    // 配置渲染器不自动清空画布，以便进行雨雪效果的绘制
    this._renderer.autoClear = false;

    // 刷新数据源，并设置定时器定期刷新
    this._refreshSource();
    this._timer = setInterval(this._refreshSource.bind(this), this._interval);
  }

  onRemove() {
    delete this._parseColor;

    this._scene.remove(this._directionalLight);
    this._directionalLight.dispose();
    delete this._directionalLight;

    this._scene.remove(this._ambientLight);
    this._ambientLight.dispose();
    delete this._ambientLight;

    this._meshMaterial.dispose();
    delete this._meshMaterial;

    this._rainMaterial.dispose();
    delete this._rainMaterial;

    delete this._baseZoom;
    for (let i = 0; i <= 24; i++) {
      this._scene.remove(this._zoomGroups[i]);
    }
    delete this._zoomGroups;

    delete this._scaleColors;

    delete this._camera;
    delete this._scene;

    this._renderer.dispose();
    delete this._renderer;

    this._map.off('zoom', this._onZoom);
    this._removeSource();
    delete this._map;

    clearInterval(this._timer);
    delete this._timer;
  }

  /**
   * 渲染雨雪效果的函数。
   * @param gl WebGL渲染上下文，用于进行图形渲染。
   * @param matrix 用于调整相机视图的矩阵，影响渲染结果的视角。
   * 此函数首先更新材质的uniforms（如时间、缩放），然后设置相机的投影矩阵，
   * 最后重置渲染状态并渲染场景。如果设置了需要重绘，则触发地图的重绘。
   */
  render(gl: any, matrix: any) {
    // 获取当前地图的缩放级别
    const zoom = this._map.getZoom();

    // 更新雨的材质时间及缩放统一变量
    this._rainMaterial.uniforms.time.value = performance.now() * 0.0006;
    this._rainMaterial.uniforms.scale.value = Math.pow(
      2,
      this._baseZoom - zoom - (zoom >= 10.5 ? 1 : 0),
    );
    // 更新雪的材质时间及缩放统一变量
    this._snowMaterial.uniforms.time.value = performance.now() * 0.00015;
    this._snowMaterial.uniforms.scale.value = Math.pow(
      2,
      this._baseZoom - zoom - (zoom >= 10.5 ? 1 : 0),
    );
    // 设置相机的投影矩阵，以适应当前的视图矩阵
    this._camera.projectionMatrix = new Matrix4().fromArray(matrix);
    // 重置渲染状态，准备进行渲染
    this._renderer.resetState();
    // 执行渲染
    this._renderer.render(this._scene, this._camera);
    // 如果设置了需要重绘，则触发地图的重绘流程
    if (this.repaint) {
      this._map.triggerRepaint();
    }
  }

  _onZoom() {
    this._baseZoom = Math.round(this._map.getZoom());
    for (let i = 0; i <= 24; i++) {
      this._zoomGroups[i].visible = i === this._baseZoom;
    }
  }

  /**
   * 刷新数据源。
   * 该方法通过重新从服务器获取数据，并更新地图上的图层来刷新当前的数据源。
   * 该过程包括移除旧的数据源、添加新的数据源和图层，以及触发一个刷新事件。
   */
  _refreshSource() {
    const sourceId = this.source;
    const map = this._map;
    this._removeSource(); // 移除当前地图上的旧数据源

    // 添加新的数据源到地图
    map.addSource(sourceId, {
      type: 'raster',
      tiles: tiles, // 使用新数据更新瓦片URL
      tileSize,
      minzoom,
      maxzoom,
    });

    const source = map.getSource(sourceId);

    // 给新数据源附加自定义属性和方法
    source._parentLayer = this;
    source._tileDict = {};
    source.loadTile = loadTile;
    source.unloadTile = unloadTile;

    // 在地图上添加一个新的Raster图层，使用新数据源
    map.addLayer(
      {
        id: sourceId,
        type: 'raster',
        source: sourceId,
        paint: { 'raster-opacity': 0 },
      },
      this.id,
    );
  }

  _removeSource() {
    const sourceId = this.source;
    const map = this._map;
    if (map) {
      const source = map.getSource(sourceId);

      if (source) {
        map.removeLayer(sourceId);
        map.removeSource(sourceId);
        delete source._parentLayer;
      }
    }
  }

  // 修改雨是否显示
  setRainShow(boo: boolean) {
    this.rainShow = boo;
    const alpha = boo ? 1 : 0;
    if (this._parseColor && this._rainMaterial) {
      const { r, g, b, a } = this._parseColor(this.rainColor);

      this._rainMaterial.uniforms.color.value = new Vector4(r, g, b, alpha);
      this._rainMaterial.transparent = alpha < 1;
    }
    return this;
  }
  setRainColor(rainColor: string) {
    this.rainColor = rainColor || '#ccf';
    if (this._parseColor && this._rainMaterial) {
      const { r, g, b, a } = this._parseColor(this.rainColor);

      this._rainMaterial.uniforms.color.value = new Vector4(r, g, b, a);
      this._rainMaterial.transparent = a < 1;
    }
    return this;
  }

  // 修改雪是否显示
  setSnowShow(boo: boolean) {
    this.snowShow = boo;
    const alpha = boo ? 1 : 0;
    if (this._parseColor && this._snowMaterial) {
      const { r, g, b, a } = this._parseColor(this.snowColor);

      this._snowMaterial.uniforms.color.value = new Vector4(r, g, b, alpha);
      this._snowMaterial.transparent = alpha < 1;
    }
  }
  setSnowColor(snowColor: string) {
    this.snowColor = snowColor || '#fff';
    if (this._parseColor && this._snowMaterial) {
      const { r, g, b, a } = this._parseColor(this.snowColor);

      this._snowMaterial.uniforms.color.value = new Vector4(r, g, b, a);
      this._snowMaterial.transparent = a < 1;
    }
    return this;
  }

  setMeshOpacity(meshOpacity: number) {
    this.meshOpacity = valueOrDefault(meshOpacity, 0.1);
    if (this._meshMaterial) {
      this._meshMaterial.opacity = meshOpacity;
      this._meshMaterial.transparent = meshOpacity < 1;
    }
    return this;
  }

  getLegendHTML() {
    return [
      '<div style="font-size: 10px; line-height: 14px;"><div>dBZ</div>',
      ...legendColors
        .slice(1)
        .reverse()
        .map(
          (item) => `
                <div>
                    <div style="display: inline-block; vertical-align: top; width: 14px; height: 14px; background-color: ${item.color}; border: solid 0.5px #aaa;"></div>
                    <div style="display: inline-block; vertical-align: top;">${item.value}</div>
                </div>
            `,
        ),
      '</div>',
    ].join('');
  }
}
