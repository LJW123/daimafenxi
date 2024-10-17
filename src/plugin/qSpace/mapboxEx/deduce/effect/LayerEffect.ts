import { getQMap, DataLayerEffect, Color, QStyles } from '../../../core';
import Effect from './Effect';

class LayerEffect extends Effect {
  layerData: DataLayerEffect;

  // 本次时间内 原始样式
  oldStyle: any = null;
  // 原始图层数组
  oldLayerList: any[] = [];

  // 修改后的样式
  changeStyle: any = null;
  // 修改后的图层数组
  layerList: any[] = [];

  // 是否加载过图层
  showload: boolean = false;

  constructor(layerData: DataLayerEffect) {
    super();

    this.name = layerData.name;
    this.layerData = layerData;

    const qStyles: QStyles = new QStyles('raster', {});

    this.oldStyle = qStyles.toObjectData();
    this.changeStyle = qStyles.toObjectData();

    const layerList = this.layerData.layerList || [];

    this.oldLayerList = JSON.parse(JSON.stringify(layerList));

    const map = getQMap()?.getMap();
    if (map) {
      layerList.forEach((lay: any) => {
        let ll = map.getLayer(lay.id);
        if (ll) {
          const layer = {
            layout: { ...this.changeStyle.layout },
            paint: { ...this.changeStyle.paint },
            ...lay,
            id: `${lay.id}_${this.name}`,
          };
          this.layerList.push(layer);
        }
      });
    }
  }

  setLayerList() {
    const map = getQMap()?.getMap();
    if (map) {
      this.layerList.forEach((lay: any, index: number) => {
        let oldLay = this.oldLayerList[index];
        let ll = map.getLayer(lay.id);
        if (ll) map.removeLayer(lay.id);
        map.addLayer(lay, oldLay.id);
      });
      this.showload = true;
    }
  }

  update(runTime: number) {
    if (runTime < this.startTime && runTime < this.endTime) {
    } else if (runTime >= this.startTime && runTime <= this.endTime) {
      if (!this.showload) {
        this.setLayerList();
      }
      this.updateData(runTime);
    } else if (runTime > this.startTime && runTime > this.endTime) {
      this.restore();
    }
  }
  updateData(runTime: number) {
    // 时间差  总差值
    const timeD = Math.abs(this.startTime - this.endTime);
    // 时间差  起始到当前差值
    const time = Number(runTime - this.startTime);
    // 比例
    const ratio = timeD > 0 ? time / timeD : 0;

    for (let i in this.oldStyle) {
      const old = this.oldStyle[i];
      const change = this.changeStyle[i];

      for (let q in old) {
        const a = old[q];
        const b = change[q];
        if (a == b) {
        } else {
          if (a && b) {
            let newStyle: any = {};
            newStyle[q] = a;
            if (q.indexOf('color') > -1) {
              const aColor: any = Color.fromCssColorString(a)?.toBytes();
              const bColor: any = Color.fromCssColorString(b)?.toBytes();

              const color = [
                (bColor[0] - aColor[0]) * ratio + aColor[0],
                (bColor[1] - aColor[1]) * ratio + aColor[1],
                (bColor[2] - aColor[2]) * ratio + aColor[2],
              ];

              const cc = Color.fromBytes(color[0], color[1], color[2]);
              const cc2 = cc.toCssColorString();
              const cc3 = Color.rgbToColor(cc2);
              newStyle[q] = cc3;
            } else if (typeof a === 'number') {
              newStyle[q] = (b - a) * ratio + a;
            } else {
              newStyle[q] = b;
            }
            this.updateStyle(i, newStyle);
          }
        }
      }
    }
  }

  updateStyle(type: string, item: any) {
    const layerList = this.layerList;
    let isRun = true;
    const map = getQMap()?.getMap();
    if (map) {
      for (let i in item) {
        if (item[i] == null) isRun = false;
        if (type === 'layout' && i == 'visibility') {
          let show = item[i] == 'visible' ? true : false;
          for (let i = 0; i < layerList.length; i++) {
            const lay = layerList[i];
            const l = map.getLayer(lay.id);
            if (l) {
              map.setLayoutProperty(
                lay.id,
                'visibility',
                show ? 'visible' : 'none',
              );
            }
          }
        }
      }
      if (!isRun) return;
      if (type === 'layout') {
        for (let i in item) {
          if (i.indexOf('_') < 0) {
            for (let q = 0; q < layerList.length; q++) {
              const lay = layerList[q];
              const l = map.getLayer(lay.id);
              if (l) {
                map.setLayoutProperty(lay.id, i, item[i]);
              }
            }
          }
        }
      } else if (type === 'paint') {
        for (let i in item) {
          if (i.indexOf('_') < 0) {
            for (let q = 0; q < layerList.length; q++) {
              const lay = layerList[q];
              const l = map.getLayer(lay.id);
              if (l) {
                map.setPaintProperty(lay.id, i, item[i]);
              }
            }
          }
        }
      }
    }
  }
  // 恢复
  restore() {
    const map = getQMap()?.getMap();
    if (map) {
      this.layerList.forEach((lay: any) => {
        let ll = map.getLayer(lay.id);
        if (ll) map.removeLayer(lay.id);
      });
      this.showload = false;
    }
  }

  setChangeStyle(type: string, item: any) {
    for (let i in item) {
      this.changeStyle[type][i] = item[i];
    }
  }
  toObject() {
    let obj: any = {
      indexNumber: this.indexNumber,
      startTime: this.startTime,
      endTime: this.endTime,
      name: this.name,

      changeStyle: this.changeStyle,
      layerData: this.layerData,
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

export default LayerEffect;
