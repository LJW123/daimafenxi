import * as turf from '@turf/turf';

import QPolygon from '../polygon/qPolygon';

class QCube extends QPolygon {
  constructor() {
    super();
    this.geoType = 'Polygon';
    this.closed = true;
  }
}

export default QCube;
