import {
  BaseQMap,
  RollerQMaps,
  MultiwindowQMaps,
  QProject,
  SquareGrid,
  ToolBox,
  MapSource,
  FeatureLayer,
  DrawEntityFactory,
  FeatureHighlightedLayer,
  GeometryHighlightedLayer,
  BaseScene,
  BusinessScene,
  entityList,
  toolList,
  DrawCollection,
  DrawCore,
  QLayerDataModel,
  DeduceCollection,
  exportMap,
  QPagePositionCollection,
  EntityModel,
  ToolModel,
  BaseDefaultLayerModel,
  EmergencyLayer,
  GeometryLayer,
  GeometryLayer2,
  MapType,
  CameraOptions,
  defStyle,
} from '../../core';
// import Threebox from '@/qSpace/threebox/Threebox';
import * as turf from '@turf/turf';

import qWindLayer from '../layers/layer/WindLayer';

import Events from '../../Evented/Events';
import RainLayer from '../layers/layer/rain_snow/rainLayer';
import SnowLayer from '../layers/layer/rain_snow/snowLayer';

import {
  addEventFrame,
  clearEventFrame,
} from '../../util/requestAnimationFrameFn';
import GeometryHighlightedLayer2 from '../layers/other/GeometryHighlightedLayer2';

class QMapModel {
  // 唯一识别id
  id: string = '';
  /**
   * 版本号
   */
  version: number = 1.0;

  // 当前是否是3D
  is3d: boolean = false;

  //--------------------
  // 雨图层
  rain_show: boolean = false;
  rain_layerId: string = 'rain_layer';
  rain_layer: any;

  // 雪图层
  snow_show: boolean = false;
  snow_layerId: string = 'snow_layer';
  snow_layer: any;

  //--------------------
  // 风场图层
  wind_show: boolean = false;
  windLayer: any;

  /**
   * 地图状态  基础底图 normal   卷帘 roller   四窗 multiwindow
   */
  mapStatus: MapType = 'normal';
  /**
   * 是否是预览模式
   */
  preview: boolean = false;
  /**
   * 基本地图
   */
  map: BaseQMap;
  /**
   * 卷帘地图
   */
  rollerQMap: RollerQMaps | null = null;
  /**
   * 四窗地图
   */
  multiwindowQMap: MultiwindowQMaps | null = null;
  /**
   * 方里网
   */
  squareGrid: SquareGrid;
  /**
   * 当前工程   包含数据
   */
  project: QProject = new QProject();
  /**
   * 工具
   */
  toolbox: ToolBox;
  /**
   * 加载的源和图层
   * 不随工程切换
   * 基础数据  初始数据
   */
  sourceData: MapSource[] = [];
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
  /**
   * 载入  feature图层
   */
  featureLayers: FeatureLayer[] = [];
  /**
   * 高亮图层
   * geojson
   */
  featureHighlightedLayer: FeatureHighlightedLayer;
  geometryHighlightedLayer: GeometryHighlightedLayer;
  geometryHighlightedLayer2: GeometryHighlightedLayer2;

  
  /**
   * 创建 绘制 实体 工厂
   * 返回的是 实体
   */
  drawEntityFactory: DrawEntityFactory;
  /**
   * 临时储存数据
   */
  temporaryCollection: Array<DrawCore | DrawCore[]> = new Array();
  /**
   * 存储分析数据集
   */
  analysisCollection: Array<DrawCore | DrawCore[]> = new Array();
  /**
   * 额外标注数据
   */
  markerCollection: Array<DrawCore> = new Array();
  /**
   * 事件
   */
  Evented: any;

  // 地图的导出
  mapExport: exportMap.MapGenerator;

  /**
   * 以下为额外
   */
  emergencyLayer: EmergencyLayer;

  geometryLayer: GeometryLayer;
  geometryLayer2: GeometryLayer2;

  // 自定义添加图层
  customCollection: Array<DrawCore | DrawCore[]> = new Array();

  // threebox
  // tbMap: any;

