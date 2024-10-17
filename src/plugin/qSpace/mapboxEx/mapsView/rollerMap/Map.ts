import * as turf from '@turf/turf';
import {
  BaseScene,
  BusinessScene,
  MapSource,
  QLayerDataModel,
  QMapGl,
  defStyle,
  QCompare,
  CameraOptions,
} from '../../../core';
import { message } from 'antd';
import { addImage, createSelectSvg } from '../../func';

export class RollerQMaps {
  roller_map_1: RollerQMap;
  roller_map_2: RollerQMap;

  maps: any;

  constructor(mapid: string, callback: any) {
    let loading = 0;

    this.roller_map_1 = new RollerQMap('roller_map_1', () => {
      loading++;
      if (loading == 2) {
        if (callback) callback();
      }
    });
    this.roller_map_2 = new RollerQMap('roller_map_2', () => {
      loading++;
      if (loading == 2) {
        if (callback) callback();
      }
    });

    this.maps = new QCompare(
      this.roller_map_1.map,
      this.roller_map_2.map,
      `#${mapid}`,
      {},
    );
  }

  /**
   * 添加图层
   * @param item  原数据
   * @param ab  1  2  1左边  2右边
   */
  addLayers(item: QLayerDataModel, ab: any) {
    if (ab === 1) {
      this.roller_map_1?.addLayers(item);
    }
    if (ab === 2) {
      this.roller_map_2?.addLayers(item);
    }
  }

  removeLayer(layerId: string, ab: any) {
    if (ab === 1) {
      this.roller_map_1?.removeLayer(layerId);
    }
    if (ab === 2) {
      this.roller_map_2?.removeLayer(layerId);
    }
  }

  // 基础底图场景-----------------
  getBaseScene(): BaseScene {
    return this.roller_map_1?.baseScene;
  }
  setBaseScene(scene?: any) {
    this.roller_map_1?.setBaseScene(scene);
    this.roller_map_2?.setBaseScene(scene);
  }
  // 业务场景-----------------
  getBusinessScene(): BusinessScene[] {
    return this.roller_map_1?.businessScene;
  }
  addBusinessScene(scene?: any) {
    this.roller_map_1?.addBusinessScene(scene);
    this.roller_map_2?.addBusinessScene(scene);
  }
  removeBusinessScene(scene?: any) {
    this.roller_map_1?.removeBusinessScene(scene);
    this.roller_map_2?.removeBusinessScene(scene);
  }

  removeBusinessSceneAll() {
    this.roller_map_1?.removeBusinessSceneAll();
    this.roller_map_2?.removeBusinessSceneAll();
  }

  getCameraParms() {
    const center = this.maps._mapA.getCenter();
    let obj = {
      pitch: this.maps._mapA.getPitch(), //俯仰角
      bearing: this.maps._mapA.getBearing(), //方位角
      zoom: this.maps._mapA.getZoom(),
      center: [center.lng, center.lat], //相机位置
    };
    return obj;
  }

  remove() {
    this.roller_map_1.map.remove();
    this.roller_map_2.map.remove();
    this.maps.remove();
  }

  resize() {
    if (this.maps) {
      this.maps._mapA.resize();
      this.maps._mapB.resize();
    }
  }

  jumpTo = (obj: any) => {
    this.maps._mapA.jumpTo(obj);
  };

  flyTo = (obj: any) => {
    this.maps._mapA.flyTo(obj);
  };

