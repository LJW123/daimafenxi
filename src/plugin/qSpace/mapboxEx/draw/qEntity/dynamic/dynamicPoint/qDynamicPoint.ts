import * as turf from '@turf/turf';

import QPoint from '../../point/qPoint';

class QDynamicPoint extends QPoint {
  constructor() {
    super();
    this.geoType = 'Point';
  }
}

export default QDynamicPoint;
