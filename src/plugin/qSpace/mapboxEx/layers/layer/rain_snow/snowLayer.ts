import {
  legendColors,
  loadTile,
  maxzoom,
  minzoom,
  rainFragmentShader,
  rainVertexShader,
  tileSize,
  unloadTile,
  valueOrDefault,
} from './core';
import RainLayer from './rainLayer';

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

/**
 * 雪层
 */
export default class SnowLayer extends RainLayer {
  _snowMaterial: any;

  constructor(options: any) {
    super(options);

    this.source = options.source || 'snow_custom_layer';

    // 雪的颜色
    this.color = options.color || '#fff';
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

    // 创建雪材质，基于snowColor
    let c = this._parseColor(this.color);
    let alpha = this.show ? 1 : 0;
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

    this._snowMaterial.dispose();
    delete this._snowMaterial;

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
    const snowUrl = window.qConf.snowUrl;
    if (!snowUrl) {
      return;
    }

    // 添加新的数据源到地图
    map.addSource(sourceId, {
      type: 'raster',
      tiles: [snowUrl], // 使用新数据更新瓦片URL
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

  // 修改雪是否显示
  setSnowShow(boo: boolean) {
    this.show = boo;
    const alpha = boo ? 1 : 0;
    if (this._parseColor && this._snowMaterial) {
      const { r, g, b, a } = this._parseColor(this.color);

      this._snowMaterial.uniforms.color.value = new Vector4(r, g, b, alpha);
      this._snowMaterial.transparent = alpha < 1;
    }
  }
  setSnowColor(snowColor: string) {
    this.color = snowColor || '#fff';
    if (this._parseColor && this._snowMaterial) {
      const { r, g, b, a } = this._parseColor(this.color);

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
}
