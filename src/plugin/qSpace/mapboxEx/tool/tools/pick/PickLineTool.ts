import * as turf from '@turf/turf';
import BaseTool from '../../BaseTool';

import { getQMap, DrawCore } from '../../../../core';

/**
 * 拾取 线
 */
class PickLineTool extends BaseTool {
  drawEntity: DrawCore | null = null;

  constructor() {
    super();
    this.drawType = 'Linestring';
  }

  leftClickEvent(eve: any) {
    let pt: [number, number] = [eve.lngLat.lng, eve.lngLat.lat];
    if (pt) {
      if (this.drawEntity == null) {
        this.drawEntity = this.createDrawbase({
          layout: {},
          paint: {},
        });
        if (this.drawEntity)
          getQMap()?.temporaryCollection.push(this.drawEntity);
      }
      this.drawEntity?.addPoint(pt);
      this.drawEntity?.setUpdateState('geojson');

      if (this.drawEntity && this.drawEntity.isComplete()) this.complete();
    }
  }

  mouseMoveEvent(eve: any) {
    let pt: [number, number] = [eve.lngLat.lng, eve.lngLat.lat];
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
    if (this.opts.fn && this.drawEntity) {
      if (this.drawEntity) {
        this.drawEntity?.complete();
        const geometry = this.drawEntity.getGeojson();
        this.opts.fn(geometry, this.opts);
        this.drawEntity = null;
        getQMap()?.disableTool();
      }
    }
  }
}

export default PickLineTool;
