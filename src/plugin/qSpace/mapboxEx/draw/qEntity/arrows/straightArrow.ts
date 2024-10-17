import StraightArrowUtil from './math/straightArrowUtil';
import BaseArrow from './baseArrow_line';

import * as turf from '@turf/turf';
import { EntityModel } from '../../../../core';

//直箭头
class StraightArrow extends BaseArrow {
  fixPointCount: number = 2;
  constructor(
    map: any,
    factory: EntityModel,
    style: object = {},
    opts: object = {},
  ) {
    super(map, factory, style, opts);
  }

  createGeojson() {
    let length = this.qGeometry.getQCoordinatesLength();
    let geojson = null;
    if (length > 0) {
      let util = new StraightArrowUtil();
      let list = util.createDrawData(this.qGeometry);
      if (list) {
        geojson = turf.lineString(list, { id: this.getFeatureKey() });
      }
    }
    this.qGeometry.setGeojson(geojson);
    return geojson;
  }
  isComplete() {
    let length = this.qGeometry?.getQCoordinatesLength();
    if (length >= this.fixPointCount) {
      return true;
    }
    return false;
  }
}

export default StraightArrow;
