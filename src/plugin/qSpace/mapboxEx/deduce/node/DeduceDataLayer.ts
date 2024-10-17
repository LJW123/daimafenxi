import DeduceBase from './Base';
import moment from 'moment';

import {
  getQMap,
  LayerEffect,
  DataLayerEffect,
  MapSource,
} from '../../../core';

// 推演 影像数据  时序数据
class DeduceDataLayer extends DeduceBase {
  dtype: string = 'data'

  // 原始数据
  cloneDataLayer: DataLayerEffect[];

  effects: Array<LayerEffect> = [];

  constructor(name: string, layerData: DataLayerEffect[]) {
    super();
    this.id = name;
    this.name = name;

    this.cloneDataLayer = JSON.parse(JSON.stringify(layerData));

    const deduceCollection = getQMap()?.getDeduceCollection();
    if (deduceCollection) {
      const unit_time = deduceCollection.getTimeUnit_timeStamp()
      const timeAxis_arr = deduceCollection.timeAxis_arr;
      const grid = timeAxis_arr.length;
      const _effects: LayerEffect[] = [];
      let c = 1;
      if (layerData.length > grid) {
        c = grid / layerData.length;
      }
      for (let i = 0; i < layerData.length; i++) {
        const lay: DataLayerEffect = layerData[i];
        const effect = new LayerEffect(lay);
        effect.setIndexNumber(i);

        const s = timeAxis_arr[i].time
        const e = Number(moment(s).clone().add(c * unit_time).format('x'))

        effect.setStartTime(s);
        effect.setEndTime(e);
        _effects.push(effect);
      }
      this.effects = _effects;
    }
  }

  update(runTime: number) {
    if (this.checked) {
      const map = getQMap()?.getMap();
      if (map && this.cloneDataLayer) {
        this.cloneDataLayer.forEach((item: DataLayerEffect) => {
          const layerList = item.layerList;
          layerList.forEach((lay: any) => {
            map.setLayoutProperty(lay.id, 'visibility', 'none');
          });
        });
      }

      this.effects.forEach((it: LayerEffect) => {
        it.update(runTime);
      });
    }
  }
  // 恢复
  restore() {
    const map = getQMap()?.getMap();
    if (map && this.cloneDataLayer) {
      const dataList: MapSource[] = getQMap()?.getDataLayerList() || [];

      this.cloneDataLayer.forEach((item: DataLayerEffect) => {
        const layerList = item.layerList;
        layerList.forEach((lay: any) => {
          const id = lay.id;
          const layer: MapSource | undefined = dataList.find(
            (it: MapSource) => it.id == id,
          );
          if (layer) {
            if (layer.show) {
              map.setLayoutProperty(lay.id, 'visibility', 'visible');
            } else {
              map.setLayoutProperty(lay.id, 'visibility', 'none');
            }
          }
        });
      });
    }

    this.effects.forEach((effect: LayerEffect) => {
      effect.restore();
    });
  }
  createEffects() {
    return null;

  }
  removeEffects(num: number) {
    this.effects.splice(num, 1);
  }
  getEffect(num: number) {
    return this.effects[num];
  }
  // 重新排序
  sortEffects() {
    this.effects.forEach((effect: LayerEffect, index: number) => {
      effect.setIndexNumber(index);
    });
  }
  toObject() {
    let obj: any = {
      dtype: this.dtype,
      id: this.id,
      name: this.name,
      checked: this.checked,
      effects: this.effects.map((item: LayerEffect) => {
        return item.toObject();
      }),
      cloneDataLayer: this.cloneDataLayer,
    };
    return obj;
  }
  loadObject(obj: any) {
    let checked = obj.checked;
    this.setChecked(checked);
    let effects = obj.effects;
    effects.forEach((item: any, ind: number) => {
      let effect = this.effects[ind];
      effect?.loadObject(item);
    });
  }
}

export default DeduceDataLayer;
