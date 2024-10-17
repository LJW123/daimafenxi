import * as turf from '@turf/turf';
import BaseTool from '../../BaseTool';
import { getQMap, DrawCore } from '../../../../core';

// 画轨迹线
// 推演用
class DrawTrajectoryTool extends BaseTool {
  drawEntity: DrawCore | null = null;

  constructor() {
    super();
    this.drawType = 'Linestring';
  }

  leftClickEvent(eve: any) {
    let pt = [eve.lngLat.lng, eve.lngLat.lat];
    if (pt) {
      if (this.drawEntity == null) {
        this.drawEntity = this.createDrawbase({
          paint: {
            'line-color': '#FFff00',
          },
        });
        if (this.drawEntity) {
          getQMap()?.temporaryCollection.push(this.drawEntity);
        }
      }
      this.drawEntity?.addPoint(pt);
      this.drawEntity?.setUpdateState('geojson');
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
    this.complete();
  }
  complete() {
    if (this.drawEntity) {
      this.drawEntity?.complete();
      let geojson = this.drawEntity.getGeojson();
      if (this.opts.fn) {
        this.opts.fn(geojson);
      }

      this.drawEntity = null;
      getQMap()?.disableTool();
    }
  }
  disable() {
    this.unBindEvent();
    if (this.drawEntity) {
      this.drawEntity?.complete();
      this.drawEntity.remove();
      this.drawEntity = null;
    }
  }
}

export default DrawTrajectoryTool;
