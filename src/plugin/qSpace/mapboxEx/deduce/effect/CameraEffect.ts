import {
  getQMap,
  CameraData,
  ViewingAngleModes,
  viewingAngleModesObj,
  QMapGl,
} from '../../../core';
import Effect from './Effect';
import {
  addEventFrame,
  clearEventFrame,
  getEventFrame,
} from '../../../util/requestAnimationFrameFn';

let sp: number = 8;
let tt: number = -1;

const animate = (map: any, obj: any) => {
  const rotateCamera = (timestamp: number) => {
    if (timestamp != 0) {
      const bearing = obj?.bearing || 0;
      if (tt == -1) {
        tt = timestamp;
      }

      const a = timestamp - tt;
      const b = a / 1000;
      const c = b % 360;
      const d = c * sp;
      const bea = d + bearing;

      map.rotateTo(bea, { duration: 0 });
    }
  };
  addEventFrame({
    name: 'cameraEffectUpdate',
    func: (time: number) => {
      rotateCamera(time);
    },
  });
};

const stopAnimate = () => {
  clearEventFrame('cameraEffectUpdate');
  tt = -1;
};

class CameraEffect extends Effect {
  // 本次时间内 原始数据

  changeData: CameraData;

  isRotate: boolean = false;
  isAnimate: boolean = false;

  constructor() {
    super();
    const obj = this.getCameraParms();

    this.changeData = JSON.parse(JSON.stringify(obj));
  }

  update(
    runTime: number,
    viewingAngleMode: ViewingAngleModes,
    unit_timeStamp: number,
    speed: number,
  ) {
    if (runTime < this.startTime && runTime < this.endTime) {
    } else if (runTime >= this.startTime && runTime <= this.endTime) {
      if (this.isRotate) {
        if (!getEventFrame('cameraEffectUpdate')) {
          const map = getQMap()?.getMap();
          const obj = this.getCameraParms();
          animate(map, obj);
        }
      } else {
        stopAnimate();

        if (this.isAnimate) {
        } else {
          this.isAnimate = true;
          this.updateCamera(runTime, viewingAngleMode, unit_timeStamp, speed);
        }
      }
    } else if (runTime > this.startTime && runTime > this.endTime) {
    }
  }

  // 更新相机
  updateCamera(
    runTime: number,
    viewingAngleMode: ViewingAngleModes,
    unit_timeStamp: number,
    speed: number,
  ) {
    const timeD = Math.abs(this.startTime - this.endTime);
    const changeData: any = { ...this.changeData };

    const map = getQMap()?.getMap();

    let viewingObj: any = {};
    if (viewingAngleModesObj[viewingAngleMode]) {
      let obj: any = viewingAngleModesObj[viewingAngleMode];

      if (obj.pitch) {
        viewingObj.pitch = obj.pitch;
      }
      if (obj.zoom) {
        viewingObj.zoom = obj.zoom;
      }
    }

    map.easeTo({
      center: [changeData.longitude, changeData.latitude],
      zoom: changeData.zoom,
      pitch: changeData.pitch,
      bearing: changeData.bearing,
      curve: 1,
      duration: (timeD / unit_timeStamp / speed) * 1000,
      easing(t: any) {
        return t;
      },
      ...viewingObj,
    });
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

  restore() {
    this.stopAnimate();
  }

  stopAnimate() {
    this.isAnimate = false;
    stopAnimate();
  }

  setChangeData(item: any) {
    this.changeData = { ...this.changeData, ...item };
  }

  setIsRotate(boo: boolean) {
    this.isRotate = boo;
  }

  toObject() {
    let obj: any = {
      indexNumber: this.indexNumber,
      startTime: this.startTime,
      endTime: this.endTime,
      changeData: this.changeData,
      name: this.name,
      isRotate: this.isRotate,
    };
    return obj;
  }

  loadObject(obj: any) {
    this.setStartTime(obj.startTime);
    this.setEndTime(obj.endTime);
    this.setIndexNumber(obj.indexNumber);
    this.setName(obj.name);
    this.setIsRotate(obj.isRotate);

    this.changeData = obj.changeData;
  }
}

export default CameraEffect;
