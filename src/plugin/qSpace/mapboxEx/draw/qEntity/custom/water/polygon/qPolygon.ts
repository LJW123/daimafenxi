import * as turf from '@turf/turf';

import QCoordinate from '../../../../qCoord/QCoordinate';
import QGeometry from '../../../../core/QGeometry';

class QPolygon extends QGeometry {
  constructor() {
    super();
    this.geoType = 'Polygon';
    this.closed = true;
  }

  toGeojson(featureKey: string) {
    let coordCollection = this.getCoordCollection();
    // let length = this.getQCoordinatesLength();
    let coords = coordCollection.toArray();
    let tcoord = this.temporaryCoord?.toArray();
    if (tcoord) coords = [...coords, tcoord];
    let result: any = null;
    if (coords.length > 0) {
      let linestring = turf.lineString([...coords], {
        id: featureKey,
      });
      result = linestring;
    }
    if (coords.length > 2) {
      let polygon = turf.lineToPolygon(result);
      result = polygon;
    }
    return result;
  }

  toCoordinates(polygon: any): Array<any> {
    let coords = turf.getCoords(polygon);
    let coordinates: any[] = [];
    coords[0].forEach((pos: any) => {
      let coord = QCoordinate.fromArray(pos);
      if (coord != null) {
        coordinates.push(coord);
      }
    });
    return coordinates;
  }
  getCenter() {
    try {
      let coordCollection = this.getCoordCollection();
      let coords = coordCollection.toArray();

      let linestring = turf.lineString(coordCollection.toArray());
      if (coords.length > 2) {
        let polygon = turf.lineToPolygon(linestring);
        let centroid = turf.centroid(polygon);
        let coord = turf.getCoord(centroid);
        return coord;
      } else {
        let centroid = turf.centroid(linestring);
        let coord = turf.getCoord(centroid);
        return coord;
      }
    } catch (e) {}
    return null;
  }
}

export default QPolygon;
