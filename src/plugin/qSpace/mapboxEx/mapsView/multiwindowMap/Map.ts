import * as turf from '@turf/turf';
import {
  BaseScene,
  BusinessScene,
  MapSource,
  QLayerDataModel,
  QMapGl,
  defStyle,
  getQMap,
  CameraOptions,
} from '../../../core';
import { message } from 'antd';
import { addImage, createSelectSvg } from '../../func';

function syncEvent() {
  let multiwindowMaps = getQMap()?.getMultiwindowQMap();
  if (multiwindowMaps) {
    let map = multiwindowMaps.getOneMap(multiwindowMaps.mouseId);
    let otherMap = multiwindowMaps.getOtherMap(multiwindowMaps.mouseId);
    let parmas = map?.getCameraParms();
    for (const key in otherMap) {
      const mm = otherMap[key];
      mm.jumpTo(parmas);
    }
  }
}

export class MultiwindowQMaps {
  maps: any = {};

  mouseId: string = '';

  constructor(multiwindowMapList: any[], callback: any) {
    let loading = 0;

    let map_a = new MultiwindowQMap(multiwindowMapList[0].mapId, () => {
      loading++;
      if (loading == 4) {
        if (callback) callback();
      }
    });
    let map_b = new MultiwindowQMap(multiwindowMapList[1].mapId, () => {
      loading++;
      if (loading == 4) {
        if (callback) callback();
      }
    });
    let map_c = new MultiwindowQMap(multiwindowMapList[2].mapId, () => {
      loading++;
      if (loading == 4) {
        if (callback) callback();
      }
    });
    let map_d = new MultiwindowQMap(multiwindowMapList[3].mapId, () => {
      loading++;
      if (loading == 4) {
        if (callback) callback();
      }
    });

    let maps: any = {};
    maps[multiwindowMapList[0].mapId] = map_a;
    maps[multiwindowMapList[1].mapId] = map_b;
    maps[multiwindowMapList[2].mapId] = map_c;
    maps[multiwindowMapList[3].mapId] = map_d;

    this.maps = maps;
  }

  remove() {
    for (const key in this.maps) {
      const map = this.maps[key];
      map?.remove();
    }
  }

  addSyncEvent = (mapId: string, hMouse: any) => {
    this.mouseId = mapId;
    if (hMouse.mapId == mapId) {
    } else {
      let maps = this.maps;
      for (const key in maps) {
        const mm = maps[key];
        mm.deleteEvent(syncEvent);
      }
      let map = this.getOneMap(mapId);
      map.addEvent(syncEvent);
    }
  };
  getOneMap(mapId: string) {
    return this.maps[mapId];
  }

  getOtherMap(mapId: string) {
    let maps = { ...this.maps };
    delete maps[mapId];
    return maps;
  }

  addLayers(item: QLayerDataModel, ab: any) {
    let keys = Object.keys(this.maps);
    let key = keys.find((it: string) => it.indexOf(ab) > -1);
    if (key) {
      this.maps[key]?.addLayers(item);
    }
  }
  removeLayer(layerId: string, ab: any) {
    let keys = Object.keys(this.maps);
    let key = keys.find((it: string) => it.indexOf(ab) > -1);
    if (key) {
      this.maps[key]?.removeLayer(layerId);
    }
  }

  // 基础底图场景-----------------

  setBaseScene(scene?: any) {
    for (const key in this.maps) {
      const map = this.maps[key];
      map?.setBaseScene(scene);
    }
  }
  // 业务场景-----------------

  addBusinessScene(scene?: any) {
    for (const key in this.maps) {
      const map = this.maps[key];
      map?.addBusinessScene(scene);
    }
  }

  removeBusinessScene(scene?: any) {
    for (const key in this.maps) {
      const map = this.maps[key];
      map?.removeBusinessScene(scene);
    }
  }

  removeBusinessSceneAll() {
    for (const key in this.maps) {
      const map = this.maps[key];
      map?.removeBusinessSceneAll();
    }
  }

  getCameraParms() {
    let keys = Object.keys(this.maps);
    const map = this.maps[keys[0]];

    return map.getCameraParms();
  }

  resize() {
    for (const key in this.maps) {
      const map: MultiwindowQMap = this.maps[key];
      map?.resize();
    }
  }

  jumpTo = (obj: any) => {
    for (const key in this.maps) {
      const map: MultiwindowQMap = this.maps[key];
      map?.jumpTo(obj);
    }
  };

  flyTo = (obj: any) => {
    for (const key in this.maps) {
      const map: MultiwindowQMap = this.maps[key];
      map?.flyTo(obj);
    }
  };

  locationGeometry(geometry: any, options: CameraOptions = {}) {
    let _options = {
      ...options,
      padding: 100,
    };
    for (const key in this.maps) {
      const map: MultiwindowQMap = this.maps[key];
      map?.locationGeometry(geometry, _options);
    }
  }
}

export class MultiwindowQMap {
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

  addEvent(event: any) {
    this.map.on('render', event);
  }

  deleteEvent(event: any) {
    this.map.off('render', event);
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

  getCameraParms() {
    const center = this.map.getCenter();
    let obj = {
      pitch: this.map.getPitch(), //俯仰角
      bearing: this.map.getBearing(), //方位角
      zoom: this.map.getZoom(),
      center: [center.lng, center.lat], //相机位置
    };
    return obj;
  }
  resize() {
    if (this.map) {
      this.map.resize();
    }
  }
  remove = () => {
    if (this.map) {
      this.map.remove();
    }
  };
  jumpTo = (obj: any) => {
    this.map.jumpTo(obj);
  };

  flyTo = (obj: any) => {
    this.map.flyTo(obj);
  };

  locationGeometry(geometry: any, options: CameraOptions) {
    if (geometry != null) {
      let extent = turf.bbox(geometry);
      let bbox1 = [
        [this.correctLongitude(extent[0]), this.correctLatitude(extent[1])],
        [this.correctLongitude(extent[2]), this.correctLatitude(extent[3])],
      ];
      this.map.fitBounds(bbox1, {
        linear: false,
        ...options,
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
