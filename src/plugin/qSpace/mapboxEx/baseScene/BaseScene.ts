class BaseScene {
  map: any;

  //基础场景的原始数据
  baseScene?: any;

  id: string = '';
  layers: any[] = [];
  sources: any = {};
  style: any = {};

  constructor(map: any) {
    this.map = map;
  }
  getScene() {
    return this.baseScene;
  }
  setScene(item?: any) {
    this.emptyScene();

    if (item) {
      if (item.style) {
        let style = JSON.parse(item.style);
        this.style = style;
        this.layers = style.layers || [];
        this.sources = style.sources || {};
      }

      this.baseScene = item;
      this.id = item.id;

      this.addSource();
      this.addLayers();
    }
  }
  //清空基础底图 场景
  emptyScene() {
    for (let i = 0; i < this.layers.length; i++) {
      let layer = this.map.getLayer(this.layers[i].id);
      if (layer) {
        this.map.removeLayer(this.layers[i].id);
      }
    }
    // 暂不清空 源
    // for (let i in sources) {
    //   let source = this.map.getSource(i);
    //   if (source) {
    //     this.map.removeSource(i);
    //   }
    // }
    this.baseScene = null;
    this.id = '';
    this.layers = [];
    this.sources = {};
  }

  addSource() {
    let keys = Object.keys(this.sources);
    for (let i = keys.length - 1; i > -1; i--) {
      let source = this.map.getSource(keys[i]);
      try {
        if (source) {
          // this.map.removeSource(keys[i]);
        } else {
          this.map.addSource(keys[i], this.sources[keys[i]]);
        }
      } catch (err) {
        console.error('添加底图源失败', err);
      }
    }
  }

  addLayers() {
    let map_layers = this.map.getStyle().layers || [];
    let layId = 'bg_lay';
    let sky_index = map_layers.findIndex((it: any) => it.id === layId);
    if (sky_index > -1) {
      let lay = map_layers[sky_index + 1];
      if (lay) layId = lay.id;
    }
    for (let i = 0; i < this.layers.length; i++) {
      let lay = this.layers[i];
      let layer = this.map.getLayer(lay.id);
      if (layer) {
        // this.map.removeLayer(lay.id);
      } else {
        try {
          this.map.addLayer(lay, layId);
        } catch (err) {
          console.error('添加底图图层失败', err);
        }
      }
    }
  }

  getShowList(): any[] {
    let map_layers = this.map.getStyle().layers || [];
    let b_layers = this.layers;
    let showList = [];
    for (let i = 0; i < b_layers.length; i++) {
      let layer = b_layers[i];
      let lay = map_layers.find((it: any) => it.id === layer.id);
      if (lay) {
        let visibility = lay.layout?.visibility;
        if (!visibility || visibility === 'visible') {
          showList.push(lay);
        }
      }
    }
    return showList;
  }

  changeLayerShow(layerId: any, val: boolean) {
    if (this.map) {
      this.map.setLayoutProperty(
        layerId,
        'visibility',
        val ? 'visible' : 'none',
      );
    }
  }
}

export default BaseScene;
