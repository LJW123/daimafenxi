import * as turf from '@turf/turf';

import QCoordinate from '../../qCoord/QCoordinate';
import QGeometry from '../../core/QGeometry';

class QLinestring extends QGeometry {
  constructor() {
    super();
    this.geoType = 'LineString';
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
      let coordCollection = this.getCoordCollection();
      let linestring = turf.lineString(coordCollection.toArray());
      let options: any = { units: 'meters' };
      let length = turf.length(linestring, options);
      let along = turf.along(linestring, length / 2, options);
      let coord = turf.getCoord(along);
      return coord;
    } catch (e) {}
    return null;
  }
}

export default QLinestring;
