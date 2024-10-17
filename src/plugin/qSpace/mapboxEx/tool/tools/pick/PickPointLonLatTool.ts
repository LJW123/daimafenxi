import * as turf from '@turf/turf';
import BaseTool from '../../BaseTool';

import { getQMap, DrawCore } from '../../../../core';

/**
 * 坐标拾取经纬度
 */
class PickPointLonLatTool extends BaseTool {
  drawEntity: DrawCore | null = null;

  constructor() {
    super();
    this.drawType = 'Point';
  }

  leftClickEvent(eve: any) {
    let pt: [number, number] = [eve.lngLat.lng, eve.lngLat.lat];
    if (pt) {
      if (this.drawEntity == null) {
        this.drawEntity = this.createDrawbase({
          layout: {},
          paint: {
            'circle-radius': 4,
            'circle-stroke-width': 1,
          },
        });
        if (this.drawEntity)
          getQMap()?.temporaryCollection.push(this.drawEntity);
      }
      this.drawEntity?.addPoint(pt);
      this.drawEntity?.setUpdateState('geojson');

      this.complete(pt);
    }
  }

  mouseMoveEvent(eve: any) {}
  /**
   * 右击编辑结束
   * @param eve
   */
  rightClickEvent(eve: any) {
    eve.originalEvent.preventDefault();
    this.complete();
  }
  complete(pt?: [number, number]) {
    if (this.opts.fn && pt) {
      this.opts.fn(pt, this.opts);
    }
    if (this.drawEntity) {
      this.drawEntity?.complete();
      this.drawEntity = null;
      getQMap()?.disableTool();
    }
  }
}

export default PickPointLonLatTool;
