import * as turf from '@turf/turf';
import BaseTool from '../../BaseTool';
import { getQMap, DrawCore } from '../../../../core';

//测量距离
class MeasureExtentTool extends BaseTool {
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
      this.addPoint(pt);
    }
  }
  addPoint(pt: any) {
    let pointEntity: DrawCore | null = null;
    if (
      this.drawEntity &&
      this.drawEntity.qGeometry.getQCoordinatesLength() > 1
    ) {
      let line = this.drawEntity.qGeometry.toGeojson(
        this.drawEntity.featureKey,
      );
      let len = turf.length(line, { units: 'kilometers' });
      let txt_text = '';

      if (len > 1) {
        txt_text = `${len.toFixed(3)}km`;
      } else {
        txt_text = `${(len * 1000).toFixed(2)}m`;
      }
      pointEntity = this.createDrawbase(
        {
          layout: {
            'text-field': txt_text,
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
      pointEntity?.addPoint(pt);
      pointEntity?.setUpdateState('geojson');
    } else {
      pointEntity = this.createDrawbase(
        {
          layout: {},
          paint: {
            'circle-radius': 5,
          },
        },
        'Point',
      );
      pointEntity?.addPoint(pt);
      pointEntity?.setUpdateState('geojson');
    }
    if (pointEntity) {
      this.drawLists.push(pointEntity);
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
    let pt = [eve.lngLat.lng, eve.lngLat.lat];
    this.drawEntity?.addPoint(pt);
    this.drawEntity?.setUpdateState('geojson');
    this.addPoint(pt);
    this.complete();
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

export default MeasureExtentTool;
