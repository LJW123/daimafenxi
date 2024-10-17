import * as mt3d from '../../../../mt3d/index';
import ModelCore from './modelCore';
// import * as THREE from 'three';

import { getQMap, EntityModel } from '../../../../core';

class WeiXingModel extends ModelCore {
  customLayer: CustomLayer | null = null;

  modelName: string = 'weixing.glb';

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
      const _scale = scale / 10;

      const center = this.qGeometry.getCenter();
      const location: [number, number] = [center[0], center[1]];
      const rotate: [number, number, number] = [180, 0, 0];
      const loc = mt3d.fromLngLat(location);

      const _mesh = this.customLayer._mesh;
      const mesh = _mesh.mesh;

      mesh.position.set(loc[0], loc[1], height);
      mesh.scale.set(_scale, _scale, _scale);

      const _helper = this.customLayer._helper;
      const helper = _helper.mesh;
      const camera = helper.camera;

      camera.far = height + 10;
      camera.position.set(loc[0], loc[1], height);
      camera.lookAt(new THREE.Vector3(loc[0], loc[1], 0));
      camera.updateProjectionMatrix();
      helper.update();

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
    const _scale = scale / 10;

    const center = this.qGeometry.getCenter();
    const location: [number, number] = [center[0], center[1]];
    const rotate: [number, number, number] = [180, 0, 0];
    //获取比例

    const customLayer = new CustomLayer(
      pid,
      this.map,
      this.modelName,
      [...location],
      height,
      _scale,
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
  _helper: any;

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
        lightType: 'directional',
        color: '#ffffff',
        offset: [0, -500, 1000],
        target: mt3d.fromLngLat([120, 40]),
        intensity: 5,
      },
    });

    //  光
    this._scene.addObject({
      type: 'light',
      position: mt3d.fromLngLat([120, 40]),
      appearance: {
        lightType: 'directional',
        color: '#ffffff',
        offset: [0, 500, 1000],
        target: mt3d.fromLngLat([120, 40]),
        intensity: 5,
      },
    });

    // 拍照范围
    this._helper = this._scene.addObject({
      type: 'spotLightHelper',
      position: [...mt3d.fromLngLat(this.position), this.height],
      appearance: {
        angle: 30,
      },
    });

    // 卫星
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

    // this._scene.pick.on('click', (data: any) => {
    //   getQMap()?.Evented.fire('modelClick', { data: data });
    // });
  }
  render() {
    this._scene.update();
    // this.map.triggerRepaint()
  }
}

export default WeiXingModel;