  /**
   *
   * @param map qmap
   */
  constructor(id: string, map: any) {
    this.id = id;

    this.Evented = new Events();
    this.map = map;

    //方里网
    this.squareGrid = new SquareGrid(map.map);
    //底图  （场景）
    this.baseScene = new BaseScene(map.map);
    //业务场景
    // this.businessScene = new BusinessScene(map.map);

    //实体仓库 工厂
    this.drawEntityFactory = new DrawEntityFactory(map.map);
    //工具
    this.toolbox = new ToolBox(map.map);

    // 导出
    this.mapExport = new exportMap.MapGenerator(map.map);

    //高亮
    this.featureHighlightedLayer = new FeatureHighlightedLayer(map.map);
    this.geometryHighlightedLayer = new GeometryHighlightedLayer(map.map);
    this.geometryHighlightedLayer2 = new GeometryHighlightedLayer2(map.map);
    // 额外
    this.emergencyLayer = new EmergencyLayer(map.map);

    this.geometryLayer = new GeometryLayer(map.map);
    this.geometryLayer2 = new GeometryLayer2(map.map);

    // this.tbMap = new Threebox(
    //   map.map,
    //   map.map.getCanvas().getContext('webgl'),
    //   { defaultLights: true },
    // );

    this.update();
  }
  update() {
    let updateData = (time: any) => {
      // 推演是否在进行
      if (this.getDeduceStart()) {
        this.getDeduceCollection().update(time);
      } else {
        this.getDrawCollection().update();
      }
      // 计算数据
      this.analysisCollection.forEach((item: any) => {
        if (item instanceof Array) {
          item.forEach((it: DrawCore) => {
            it.update();
          });
        } else {
          item.update();
        }
      });
      // 临时数据
      this.temporaryCollection.forEach((item: any) => {
        if (item instanceof Array) {
          item.forEach((it: DrawCore) => {
            it.update();
          });
        } else {
          item.update();
        }
      });
      // 自定义数据
      this.customCollection.forEach((item: any) => {
        if (item instanceof Array) {
          item.forEach((it: DrawCore) => {
            it.update();
          });
        } else {
          item.update();
        }
      });

      // 额外标注数据
      this.markerCollection.forEach((item: any) => {
        if (item instanceof Array) {
          item.forEach((it: DrawCore) => {
            it.update();
          });
        } else {
          item.update();
        }
      });
    };
    addEventFrame({
      name: 'qMapUpdate',
      func: () => {
        updateData(Date.now());
      },
    });
  }

  // 切换工程
  setCurrentProject(project: QProject) {
    clearEventFrame('qMapUpdate');

    this.project = project;
    setTimeout(() => {
      this.update();
    }, 100);
  }

  // 销毁 qMap
  destroy() {
    this.map.remove();

    this.featureHighlightedLayer.destroy();
    this.geometryHighlightedLayer.destroy();
    this.geometryHighlightedLayer2.destroy();
  }

  // 重置工程
  resetProject() {
    if (this.project) {
      this.project.resetProject();

      this.featureHighlightedLayer.removeLayer();
      this.geometryHighlightedLayer.removeLayerAll();
      this.geometryHighlightedLayer2.removeLayerAll();
      this.emergencyLayer.removeLayer();
      this.geometryLayer.removeLayerAll();

      this.removeBusinessSceneAll();
      this.setBaseScene();
      this.project = new QProject();
    }
  }
  //获取 地图的当前模式
  getMapStatus(): MapType {
    return this.mapStatus;
  }
  //修改 地图的当前模式
  setMapStatus(val: MapType) {
    this.mapStatus = val;
  }
  getMap() {
    return this.map.getMap();
  }
  setRollerQMap(map: RollerQMaps | null) {
    this.rollerQMap = map;
  }
  getRollerQMap(): RollerQMaps | null {
    return this.rollerQMap;
  }
  setMultiwindowQMap(map: MultiwindowQMaps | null) {
    this.multiwindowQMap = map;
  }
  getMultiwindowQMap(): MultiwindowQMaps | null {
    return this.multiwindowQMap;
  }

  //获取版本号
  getVersion() {
    return this.version;
  }
  //获取是否是3D模式
  getIs3d(): boolean {
    return this.is3d;
  }
  //修改是否是3D模式
  setIs3d(boo: boolean, zoom: number = 2) {
    this.is3d = boo;
    this.map.setGlobe(boo, zoom);
  }

  //获取是否是预览
  getPreview(): boolean {
    return this.preview;
  }
  //修改是否是预览状态
  setPreview(boo: boolean) {
    this.preview = boo;
  }

