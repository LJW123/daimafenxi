// import QLayer from '../layers/qLayer';
import DrawCollection from '../draw/core/DrawCollection';
import {
  getQMap,
  MapSource,
  MapLayer,
  QLayerDataModel,
  DeduceCollection,
  QPagePositionCollection,
} from '../../core';
import { message } from 'antd';

class QProject {
  id: any;
  name: any = '默认工程';
  icon: any;
  /**
   * 工程原始数据
   */
  sceneObj: any;
  /**
   * 相机数据
   */
  cameraObj: any = null;
  /**
   * 数据图层
   */
  layers: MapSource[] = [];

  /**
   * 绘制数据 列表
   */
  drawCollection: DrawCollection = new DrawCollection();

  /**
   * 推演
   */
  deduceCollection: DeduceCollection = new DeduceCollection();

  // 页面配置
  qPagePositionCollection: QPagePositionCollection =
    new QPagePositionCollection();

  constructor(sceneObject?: any) {
    if (sceneObject) {
      this.initScene(sceneObject);
    }
  }

  initScene(sceneObject: any) {
    this.sceneObj = sceneObject;
    this.id = sceneObject.id;
    this.name = sceneObject.name;
    this.icon = sceneObject.icon;

    if (sceneObject.viewPos) {
      this.cameraObj = JSON.parse(sceneObject.viewPos);
    }

    let layers: any[] = [];
    if (sceneObject.sceneLayers) {
      layers = [...sceneObject.sceneLayers];
    }
    const map = getQMap()?.getMap();

    layers.forEach((it: any, ind: number) => {
      let metaInfo = it.metaInfo;
      let data = new QLayerDataModel(metaInfo);
      let show = it.show;
      let attributes = it.attributes;
      let props = attributes?.props || [];
      let source = new MapSource(map, data);

      data.layers.forEach((layer: any, index: number) => {
        source.addLayers(layer, null, props[index] || {});
      });
      source.setShow(show);

      this.layers.push(source);
    });

    if (sceneObject.charts) {
      const charts = JSON.parse(sceneObject.charts);
      this.qPagePositionCollection.loadObject(charts);
    }
  }

  resetProject() {
    if (this.drawCollection) {
      this.drawCollection.removeAll();
    }
    this.removeAllLayer();
    this.deduceCollection = new DeduceCollection();
    this.qPagePositionCollection = new QPagePositionCollection();
  }

  getDataLayerList(): MapSource[] {
    let result: MapSource[] = [];
    for (let i = 0; i < this.layers.length; i++) {
      result.push(this.layers[i]);
    }
    return result;
  }
  getLayer(layerId: string) {
    let lay = this.layers.find((layer: MapSource) => layer.id == layerId);
    if (lay) return lay;
    return null;
  }

  removeLayer(layerId: string) {
    let idx = this.layers.findIndex((layer: MapSource) => layer.id == layerId);
    if (idx > -1) {
      //移除图层
      this.layers[idx].remove();
      this.layers.splice(idx, 1);
      return true;
    }
    return false;
  }
  removeAllLayer() {
    this.layers.forEach((lay: MapSource) => {
      lay.remove();
    });
    this.layers = [];
  }
  addLayer(
    item: QLayerDataModel,
    order: string | null = null,
    extraAttr: object = {},
  ) {


    if (this.removeLayer(item.id)) return;
    let which = item.which;
    let haveTerrain = this.getHaveTerrain();
    if (haveTerrain && which?.code === '0203') {
      message.warning('地形数据只能同时加载一个');
      return;
    }
    const map = getQMap()?.getMap();
    if (which) {
      let source = new MapSource(map, item);


      if (item.layers) {

        item.layers.forEach((layer: any) => {
          source.addLayers(layer, order, extraAttr);
        });
        this.layers.push(source);
      }
    } else {
      message.warning('暂不支持此模板数据！');
    }
  }

  // 返回此工程中 是否加载有地形
  getHaveTerrain() {
    let haveTerrain = this.layers.find(
      (it: MapSource) => it.which.code === '0203',
    );
    return haveTerrain;
  }
  //图层排序后 图层刷新排序
  changeLayerOrder(data: MapSource, drope: MapSource) {
    const a = this.layers.findIndex((it: MapSource) => it.id === data.id);
    const b = this.layers.findIndex((it: MapSource) => it.id === drope.id);
    this.layers.splice(a, 1, drope);
    this.layers.splice(b, 1, data);
    for (let i = 0; i < this.layers.length; i++) {
      const lay: MapSource = this.layers[i];
      lay.changeLayerOrder();
    }
  }
  // 所有图层重排序 点在上 线在中 面在下
  changeAllLayerOrder() {
    const map = getQMap()?.getMap();
    const allLayers = map.getStyle().layers;

    let symbolList = allLayers.filter((item: any) => item.type === 'symbol');
    let circleList = allLayers.filter((item: any) => item.type === 'circle');
    let lineList = allLayers.filter((item: any) => item.type === 'line');
    let fillList = allLayers.filter((item: any) => item.type === 'fill');
    let fillEList = allLayers.filter(
      (item: any) => item.type === 'fill-extrusion',
    );

    const setOrder = (list: any) => {
      list.forEach((layer: any) => {
        let ll = map.getLayer(layer.id);
        if (ll) map.moveLayer(ll.id);
      });
    };
    setOrder(fillList);
    setOrder(fillEList);
    setOrder(lineList);
    setOrder(circleList);
    setOrder(symbolList);
  }
  // 克隆
  clone() {
    let result = new QProject();

    result.id = this.id;
    result.name = this.name;
    result.icon = this.icon;
    result.sceneObj = this.sceneObj;
    result.cameraObj = this.cameraObj;

    result.layers = this.layers;
    result.drawCollection = this.drawCollection;

    return result;
  }
  /**
   * 读取保存的工程对象
   */
  fromSceneObject(sceneObj: any) {
    this.sceneObj = sceneObj;
  }
  /**
   * 将当前工程转换为后台对应保存的工程对象
   */
  toSceneObject() {
    return null;
  }

  updateQPagePositionHeight(height: number) {
    this.qPagePositionCollection.updateHeight(height);
  }
}

export default QProject;
