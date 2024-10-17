import MapLayer from '../layers/layer/MapLayer';
import TerrainLayer from '../layers/layer/TerrainLayer';

import Tiles3Dlayer from '../layers/layer/Tiles3Dlayer';
// import Tiles3Dlayer2 from '../layer/Tiles3Dlayer2';

import { QLayerDataModel } from '../../core';

class MapSource {
  map: any;

  //源id
  id: string = '';
  //名称
  name: string = '';

  //原始数据  之类
  qLayerData: QLayerDataModel;

  /**
   * 图层类型
   */
  which: any;

  // 源集合
  sources: any = {};

  //相同源  不同source-layer
  layers: MapLayer[] = [];

  show: boolean = true;
  time?: any; //用于刷新

  /**
   *
   * @param map
   * @param qLayerData 数据
   */
  constructor(map: any, qLayerData: QLayerDataModel) {
    this.map = map;

    this.id = qLayerData.id;
    this.name = qLayerData.name;
    this.which = qLayerData.which;
    this.sources = qLayerData.sources;
    this.qLayerData = qLayerData;

    this.addSource();
  }

  /**
   * 可添加vector geojson 数据源、后续可扩展其他
   */
  addSource() {
    let dataType = this.qLayerData.dataType;
    let sources = this.sources;

    try {
      switch (dataType) {
        case 'metainfo': {
          for (let i in sources) {
            if (this.map.getSource(i)) {
              //
            } else {
              this.map.addSource(i, sources[i]);
            }
          }

          break;
        }
        case 'feature': {
          for (let i in sources) {
            if (this.map.getSource(i)) {
              this.map.getSource(i).setData(sources[i].data);
            } else {
              this.map.addSource(i, sources[i]);
            }
          }
        }
        case 'raster': {
          for (let i in sources) {
            if (this.map.getSource(i)) {
              //
            } else {
              this.map.addSource(i, sources[i]);
            }
          }
        }
        case 'vector': {
          for (let i in sources) {
            if (this.map.getSource(i)) {
              //
            } else {
              this.map.addSource(i, sources[i]);
            }
          }
        }
        case 'geojson': {
          for (let i in sources) {
            if (this.map.getSource(i)) {
              this.map.getSource(i).setData(sources[i].data);
            } else {
              this.map.addSource(i, sources[i]);
            }
          }
          break;
        }
        case 'image': {
          for (let i in sources) {
            if (this.map.getSource(i)) {
            } else {
              this.map.addSource(i, sources[i]);
            }
          }
          break;
        }
        default:
          null;
      }
    } catch (error) {}
  }

  addLayers(layer: any, order: string | null = null, extraAttr: object = {}) {
    let oldLayer = this.layers.find(
      (lay: any) => lay.name && lay.name === layer['source-layer'],
      // lay.name === layer['source-layer'] || lay.name === layer['source'],
    );

    if (oldLayer) {
      oldLayer.addLayers(layer);
    } else {
      let newLayer = null;
      let which = this.qLayerData?.which;

      if (which?.code === '0203') {
        //地形服务
        newLayer = new TerrainLayer(this.map, this.id, this.qLayerData);
        newLayer.addLayers();
      } else if (which?.code === '0204') {
        //倾斜服务
        newLayer = new Tiles3Dlayer(
          this.map,
          this.id,
          this.qLayerData,
          extraAttr,
        );
        newLayer.addLayers(order);
      } else {
        //其他 raster 服务
        newLayer = new MapLayer(this.map, this.id, layer);
        newLayer.addLayers(layer, order);
      }
      if (newLayer) this.layers.push(newLayer);
    }
  }
  changeLayerOrder(order: string | null = null) {
    if (this.which.code !== '0203') {
      for (let i = 0; i < this.layers.length; i++) {
        const lay: MapLayer = this.layers[i];
        lay.changeLayerOrder(order);
      }
    }
  }
  /**
   * 更新geojson数据
   * @param geometry geojson FeatureCollection对象
   */
  setData(geometry: any) {
    this.map?.getSource(this.id)?.setData(geometry);
  }
  setShow(show: boolean) {
    this.layers.forEach((lay: MapLayer) => {
      lay.setShow(show);
    });
    this.show = show;
  }
  setFilter(val: any[] | null = null) {
    this.layers.forEach((lay: MapLayer) => {
      lay.setFilter(val);
    });
  }
  remove() {
    this.layers.forEach((lay: MapLayer) => {
      lay.removeLayer();
    });
    let source = this.map.getSource(this.id);
    if (source) {
      this.map.removeSource(this.id);
    }
  }
  toObject() {
    let obj = {
      id: this.id,
      name: this.name,
      metaInfo: this.qLayerData.metaInfo,
      show: this.show,
      attributes: {
        props: this.layers.map((it: MapLayer) => {
          return it.getExtraAttr();
        }),
      },
    };
    return obj;
  }

  getLayerList() {
    const layerList = [];
    for (let i = 0; i < this.layers.length; i++) {
      const lays = this.layers[i].layers;
      for (let q = 0; q < lays.length; q++) {
        layerList.push(lays[q]);
      }
    }
    return layerList;
  }
}

export default MapSource;
