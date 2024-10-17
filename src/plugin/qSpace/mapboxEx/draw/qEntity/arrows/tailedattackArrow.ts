import TailedAttackArrowUtil from './math/tailedAttackArrowUtil';
import BaseArrow from './baseArrow_fill';
import * as turf from '@turf/turf';
import { EntityModel } from '../../../../core';

//燕尾箭头
class TailedAttackArrow extends BaseArrow {
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
      let util = new TailedAttackArrowUtil();
      let list = util.createDrawData(this.qGeometry);
      if (list) {
        geojson = turf.lineString(list, { id: this.getFeatureKey() });
      }
    }
    this.qGeometry.setGeojson(geojson);
    return geojson;
  }
}

export default TailedAttackArrow;
