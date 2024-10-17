import * as turf from '@turf/turf';
import BaseTool from '../../BaseTool';
import { getQMap, DrawCore } from '../../../../core';

//测量  体积
class MeasureAreaTool extends BaseTool {
  drawEntity: DrawCore | null = null;
  drawEntityPoint: DrawCore | null = null;
  drawLists: Array<any> = new Array();

  constructor() {
    super();
    this.drawType = 'Cube';
  }

  leftClickEvent(eve: any) {
    let pt = [eve.lngLat.lng, eve.lngLat.lat];
    if (pt) {
      if (this.drawEntity == null) {
        let hei = this.opts?.height || 100;
        this.drawEntity = this.createDrawbase({
          layout: {},
          paint: {
            'fill-extrusion-opacity': 0.6,
            'fill-extrusion-height': hei,
          },
        });
        this.drawEntityPoint = this.createDrawbase(
          {
            layout: {
              'text-field': '',
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
        this.drawLists.push(this.drawEntityPoint);
        this.drawLists.push(this.drawEntity);
        getQMap()?.analysisCollection.push(this.drawLists);
      }
      this.drawEntity?.addPoint(pt);
      this.drawEntityPoint?.addPoint(pt);
      this.drawEntity?.setUpdateState('geojson');
      this.drawEntityPoint?.setUpdateState('geojson');
    }
  }
  setPoint() {
    if (this.drawEntity) {
      const polygon = this.drawEntity.qGeometry.toGeojson(
        this.drawEntity.featureKey,
      );
      const coord = this.drawEntity.qGeometry.getCenter();
      if (coord && this.drawEntityPoint) {
        this.drawEntityPoint.qGeometry.setCoordinate(coord);
        this.drawEntityPoint?.setUpdateState('geojson');

        let area = turf.area(polygon);
        let hei = this.opts?.height || 100;
        area *= hei;

        let txt_text = '';
        let max = 1000 * 1000 * 1000;
        if (area < max) {
          txt_text = `${area.toFixed(0)}m³`;
        } else {
          txt_text = `${(area / max).toFixed(2)}km³`;
        }

        this.drawEntityPoint.updateStyle('layout', { 'text-field': txt_text });
      }
    }
  }
  mouseMoveEvent(eve: any) {
    let pt = [eve.lngLat.lng, eve.lngLat.lat];
    if (this.drawEntity && this.drawEntity.setTemporaryCoord && pt) {
      this.drawEntity.setTemporaryCoord(pt);
      this.drawEntity?.setUpdateState('geojson');
      this.setPoint();
    }
  }
  /**
   * 右击编辑结束
   * @param eve
   */
  rightClickEvent(eve: any) {
    eve.originalEvent.preventDefault();
    let pt = [eve.lngLat.lng, eve.lngLat.lat];
    this.drawEntity?.addPoint(pt);
    this.drawEntity?.setUpdateState('geojson');
    this.setPoint();
    this.complete();
  }
  complete() {
    if (this.drawEntity) {
      this.drawEntity?.complete();
      this.drawEntity = null;
      this.drawEntityPoint?.complete();
      this.drawEntityPoint = null;
      this.drawLists = [];
      getQMap()?.disableTool();
    }
  }

  disable() {
    this.unBindEvent();
    if (this.drawEntity) {
      this.drawEntity?.complete();
      this.drawEntityPoint?.complete();
      for (let i = 0; i < this.drawLists.length; i++) {
        let dd = this.drawLists[i];
        dd.remove();
      }
      this.drawEntity = null;
      this.drawEntityPoint = null;
      this.drawLists = [];
    }
  }
}

export default MeasureAreaTool;
