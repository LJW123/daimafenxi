import { message } from 'antd';
import MapLayer from './MapLayer';
import { QLayerDataModel } from '../../../core';

class TerrainLayer extends MapLayer {
  show: boolean = false;
  map: any;
  qLayerData: QLayerDataModel;
  demId: String = 'terrain_dem';
  constructor(map: any, id: string, qLayerData: QLayerDataModel) {
    super(map, id, qLayerData);

    this.map = map;
    this.qLayerData = qLayerData;
  }

  addLayers() {
    this.removeLayer();
    const url = this.qLayerData.url;
    const terrain = this.map.getSource(this.demId);
    if (terrain) {
      terrain.setTiles([url]);
    } else {
      this.map.addSource(this.demId, {
        type: 'raster-dem',
        tiles: [url],
        tileSize: 256,
        maxzoom: 15,
      });
    }

    this.showTerrain();
  }
  removeLayer() {
    this.clearTerrain();
  }

  setFilter() {}
  getShow() {
    return this.show;
  }
  setShow(boo: boolean) {
    const terrain = this.map.getSource(this.demId);
    if (terrain) {
      this.show = boo;
      if (!boo) {
        this.clearTerrain();
      } else {
        this.showTerrain();
      }
    } else {
      message.warning('请先添加地形！');
    }
  }

  clearTerrain() {
    this.map.setTerrain(null);
  }
  showTerrain() {
    this.map.setTerrain({ source: this.demId, exaggeration: 1.5 });
  }
}
export default TerrainLayer;
