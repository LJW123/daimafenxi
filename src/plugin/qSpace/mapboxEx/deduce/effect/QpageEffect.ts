import * as turf from '@turf/turf';
import { ChartEffect, getQMap } from '../../../core';
import Effect from './Effect';

class QpageEffect extends Effect {
  //  原始部件数据
  oldData: any;

  // 修改后的样式
  changeStyle: ChartEffect;

  constructor(param: any) {
    super();
    this.oldData = { ...param };

    const qPagePositionCollection = getQMap()?.getQPagePositionCollection();
    const pShow = qPagePositionCollection?.getShow() || false;

    this.changeStyle = {
      show: pShow
    };
  }
  update(runTime: number) {
    if (runTime < this.startTime && runTime < this.endTime) {
    } else if (runTime >= this.startTime && runTime <= this.endTime) {
      this.updateData(runTime);
    } else if (runTime > this.startTime && runTime > this.endTime) {
    }
  }
  updateData(runTime: number) {
    const show = this.changeStyle.show;
    const id = `${this.oldData.id}_page`;
    let doc = document.getElementById(id);
    if (doc) {
      if (show) {
        doc.style.display = 'block';
      } else {
        doc.style.display = 'none';
      }
    }
  }

  setChangeStyle(type: string, item: any) {
    this.changeStyle[type] = item;
  }

  toObject() {
    let obj: any = {
      indexNumber: this.indexNumber,
      name: this.name,
      startTime: this.startTime,
      endTime: this.endTime,
      changeStyle: this.changeStyle,
    };
    return obj;
  }
  loadObject(obj: any) {
    this.setStartTime(obj.startTime);
    this.setEndTime(obj.endTime);
    this.setIndexNumber(obj.indexNumber);
    this.setName(obj.name);

    this.changeStyle = obj.changeStyle;
  }
}

export default QpageEffect;
