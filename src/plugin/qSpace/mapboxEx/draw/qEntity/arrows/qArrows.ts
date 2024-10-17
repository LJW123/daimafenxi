import * as turf from '@turf/turf';
import QCoordinate from '../../qCoord/QCoordinate';

import QLinestring from '../linestring/qLinestring';

class QArrows extends QLinestring {
  constructor() {
    super();
    this.geoType = 'LineString';
  }

  /**
   * 偏移  整体偏移
   * @param offsetCoord 偏移值
   */
  offsetCoords(offsetCoord: QCoordinate) {
    this.coordCollection.offsetCoords(offsetCoord);
  }
}

export default QArrows;
