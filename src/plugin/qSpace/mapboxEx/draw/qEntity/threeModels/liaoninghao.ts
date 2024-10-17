import * as mt3d from '../../../../mt3d/index';
import ModelCore from './modelCore';
import { getQMap, EntityModel } from '../../../../core';
class LiaoNingHaoModel extends ModelCore {
  customLayer: CustomLayer | null = null;

  modelName: string = 'liaoninghao.glb';
  constructor(
    map: any,
    factory: EntityModel,
    style: object = {},
    opts: object = {},
  ) {
    super(map, factory, style, opts);
    this.controlPointHasMid = false;
  }

  updateLayers(type: string, item: any) {
    if (this.customLayer) {
      const qStyles = this.getQStyles();
      const layoutObj: any = qStyles.getLayoutObj();
      const height = layoutObj['_model-height'];
      const scale = layoutObj['_model-scale'];

      const center = this.qGeometry.getCenter();
      const location: [number, number] = [center[0], center[1]];
      const rotate: [number, number, number] = [90, 0, 0];
      const loc = mt3d.fromLngLat(location);

      const _mesh = this.customLayer._mesh;
      const mesh = _mesh.mesh;
      mesh.position.set(loc[0], loc[1], height);
      mesh.scale.set(scale, scale, scale);

      const map = getQMap()?.getMap();
      map.triggerRepaint();
    }
  }

  createModelLayer() {
    const allid = this.getAllId();
    const pid = allid.pid;

    const qStyles = this.getQStyles();
    const layoutObj: any = qStyles.getLayoutObj();
    const height = layoutObj['_model-height'];
    const scale = layoutObj['_model-scale'];

    let center = this.qGeometry.getCenter();
    let location: [number, number] = [center[0], center[1]];
    let rotate: [number, number, number] = [90, 0, 0];

    let customLayer = new CustomLayer(
      pid,
      this.map,
      this.modelName,
      [...location],
      height,
      scale,
      rotate,
    );
    this.customLayer = customLayer;
    if (!this.map) return;
    const lay = this.map.getLayer(pid);
    if (lay) this.map.removeLayer(pid);
    this.map.addLayer(customLayer);
  }
}

// 自定义图层
class CustomLayer {
  id: string = '';
  type = 'custom';
  renderingMode = '3d';

  map: any;
  _scene: any;
  _mesh: any;

  modelName: string = '';
  position: [number, number];
  height: number;
  scale: number;
  rotate: [number, number, number];
  constructor(
    id: string,
    map: any,
    modelName: string,
    position: [number, number],
    height: number,
    scale: number,
    rotate: [number, number, number],
  ) {
    this.id = id;
    this.map = map;

    this.modelName = modelName;
    this.position = position;
    this.height = height;
    this.scale = scale;
    this.rotate = rotate;
  }

  onAdd(map: any, gl: any) {
    this._scene = new mt3d.Scene({
      map: map,
      gl: gl,
    });

    // 光
    this._scene.addObject({
      type: 'light',
      position: mt3d.fromLngLat([120, 40]),
      appearance: {
        lightType: 'ambient',
        color: '#ffffff',
        intensity: 1,
      },
    });

    // 模型
    this._mesh = this._scene.addObject({
      type: 'gltf',
      position: [...mt3d.fromLngLat(this.position), this.height],
      appearance: {
        url: this.modelName,
        id: this.id,
        rotate: this.rotate,
        scale: [this.scale, this.scale, this.scale],
      },
    });
  }
  render() {
    this._scene.update();
    // this.map.triggerRepaint()
  }
}

export default LiaoNingHaoModel;
