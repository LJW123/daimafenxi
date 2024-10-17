import * as turf from '@turf/turf';

import QPolygon from '../../polygon/qPolygon';
import QCoordinate from '../../../qCoord/QCoordinate';

class QRectangle extends QPolygon {
  constructor() {
    super();
    this.geoType = 'Rectangle';
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
  /**
   *
   * @returns 废弃
   */
  toGeojson2(featureKey: string) {
    let coordCollection = this.getCoordCollection();
    let length = this.getQCoordinatesLength();
    let coords = coordCollection.toArray();
    let tcoord = this.temporaryCoord?.toArray();
    if (tcoord) coords = [...coords, tcoord];
    let result: any = null;

    if (length > 1) {
      let one = coords[0];
      let two = coords[1];
      let three = tcoord ? tcoord : coords[2];

      let point1 = turf.point(one);
      let point2 = turf.point(two);
      let point3 = turf.point(three);

      //前俩点 角度 北
      let bearing1 = turf.rhumbBearing(point1, point2);
      let bearing2 = turf.rhumbBearing(point1, point3);
      let bearing3 = turf.rhumbBearing(point2, point1);

      let b1 = bearing1 < 0 ? bearing1 + 360 : bearing1;
      let b2 = bearing2 < 0 ? bearing2 + 360 : bearing2;
      //夹角
      let ang: number = b2 - b1;
      //距离
      let distance = turf.rhumbDistance(point1, point3);

      let w = distance * Math.cos(Math.abs(ang) * ((2 * Math.PI) / 360));
      //更据点 距离 角度 算一个点
      let d1, d2;
      if (ang > 0) {
        d1 = turf.rhumbDestination(point1, w, bearing1);
        d2 = turf.rhumbDestination(point3, w, bearing3);
      } else {
        d1 = turf.rhumbDestination(point3, w, bearing3);
        d2 = turf.rhumbDestination(point1, w, bearing1);
      }
      let four = turf.getCoord(d1);
      let five = turf.getCoord(d2);

      let newCoords = [one, four, three, five];
      let linestring = turf.lineString(newCoords, { id: featureKey });
      let polygon = turf.lineToPolygon(linestring);
      result = polygon;
    } else if (length > 0) {
      let linestring = turf.lineString([...coords], {
        id: featureKey,
      });
      result = linestring;
    }

    return result;
  }
}

export default QRectangle;
