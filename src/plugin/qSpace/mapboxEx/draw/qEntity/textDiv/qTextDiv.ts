import * as turf from '@turf/turf';

import QPoint from '../point/qPoint';

class QTextDiv extends QPoint {
  constructor() {
    super();
    this.geoType = 'TextDiv';
  }
}

export default QTextDiv;
