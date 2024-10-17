import DeduceBase from './Base';

import { ChartModel, getQMap, QpageEffect } from '../../../core';

class DeduceQPage extends DeduceBase {
  dtype: string = 'page'
  //  原始部件数据
  oldData: any;

  effects: Array<QpageEffect> = [];

  constructor(param: ChartModel) {
    super();

    this.id = param.id;
    this.name = param.name;

    this.oldData = param.oldData;

  }
  update(runTime: number) {
    if (this.checked && this.oldData) {
      this.effects.forEach((it: QpageEffect) => {
        it.update(runTime);
      });
    }
  }
  // 恢复  复原
  restore() {
    const qPagePositionCollection = getQMap()?.getQPagePositionCollection();
    const pShow = qPagePositionCollection?.getShow();
    const id = `${this.id}_page`;
    let doc = document.getElementById(id);
    if (pShow) {
      if (doc) {
        doc.style.display = 'block';
      }
    } else {
      if (doc) {
        doc.style.display = 'none';
      }
    }
  }

  addEffects(): QpageEffect | null {
    let effect = new QpageEffect(this.oldData);
    effect.setIndexNumber(this.effects.length);
    this.effects.push(effect);
    return effect;
  }
  createEffects(): QpageEffect | null {
    let effect = new QpageEffect(this.oldData);
    effect.setIndexNumber(this.effects.length);
    return effect;
  }
  removeEffects(num: number) {
    this.effects.splice(num, 1);
  }
  getEffect(num: number) {
    return this.effects[num];
  }
  // 重新排序
  sortEffects() {
    this.effects.forEach((effect: QpageEffect, index: number) => {
      effect.setIndexNumber(index);
    });
  }

  toObject() {
    let obj: any = {
      dtype: this.dtype,
      id: this.id,
      name: this.name,
      oldData: this.oldData,
      checked: this.checked,
      effects: this.effects.map((item: QpageEffect) => {
        return item.toObject();
      }),
    };
    return obj;
  }
  loadObject(obj: any) {
    let checked = obj.checked;
    this.setChecked(checked);
    let effects = obj.effects;
    effects.forEach((item: any) => {
      let effect = new QpageEffect(this.oldData);
      effect.loadObject(item);
      this.effects.push(effect);
    });
  }
}

export default DeduceQPage;
