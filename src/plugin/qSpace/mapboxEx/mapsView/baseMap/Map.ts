import * as turf from '@turf/turf';
import { CameraOptions, QMapGl, QProject, defStyle } from '../../../core';

/**
 *
 */
export default class BaseQMap {
  //地图本身
  map: any;
  mapId: string;

  constructor(container: string) {
    this.map = this.createMap(container);
    this.mapId = container;
  }

  createMap(container: string) {
    let map = new QMapGl.Map({
      container: container, // container id
      style: { ...defStyle },
      antialias: true,
      // localIdeographFontFamily: false, //千万不要动  会影响字体
      // localFontFamily: true,
      // projection: 'globe'
      // maxPitch:85
    });

    // map.addControl(new MapboxGl.NavigationControl(), 'bottom-right');
    // map.addControl(new MapboxGl.ScaleControl({
    //   maxWidth: 80,
    //   unit: 'metric'
    // }))

    return map;
  }
  remove = () => {
    if (this.map) {
      this.map.remove();
    }
  };
  resize() {
    if (this.map) {
      this.map.resize();
    }
  }
  getMap() {
    return this.map;
  }

  getStyle() {
    let map = this.map;
    if (map) {
      return map.getStyle();
    }
  }
  setGlobe(boo: boolean, zoom: number = 2) {
    const map = this.map;
    if (boo) {
      map.setZoom(zoom);
      map.setProjection('globe');
    } else {
      map.setProjection('mercator');
    }
  }

  addImageToMap(name: string, image: any, options: any = {}) {
    if (this.map.hasImage(name)) {
      this.map.removeImage(name);
    }
    this.map.addImage(name, image, options);
  }
  updateImageToMap(name: string, image: any, options: any = {}) {
    if (this.map.hasImage(name)) {
      this.map.updateImage(name, image);
    } else {
      this.map.addImage(name, image, options);
    }
  }
  loadImageToMap(name: string, url: string, options: any = {}, callback: any) {
    this.map.loadImage(url, (error: any, image: any) => {
      if (error) throw error;
      this.addImageToMap(name, image, options);
      if (callback) callback();
    });
  }
  getCameraParms() {
    const center = this.map.getCenter();
    let obj = {
      pitch: this.map.getPitch(), //俯仰角
      bearing: this.map.getBearing(), //方位角
      zoom: this.map.getZoom(),
      position: [center.lng, center.lat], //相机位置
    };
    return obj;
  }

  jumpTo = (obj: any) => {
    this.map.jumpTo(obj);
  };

  flyTo = (obj: any) => {
    this.map.flyTo(obj);
  };

  //定位
  locationGeometry(geometry: any, options: CameraOptions = {}) {
    let _options = {
      padding: 100,
      ...options,
    };
    if (geometry != null) {
      let extent = turf.bbox(geometry);
      let bbox1 = [
        [this.correctLongitude(extent[0]), this.correctLatitude(extent[1])],
        [this.correctLongitude(extent[2]), this.correctLatitude(extent[3])],
      ];
      this.map.fitBounds(bbox1, {
        linear: false,
        ..._options,
      });
    }
  }

  // 校准经度
  correctLongitude(num: number): number {
    if (num < -180) {
      return -180;
    } else if (num > 180) {
      return 180;
    }
    return num;
  }

  // 校准纬度
  correctLatitude(num: number): number {
    if (num < -90) {
      return -90;
    } else if (num > 90) {
      return 90;
    }
    return num;
  }
}
