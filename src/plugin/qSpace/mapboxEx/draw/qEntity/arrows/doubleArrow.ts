import DoubleArrowUtil from './math/doubleArrowUtil';
import BaseArrow from './baseArrow_fill';
import * as turf from '@turf/turf';
import { EntityModel } from '../../../../core';
//钳击
class DoubleArrow extends BaseArrow {
  fixPointCount: number = 3;
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
      let util = new DoubleArrowUtil();
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

export default DoubleArrow;
