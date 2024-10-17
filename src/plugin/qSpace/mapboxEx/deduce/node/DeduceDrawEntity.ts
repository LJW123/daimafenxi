import DeduceBase from './Base';

import { DrawCore } from '../../../core';
import EntityEffect from '../effect/EntityEffect';

class DeduceDrawEntity extends DeduceBase {
  dtype: string = 'draw'
  // 原始数据
  oldDrawEntity: DrawCore;
  oldStyle: any = {};
  oldGeojson: any = null;

  cloneEntity: DrawCore | null;

  effects: Array<EntityEffect> = [];

  constructor(entity: DrawCore) {
    super();
    this.oldDrawEntity = entity;
    this.id = entity.getFeatureKey();
    this.name = entity.qAttribute.name;

    this.oldStyle = entity?.getQStyles().toObjectData();
    this.oldGeojson = entity?.getGeojson();

    this.cloneEntity = entity.toClone();
  }
  update(runTime: number) {
    if (this.checked && this.cloneEntity) {
      this.oldDrawEntity.setShow(false);

      this.effects.forEach((it: EntityEffect) => {
        it.update(runTime);
      });
    }
  }
  // 恢复  复原
  restore() {
    if (this.oldStyle) {
      const visibility = this.oldStyle.layout.visibility;
      let show = visibility == 'visible' ? true : false;
      this.oldDrawEntity.setShow(show);
    }

    this.cloneEntity = this.oldDrawEntity.toClone();
    this.effects.forEach((it: EntityEffect) => {
      it.drawEntity.remove();
      it.oldStyle = null;
      if (this.cloneEntity) it.drawEntity = this.cloneEntity;
      it.drawEntity.setUpdateState('geojson');
    });
  }
  addEffects(): EntityEffect | null {
    if (this.cloneEntity) {
      let effect = new EntityEffect(this.cloneEntity);
      effect.setIndexNumber(this.effects.length);
      this.effects.push(effect);
      return effect;
    }
    return null;
  }
  createEffects(): EntityEffect | null {
    if (this.cloneEntity) {
      let effect = new EntityEffect(this.cloneEntity);
      effect.setIndexNumber(this.effects.length);
      return effect;
    }
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
    this.effects.forEach((effect: EntityEffect, index: number) => {
      effect.setIndexNumber(index);
    });
  }

  getStylesFields() {
    return this.oldDrawEntity.getQStyles();
  }

  addTrackLine() {
    this.effects.forEach((effect: EntityEffect, index: number) => {
      effect.addTrackLine();
    });
  }
  toObject() {
    let obj: any = {
      dtype: this.dtype,
      id: this.id,
      name: this.name,
      checked: this.checked,
      effects: this.effects.map((item: EntityEffect) => {
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
      if (this.cloneEntity) {
        let effect = new EntityEffect(this.cloneEntity);
        effect.loadObject(item);
        this.effects.push(effect);
      }
    });
  }
}

export default DeduceDrawEntity;
