import DeduceBase from './Base';
import {
  getQMap,
  CameraData,
  CameraEffect,
  ViewingAngleModes,
} from '../../../core';

class DeduceCamera extends DeduceBase {
  dtype: string = 'camera';

  id: string = 'camera_entity'; //唯一值
  name: string = '相机'; //唯一值

  effects: Array<CameraEffect> = [];

  // 本次时间内 原始数据
  oldData: CameraData | null = null;

  constructor() {
    super();
  }

  update(
    runTime: number,
    viewingAngleMode: ViewingAngleModes,
    unit_timeStamp: number,
    speed: number,
  ) {
    if (!this.oldData) {
      const obj = this.getCameraParms();
      this.oldData = JSON.parse(JSON.stringify(obj));
    }
    if (this.checked) {
      this.effects.forEach((it: CameraEffect) => {
        it.update(runTime, viewingAngleMode, unit_timeStamp, speed);
      });
    }
  }

  restore() {
    if (this.oldData) {
      const map = getQMap()?.getMap();
      map.stop();
      // map.jumpTo({
      //   center: [this.oldData.longitude, this.oldData.latitude],
      //   zoom: this.oldData.zoom,
      //   pitch: this.oldData.pitch,
      //   bearing: this.oldData.bearing,
      // });
    }
    this.oldData = null;
    this.effects.forEach((effect: CameraEffect, index: number) => {
      effect.restore();
    });
  }

  stopAnimate() {
    this.effects.forEach((effect: CameraEffect, index: number) => {
      effect.stopAnimate();
    });
  }

  createEffects(): CameraEffect | null {
    let effect = new CameraEffect();
    effect.setIndexNumber(this.effects.length);
    return effect;
  }

  removeEffects(num: number) {
    this.effects.splice(num, 1);
  }

  // 重新排序
  sortEffects() {
    this.effects.forEach((effect: CameraEffect, index: number) => {
      effect.setIndexNumber(index);
    });
  }

  toObject() {
    let obj: any = {
      dtype: this.dtype,
      id: this.id,
      name: this.name,
      checked: this.checked,
      effects: this.effects.map((item: CameraEffect) => {
        return item.toObject();
      }),
    };
    return obj;
  }

  loadObject(obj: any) {
    let checked = obj.checked;
    this.setChecked(checked);
    let effects = obj.effects;
    this.effects = [];
    effects.forEach((item: any) => {
      let effect = new CameraEffect();
      effect.loadObject(item);
      this.effects.push(effect);
    });
    this.sortEffects();
  }

  addTrajectory(effects: any) {
    effects.forEach((item: any) => {
      let effect = new CameraEffect();
      effect.loadObject(item);
      this.effects.push(effect);
    });
    this.sortEffects();
  }

  // 获取相机属性
  getCameraParms(): CameraData | null {
    const map = getQMap()?.getMap();
    if (map) {
      const center = map.getCenter();
      let obj: CameraData = {
        pitch: map.getPitch(), //俯仰角
        bearing: map.getBearing(), //方位角
        zoom: map.getZoom(),
        longitude: center.lng, //相机位置 经度
        latitude: center.lat, //纬度
      };
      return obj;
    }
    return null;
  }
}

export default DeduceCamera;
