import * as turf from '@turf/turf';

import QCoordinate from '../../qCoord/QCoordinate';
import QGeometry from '../../core/QGeometry';

class QPoint extends QGeometry {
  constructor() {
    super();
    this.geoType = 'Point';
  }

  // 返回 完整 geojson
  toGeojson(featureKey: string) {
    let coords = this.getCoordinate();
    let coord = coords.toArray();
    if (coord != null) {
      let point = turf.point(coord, { id: featureKey });
      return point;
    }
    throw '无效的几何对象';
  }
  // 返回坐标数组
  toCoordinates(point: any): Array<QCoordinate> {
    let coords = turf.getCoord(point);
    let coordinates: QCoordinate[] = [];
    let coord: QCoordinate = QCoordinate.fromArray(coords);
    if (coord != null) {
      coordinates.push(coord);
    }
    return coordinates;
  }
  // 返回 图形中心
  getCenter() {
    let coords = this.getCoordinate();
    let coord = coords.toArray();
    return coord;
  }
}

export default QPoint;
