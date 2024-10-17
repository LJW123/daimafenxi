import QLinestring from '../../linestring/qLinestring';

class QDynamicPoint extends QLinestring {
  constructor() {
    super();
    this.geoType = 'LineString';
  }
}

export default QDynamicPoint;
