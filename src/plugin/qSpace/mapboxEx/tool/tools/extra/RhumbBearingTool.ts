import * as turf from '@turf/turf';
import BaseTool from '../../BaseTool';
import { getQMap, DrawCore } from '../../../../core';

//测量正北角度
let poingL = 2;
class RhumbBearingTool extends BaseTool {
  drawEntity: DrawCore | null = null;
  drawLists: Array<any> = new Array();
  constructor() {
    super();
    this.drawType = 'Linestring';
  }

  leftClickEvent(eve: any) {
    let pt = [eve.lngLat.lng, eve.lngLat.lat];
    if (pt) {
      if (this.drawEntity == null) {
        this.drawEntity = this.createDrawbase();
        this.drawLists.push(this.drawEntity);
        getQMap()?.analysisCollection.push(this.drawLists);
      }

      this.drawEntity?.addPoint(pt);
      this.drawEntity?.setUpdateState('geojson');

      let l = this.drawEntity?.qGeometry.getQCoordinatesLength() || 0;
      if (l >= poingL) {
        let coods = this.drawEntity?.qGeometry.getQCoordinates();
        if (coods) {
          this.addPoint();
          this.complete();
        }
      } else {
        this.northAuxiliaryLine(pt);
      }
    }
  }
  addPoint() {
    let pointEntity: any = null;
    let coods = this.drawEntity?.qGeometry.getQCoordinates();
    if (!coods) return;
    let one = coods[0].toArray();
    let two = coods[1].toArray();

    let point1 = turf.point(one);
    let point2 = turf.point(two);

    let bearing1 = turf.rhumbBearing(point1, point2);
    let txt_text: number = bearing1 < 0 ? 360 + bearing1 : bearing1;

    if (txt_text > 180) {
      txt_text = 360 - txt_text;
    }

    pointEntity = this.createDrawbase(
      {
        layout: {
          'text-field': `${txt_text.toFixed(3)}°`,
          'text-size': 16,
          'text-pitch-alignment': 'viewport',
        },
        paint: {
          'text-color': '#000000',
          'text-halo-color': '#ffffff',
          'text-halo-width': 2,
        },
      },
      'Text',
    );
    pointEntity?.addPoint(one);
    pointEntity?.setUpdateState('geojson');

    if (pointEntity) {
      this.drawLists.push(pointEntity);
    }
  }
  northAuxiliaryLine(pt: any) {
    let map = getQMap()?.getMap();
    let lineEntity = this.createDrawbase({
      paint: {
        'line-dasharray': 3,
      },
    });
    let pixel = map.project(pt);
    let pt2 = map.unproject([pixel.x, pixel.y - 200]);

    lineEntity?.addPoint(pt);
    lineEntity?.addPoint(pt2.toArray());
    lineEntity?.setUpdateState('geojson');

    if (lineEntity) {
      this.drawLists.push(lineEntity);
    }
  }
  mouseMoveEvent(eve: any) {
    let pt = [eve.lngLat.lng, eve.lngLat.lat];
    if (this.drawEntity && this.drawEntity.setTemporaryCoord && pt) {
      this.drawEntity.setTemporaryCoord(pt);
      this.drawEntity?.setUpdateState('geojson');
    }
  }
  /**
   * 右击编辑结束
   * @param eve
   */
  rightClickEvent(eve: any) {
    eve.originalEvent.preventDefault();
  }
  complete() {
    if (this.drawEntity) {
      this.drawEntity?.complete();
      this.drawEntity = null;
      this.drawLists = [];
      getQMap()?.disableTool();
    }
  }
  disable() {
    this.unBindEvent();
    if (this.drawEntity) {
      this.drawEntity?.complete();
      for (let i = 0; i < this.drawLists.length; i++) {
        let dd = this.drawLists[i];
        dd.remove();
      }
      this.drawEntity = null;
      this.drawLists = [];
    }
  }
}

export default RhumbBearingTool;