  getNowQProject(): QProject {
    return this.project;
  }
  getDrawCollection(): DrawCollection {
    return this.project.drawCollection;
  }
  getDrawEntitys(): DrawCore[] {
    return this.project.drawCollection.drawEntitys;
  }
  getDeduceCollection(): DeduceCollection {
    return this.project.deduceCollection;
  }
  // 获取推演是否在运行
  getDeduceStart(): boolean {
    return this.project.deduceCollection.getStart();
  }
  getQPagePositionCollection(): QPagePositionCollection {
    return this.project.qPagePositionCollection;
  }
  getEntitys(): EntityModel[] {
    return entityList;
  }
  removeEntity(qEntity: DrawCore) {
    let drawCollection = this.getDrawCollection();
    drawCollection.removeEntity(qEntity);
  }
  getCameraParms() {
    return this.map.getCameraParms();
  }
  //激活工具
  activateTool(toolName: string, opts?: any) {
    this.toolbox.activateTool(toolName, opts);
  }
  //注销工具
  disableTool(toolName: string = '') {
    this.toolbox.disableTool(toolName);
    this.Evented.fire('updateNum', {});
  }
  // 获取目前工具
  getNowTool() {
    return this.toolbox.getNowTool();
  }
  // 获取目前工具的名字
  getNowToolName() {
    return this.toolbox.getNowToolName();
  }
  addImageToMap(name: string, image: any, options: any = {}) {
    this.map.addImageToMap(name, image, options);
  }
  updateImageToMap(name: string, image: any, options: any = {}) {
    this.map.updateImageToMap(name, image, options);
  }
  loadImageToMap(name: string, url: string, options: any = {}, callback: any) {
    this.map.loadImageToMap(name, url, options, callback);
  }
  getSquareRid() {
    return this.squareGrid.getSquareRid();
  }
  setSquareRid(boo: boolean) {
    this.squareGrid.setSquareRid(boo);
  }
  // 基础底图场景-----------------
  getBaseScene(): BaseScene {
    return this.baseScene;
  }
  setBaseScene(scene?: any) {
    this.baseScene.setScene(scene);
    this.rollerQMap?.setBaseScene(scene);
    this.multiwindowQMap?.setBaseScene(scene);
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
      let businessScene = new BusinessScene(this.map.map);
      businessScene.setScene(scene);
      this.businessScene.push(businessScene);
    }
    this.rollerQMap?.addBusinessScene(scene);
    this.multiwindowQMap?.addBusinessScene(scene);
  }

  removeBusinessScene(scene?: any) {
    let have = this.businessScene.findIndex(
      (item: BusinessScene) => item.id == scene.id,
    );
    if (have > -1) {
      this.businessScene[have].emptyScene();
      this.businessScene.splice(have, 1);
    }
    this.rollerQMap?.removeBusinessScene(scene);
    this.multiwindowQMap?.removeBusinessScene(scene);
  }

  removeBusinessSceneAll() {
    this.businessScene.forEach((item: BusinessScene) => {
      item.emptyScene();
    });
    this.businessScene = [];

    this.rollerQMap?.removeBusinessSceneAll();
    this.multiwindowQMap?.removeBusinessSceneAll();
  }

  // ---------------------------------
  // 定位工程
  locationProject(project: QProject) {
    let map = this.getMap();
    let cameraObj = project?.cameraObj;
    if (cameraObj && cameraObj.position) {
      map.jumpTo({
        center: cameraObj.position,
        pitch: cameraObj.pitch,
        bearing: cameraObj.bearing,
        zoom: cameraObj.zoom,
      });
    } else {
      map.jumpTo({
        center: defStyle.center,
        pitch: 0,
        bearing: 0,
        zoom: defStyle.zoom,
      });
    }
  }
  // 有动画 的定位
  locationGeometry(geometry: any, options: CameraOptions = {}) {
    const mapStatus = this.getMapStatus();
    try {
      if (geometry.type == 'point' || geometry.type == 'Point') {
        let _options = {
          zoom: 12,
          pitch: 0,
          bearing: 0,
          ...options,
        };
        let extent = turf.getCoord(geometry);
        let _obj: any = {
          center: extent,
          ..._options,
        };
        if (mapStatus == 'multiwindow') {
          this.getMultiwindowQMap()?.flyTo(_obj);
        } else if (mapStatus == 'roller') {
          this.getRollerQMap()?.flyTo(_obj);
        } else {
          this.map?.flyTo(_obj);
        }
      } else {
        let _options = {
          ...options,
        };
        if (mapStatus == 'multiwindow') {
          this.getMultiwindowQMap()?.locationGeometry(geometry, _options);
        } else if (mapStatus == 'roller') {
          this.getRollerQMap()?.locationGeometry(geometry, _options);
        } else {
          this.map?.locationGeometry(geometry, _options);
        }
      }
    } catch (error) {}
  }

  // 没有动画 的定位
  locationGeometryNotA(geometry: any, options: CameraOptions = {}) {
    const mapStatus = this.getMapStatus();
    try {
      if (geometry.type == 'point' || geometry.type == 'Point') {
        let _options = {
          ...options,
          zoom: 12,
          pitch: 0,
          bearing: 0,
        };
        let extent = turf.getCoord(geometry);
        let _obj: any = {
          center: extent,
          ..._options,
        };
        if (mapStatus == 'multiwindow') {
          this.getMultiwindowQMap()?.jumpTo(_obj);
        } else if (mapStatus == 'roller') {
          this.getRollerQMap()?.jumpTo(_obj);
        } else {
          this.map?.jumpTo(_obj);
        }
      } else {
        let _options = {
          ...options,
          animate: false,
        };
        if (mapStatus == 'multiwindow') {
          this.getMultiwindowQMap()?.locationGeometry(geometry, _options);
        } else if (mapStatus == 'roller') {
          this.getRollerQMap()?.locationGeometry(geometry, _options);
        } else {
          this.map?.locationGeometry(geometry, _options);
        }
      }
    } catch (error) {}
  }
  getDataLayerList(): MapSource[] {
    return this.project.getDataLayerList();
  }
  // --------雨雪-------------
  // 雨-------------
  getRainLayer(): any {
    return this.rain_layer;
  }
  getRainShow(): boolean {
    return this.rain_show;
  }
  //修改是否开启雨雪图层
  setRainShow(boo: boolean) {
    this.rain_show = boo;
    const map = this.getMap();
    if (!this.rain_layer) {
      this.rain_layer = new RainLayer({
        id: this.rain_layerId,
      });
      // map.addLayer(this.rain_layer);
    }
    this.rain_layer.setRainShow(boo);

    const ll = map.getLayer(this.rain_layerId);
    if (this.rain_show) {
      if (!ll) map.addLayer(this.rain_layer);
    } else {
      if (ll) map.removeLayer(this.rain_layerId);
    }
  }
  // 修改雨颜色
  setRainColor(color: string) {
    if (this.rain_layer) {
      this.rain_layer.setRainColor(color);
    }
  }

  // 雪-------------
  getSnowLayer(): any {
    return this.snow_layer;
  }
  getSnowShow(): boolean {
    return this.snow_show;
  }

  setSnowShow(boo: boolean) {
    this.snow_show = boo;
    const map = this.getMap();
    if (!this.snow_layer) {
      this.snow_layer = new SnowLayer({
        id: this.snow_layerId,
      });
      map.addLayer(this.snow_layer);
    }
    this.snow_layer.setSnowShow(boo);

    const ll = map.getLayer(this.snow_layerId);
    if (this.snow_show) {
      if (!ll) map.addLayer(this.snow_layer);
    } else {
      if (ll) map.removeLayer(this.snow_layerId);
    }
  }

  // 修改雪颜色
  setSnowColor(color: string) {
    if (this.snow_layer) {
      this.snow_layer.setSnowColor(color);
    }
  }

  // ---------风场-----------------
  getWind(): boolean {
    return this.wind_show;
  }
  getWindlayer(): any {
    return this.windLayer;
  }
  //修改是否开启雨雪图层
  setwind(boo: boolean) {
    this.wind_show = boo;
    let map = this.getMap();
    const windLayerId = 'wind_layer';
    if (boo) {
      if (!this.windLayer) {
        this.windLayer = qWindLayer(windLayerId);
      }
      map.addLayer(this.windLayer);
    } else {
      let ll = map.getLayer(windLayerId);
      if (ll) map.removeLayer(windLayerId);
    }
  }

  // ----------------------------
  // order 是图层名  放到哪个图层前面
  addLayer = (
    obj: QLayerDataModel,
    order: string | null = null,
    extraAttr: object = {},
  ) => {
    this.project.addLayer(obj, order, extraAttr);
  };
  removeLayer = (obj: MapSource) => {
    this.project.removeLayer(obj.id);
  };
  removeLayerById = (id: string) => {
    this.project.removeLayer(id);
  };
  addFeatureLayers(feature: any) {
    let map = this.getMap();
    let layer = new FeatureLayer(map, feature);
    layer.addLayer();
    this.featureLayers.push(layer);
  }
  removeFeatureLayers(feature: any) {
    let layer: FeatureLayer | undefined = this.featureLayers.find(
      (lay: FeatureLayer) => lay.sourceId === feature.id,
    );
    if (layer) {
      layer.removeLayer();
      this.featureLayers = this.featureLayers.filter(
        (lay: FeatureLayer) => lay.sourceId !== feature.id,
      );
    }
  }
  clearFeatureLayers() {
    this.featureLayers.forEach((lay: FeatureLayer) => {
      lay.removeLayer();
    });
    this.featureLayers = [];
  }
  addDefaultLayer = (defLayers: BaseDefaultLayerModel[]) => {
    let map = this.getMap();
    let rasterLayers = defLayers.filter((item: any) => item?.type === 'raster');
    let vecterLayers = defLayers.filter(
      (item: any) => item?.type === 'vector' || item?.type === 'geojson',
    );
    rasterLayers.forEach((it: any, ind: number) => {
      let type = it?.type;
      let show = it?.show;

      let data = new QLayerDataModel(it, type);
      data.setLayers([
        {
          id: it.id || it.name,
          type: 'raster',
          source: it.name,
        },
      ]);

      let source = new MapSource(map, data);
      let layers = data.layers;
      layers.forEach((layer: any) => {
        source.addLayers(layer);
        if (typeof show === 'boolean') {
          source.setShow(show);
        }
      });
      this.sourceData.push(source);
    });

    vecterLayers.forEach((it: any, ind: number) => {
      let type = it?.type;
      let show = it?.show;
      let data = new QLayerDataModel(it, type);
      if (type === 'geojson') {
        data.setLayers(it.layers);
      }
      let source = new MapSource(map, data);
      let layers = data.layers;
      let pointList = layers.filter((item: any) => item.type === 'symbol');
      let lineList = layers.filter((item: any) => item.type === 'line');
      let fillList = layers.filter((item: any) => item.type === 'fill');
      let fillEList = layers.filter(
        (item: any) => item.type === 'fill-extrusion',
      );
      const add = (list: any) => {
        list.forEach((layer: any) => {
          source.addLayers(layer);
          if (typeof show === 'boolean') {
            source.setShow(show);
          }
        });
      };

      add(fillList);
      add(fillEList);
      add(lineList);
      add(pointList);
      this.sourceData.push(source);
    });
  };
  clearTemporaryCollection() {
    for (let i = 0; i < this.temporaryCollection.length; i++) {
      let data = this.temporaryCollection[i];
      if (data instanceof Array) {
        //循环移除
        for (let k = 0; k < data.length; k++) {
          data[k].remove();
        }
      } else {
        data.remove();
      }
    }
    this.temporaryCollection = new Array();
  }
  clearAnalysisCollection() {
    for (let i = 0; i < this.analysisCollection.length; i++) {
      let analysis = this.analysisCollection[i];
      if (analysis instanceof Array) {
        //循环移除
        for (let k = 0; k < analysis.length; k++) {
          analysis[k].remove();
        }
      } else {
        analysis.remove();
      }
    }
    this.analysisCollection = new Array();
  }
  clearCustomCollection() {
    for (let i = 0; i < this.customCollection.length; i++) {
      let cc = this.customCollection[i];
      if (cc instanceof Array) {
        //循环移除
        for (let k = 0; k < cc.length; k++) {
          cc[k].remove();
        }
      } else {
        cc.remove();
      }
    }
    this.customCollection = new Array();
  }
  clearMarkerCollection() {
    for (let i = 0; i < this.markerCollection.length; i++) {
      let cc = this.markerCollection[i];
      if (cc instanceof Array) {
        //循环移除
        for (let k = 0; k < cc.length; k++) {
          cc[k].remove();
        }
      } else {
        cc.remove();
      }
    }
    this.markerCollection = new Array();
  }

  // -------------------------------------------
  // 给位置 给图片 添加一个marker 存到临时数据组里
  addGeomImageMarker(
    feature: any = null,
    geom: any,
    imageName: string,
    imageurl: string = '',
    color: string = '#fff',
    opacity: number = 1,
    imagesize: number = 1,
  ) {
    this.clearTemporaryCollection();
    const pointEntity: DrawCore | null =
      this.drawEntityFactory.createDrawEntity(
        'IconCustom',
        {
          layout: {
            'icon-allow-overlap': true,
            'icon-ignore-placement': true,
            'icon-size': imagesize,
            'icon-pitch-alignment': 'viewport',
          },
          paint: {
            'icon-opacity': opacity,
            'icon-color': color,
          },
        },
        {
          obj: {
            imgUrl: imageurl,
            imgName: imageName,
            obj: feature,
          },
        },
      );
    if (pointEntity) {
      if (feature.id) pointEntity.setFeatureKey(feature.id);
      const qGeometry = pointEntity.qGeometry;
      let newCoord = qGeometry.toCoordinates(geom);
      qGeometry.setCoordinates(newCoord);
      pointEntity.setUpdateState('geojson');
      this.customCollection.push(pointEntity);
    }
  }
}

export default QMapModel;
