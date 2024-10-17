import * as turf from '@turf/turf';

import QPolygon from '../polygon/qPolygon';

class QPolygonLine extends QPolygon {
  constructor() {
    super();
    this.geoType = 'Polygon';
    this.closed = true;
  }
}

export default QPolygonLine;
