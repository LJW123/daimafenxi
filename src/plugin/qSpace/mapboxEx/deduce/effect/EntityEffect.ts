import * as turf from '@turf/turf';
import { getQMap, DrawCore, Color, QStyles, QCoordinate } from '../../../core';
import Effect from './Effect';

class EntityEffect extends Effect {
  drawEntity: DrawCore;
  // 本次时间内 原始样式
  oldStyle: any = null;
  // 修改后的样式
  changeStyle: any;

  // 本次时间内 原始坐标
  oldGeojson: any = null;
  // 本次时间内的  修改坐标
  // 是一个完整的geojson  线 点
  changeGeojson: any = null;

  changeGeojsonLength: number = 0;
  // 比例
  ratio: number = 1;

  constructor(drawEntity: DrawCore) {
    super();
    this.drawEntity = drawEntity;
    const qStyles: QStyles = drawEntity?.getQStyles();
    this.changeStyle = qStyles.toObjectData();
    this.drawEntity.setUpdateState('geojson');
  }
  update(runTime: number) {
    if (runTime < this.startTime && runTime < this.endTime) {
      this.drawEntity.update();
    } else if (runTime >= this.startTime && runTime <= this.endTime) {
      if (!this.oldStyle) {
        const qStyles: QStyles = this.drawEntity?.getQStyles();
        this.oldStyle = qStyles.toObjectData();
      }
      if (!this.oldGeojson) {
        this.oldGeojson = this.drawEntity.getGeojson();
      }
      this.updateData(runTime);
    } else if (runTime > this.startTime && runTime > this.endTime) {
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
          // if (a && b) {
          let newStyle: any = {};
          newStyle[q] = a;
          if (q.indexOf('color') > -1) {
            if (a && b) {
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
            }
          } else if (typeof a === 'number') {
            // if (a && b) {
            newStyle[q] = (b - a) * ratio + a;
            // }
          } else {
            newStyle[q] = b;
          }
          this.drawEntity?.updateStyle(i, newStyle);
          // }
        }
      }
    }
    // 放大缩小比例
    let _ratio = (this.ratio - 1) * ratio + 1;
    if (_ratio !== 1) {
      let scaledData = turf.transformScale(this.oldGeojson, _ratio);
      let s_coords = turf.getCoords(scaledData);
      if (s_coords.length < 3) {
        s_coords = s_coords[0];
      }
      let s_coords2 = s_coords.map((it: any) => QCoordinate.fromArray(it));
      this.drawEntity.qGeometry.setCoordinates(s_coords2);
    }
    if (this.changeGeojson) {
      let center = this.drawEntity.qGeometry.getCenter();
      let q1 = QCoordinate.fromArray(center);
      // 行进距离
      let length = this.changeGeojsonLength * ratio;
      // 当前距离的点坐标
      let along = turf.along(this.changeGeojson, length, { units: 'meters' });
      let coords = turf.getCoords(along);
      let q2 = QCoordinate.fromArray(coords);
      let moveCoord = q1.subtract(q2);
      this.drawEntity.qGeometry.offsetCoords(moveCoord);
    }

    this.drawEntity.setUpdateState('geojson');
    this.drawEntity.update();
  }
  toCoordinates(line: any): Array<any> {
    let coords = turf.getCoords(line);
    let coordinates: any[] = [];
    coords.forEach((pos: any) => {
      let coord = QCoordinate.fromArray(pos);
      if (coord != null) {
        coordinates.push(coord);
      }
    });
    return coordinates;
  }
  setChangeStyle(type: string, item: any) {
    for (let i in item) {
      this.changeStyle[type][i] = item[i];
    }
  }
  setRatio(num: number) {
    this.ratio = num;
  }
  setGeojson(geojson: any) {
    if (geojson) {
      this.changeGeojson = geojson;
      this.changeGeojsonLength = turf.length(geojson, { units: 'meters' });
    }
  }
  addTrackLine() {
    let drawEntityFactory = getQMap()?.drawEntityFactory;
    if (drawEntityFactory) {
      let drawEntity: DrawCore | null = drawEntityFactory.createDrawEntity(
        'Linestring',
        {
          paint: {
            'line-color': '#FFff00',
          },
        },
        {},
      );
      if (drawEntity && this.changeGeojson) {
        let newCoord = drawEntity.qGeometry.toCoordinates(this.changeGeojson);
        drawEntity.qGeometry.setCoordinates(newCoord);
        drawEntity?.setUpdateState('geojson');
        getQMap()?.temporaryCollection.push(drawEntity);
      }
    }
  }
  toObject() {
    let obj: any = {
      indexNumber: this.indexNumber,
      startTime: this.startTime,
      endTime: this.endTime,
      changeStyle: this.changeStyle,
      changeGeojson: this.changeGeojson,
      ratio: this.ratio,
      name: this.name,
    };
    return obj;
  }
  loadObject(obj: any) {
    this.setStartTime(obj.startTime);
    this.setEndTime(obj.endTime);
    this.setIndexNumber(obj.indexNumber);
    this.setRatio(obj.ratio);
    this.setName(obj.name);

    this.setGeojson(obj.changeGeojson);
    this.changeStyle = obj.changeStyle;
  }
}

export default EntityEffect;