  locationGeometry(geometry: any, options: CameraOptions = {}) {
    let _options = {
      ...options,
      padding: 100,
    };
    if (geometry != null) {
      let extent = turf.bbox(geometry);
      let bbox1 = [
        [this.correctLongitude(extent[0]), this.correctLatitude(extent[1])],
        [this.correctLongitude(extent[2]), this.correctLatitude(extent[3])],
      ];
      this.maps._mapA.fitBounds(bbox1, {
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

export class RollerQMap {
  /**
   * 载入基础场景
   * 底图切换
   * 数据为场景
   * 使用了图层和源
   */
  baseScene: BaseScene;
  /**
   * 载入 业务场景
   * 数据为场景
   * 使用了图层和源
   */
  businessScene: BusinessScene[] = [];

  // 加载的数据
  layerData: MapSource[] = [];

  map: any;
  mapId: string;
  mapload: boolean = false;

  constructor(container: string, callback: any) {
    this.mapId = container;
    this.map = this.createMap(container, callback);

    //底图  （场景）
    this.baseScene = new BaseScene(this.map);
  }

  createMap(container: string, callback: any) {
    let map = new QMapGl.Map({
      container: container,
      style: { ...defStyle },
      // localIdeographFontFamily: false, //千万不要动  会影响字体
    });

    map.on('load', (e: any) => {
      addImage(map, () => {
        // 添加默认的选中框
        createSelectSvg(map);
        // 设置氛围
        map.setFog({
          color: 'rgb(255, 255, 255)',
          // color: 'rgb(186, 210, 235)',
          'high-color': 'rgb(36, 92, 223)',
          'horizon-blend': 0.02,
          'space-color': 'rgb(11, 11, 25)',
          'star-intensity': 0.6,
        });

        if (callback) {
          callback();
        }
      });
    });

    return map;
  }

  // 基础底图场景-----------------
  getBaseScene(): BaseScene {
    return this.baseScene;
  }
  setBaseScene(scene?: any) {
    this.baseScene.setScene(scene);
  }
  // 业务场景-----------------
  getBusinessScene(): BusinessScene[] {
    return this.businessScene;
  }
  addBusinessScene(scene?: any) {
    let have = this.businessScene.findIndex(
      (item: BusinessScene) => item.id == scene.id,
    );
    if (have > -1) {
      this.businessScene[have].emptyScene();
      this.businessScene.splice(have, 1);
    } else {
      let businessScene = new BusinessScene(this.map);
      businessScene.setScene(scene);
      this.businessScene.push(businessScene);
    }
  }

  removeBusinessScene(scene?: any) {
    let have = this.businessScene.findIndex(
      (item: BusinessScene) => item.id == scene.id,
    );
    if (have > -1) {
      this.businessScene[have].emptyScene();
      this.businessScene.splice(have, 1);
    }
  }
  removeBusinessSceneAll() {
    this.businessScene.forEach((item: BusinessScene) => {
      item.emptyScene();
    });
    this.businessScene = [];
  }
  /**
   * 添加图层
   * @param item  原数据
   */
  addLayers(item: QLayerDataModel) {
    let map = this.map;
    let layers: MapSource[] = this.layerData;

    if (this.removeLayer(item.id)) return;
    let which = item.which;
    if (which?.code === '0203') {
      message.warning('卷帘模式不可添加地形数据');
      return;
    }
    if (which?.code === '0103') {
      message.warning('卷帘模式不可添加PDF');
      return;
    }
    if (which) {
      let source = new MapSource(map, item);
      item.layers.forEach((layer: any) => {
        source.addLayers(layer);
      });
      layers.push(source);
    } else {
      message.warning('暂不支持此模板数据！');
    }
  }
  removeLayer(layerId: string) {
    let layers: MapSource[] = this.layerData;

    let idx = layers.findIndex((layer: MapSource) => layer.id == layerId);
    if (idx > -1) {
      //移除图层
      layers[idx].remove();
      layers.splice(idx, 1);
      return true;
    }
    return false;
  }
  // getCameraParms() {
  //   const center = this.map.getCenter();
  //   let obj = {
  //     pitch: this.map.getPitch(), //俯仰角
  //     bearing: this.map.getBearing(), //方位角
  //     zoom: this.map.getZoom(),
  //     center: [center.lng, center.lat], //相机位置
  //   };
  //   return obj;
  // }
  // resize() {
  //   if (this.map) {
  //     this.map.resize();
  //   }
  // }

  // remove = () => {
  //   if (this.map) {
  //     this.map.remove();
  //   }
  // };
}
