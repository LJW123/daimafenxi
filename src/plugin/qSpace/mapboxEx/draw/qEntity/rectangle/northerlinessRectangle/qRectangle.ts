import * as turf from '@turf/turf';

import QRectangle from '../rectangle/qRectangle';
import QCoordinate from '../../../qCoord/QCoordinate';

// 正矩形
class QNortherlinessRectangle extends QRectangle {
  constructor() {
    super();
    this.geoType = 'NortherlinessRectangle';
    this.closed = true;
  }

  toCoordinates(line: any): Array<any> {
    let coords = turf.getCoords(line);
    let coordinates: any[] = [];
    coords.forEach((pos: any) => {
      let coord = QCoordinate.fromArray(pos);
      if (coord != null) {
        coordinates.push(coord);
      }
    });
    return coordinates;
  }
  getCenter() {
    try {
      let length = this.getQCoordinatesLength();
      let geojson = null;
      if (length > 0) {
        geojson = this.getGeojson();
        // geojson = this.mEntity?.createDrawData(this);
      }
      let centroid = turf.centroid(geojson);
      let coord = turf.getCoord(centroid);
      return coord;
    } catch (e) {}
    return null;
  }
  toGeojson(featureKey: string) {
    let coordCollection = this.getCoordCollection();
    let length = this.getQCoordinatesLength();
    let coords = coordCollection.toArray();
    let tcoord = this.temporaryCoord?.toArray();
    if (tcoord) coords = [...coords, tcoord];

    if (length > 0) {
      let linestring = turf.lineString([...coords], {
        id: featureKey,
      });
      return linestring;
    }
    return null;
  }
}

export default QNortherlinessRectangle;
