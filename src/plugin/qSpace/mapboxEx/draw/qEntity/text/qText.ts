import * as turf from '@turf/turf';

import QPoint from '../point/qPoint';

class QText extends QPoint {
  constructor() {
    super();
    this.geoType = 'Text';
  }
}

export default QText;
