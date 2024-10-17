import BaseScene from './BaseScene';
import { getQMap } from '../../core';
class BusinessScene extends BaseScene {
  constructor(map: any) {
    super(map);
  }

  addLayers() {
    let baseScene = getQMap()?.getBaseScene();
    let baseScene_layers = baseScene?.layers || [];
    let baseScene_last_id = '';
    if (baseScene_layers.length > 0) {
      baseScene_last_id = baseScene_layers[baseScene_layers.length - 1].id;
    }

    let map_layers = this.map.getStyle().layers || [];
    let b_last_id_index = map_layers.findIndex(
      (it: any) => it.id === baseScene_last_id,
    );

    let layId = null;
    if (b_last_id_index > -1) {
      let lay = map_layers[b_last_id_index + 1];
      if (lay) layId = lay.id;
    }

    for (let i = 0; i < this.layers.length; i++) {
      let layer = this.map.getLayer(this.layers[i].id);
      if (layer) {
        this.map.removeLayer(this.layers[i].id);
      }
      try {
        this.map.addLayer(this.layers[i], layId);
      } catch (err) {
        console.error('添加业务图层失败', err);
      }
    }
  }
}

export default BusinessScene;
