import SquadCombatUtil from './math/squadCombatUtil';
import BaseArrow from './baseArrow_fill';
import * as turf from '@turf/turf';
import { EntityModel } from '../../../../core';

//箭头
class SquadCombat extends BaseArrow {
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
      let util = new SquadCombatUtil();
      let list = util.createDrawData(this.qGeometry);
      if (list) {
        geojson = turf.lineString(list, { id: this.getFeatureKey() });
      }
    }
    this.qGeometry.setGeojson(geojson);
    return geojson;
  }
}

export default SquadCombat;
