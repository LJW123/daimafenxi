import * as turf from '@turf/turf';
import { EntityModel } from '../../../../../core';
import QGeometry from '../../../core/QGeometry';
import DrawPolygon from '../../polygon/polygon';

class DrawRectangle extends DrawPolygon {
  constructor(
    map: any,
    factory: EntityModel,
    style: object = {},
    opts: object = {},
  ) {
    super(map, factory, style, opts);
    this.controlPointHasMid = false;
  }

  isComplete() {
    let length = this.qGeometry?.getQCoordinatesLength();
    if (length >= 3) {
      return true;
    }
    return false;
  }
  // 生成geojson
  createGeojson() {
    let length = this.qGeometry.getQCoordinatesLength();
    let geojson = null;
    if (length > 0) {
      geojson = this.createDrawData(this.qGeometry);
    }

    this.qGeometry.setGeojson(geojson);
    return geojson;
  }
  createDrawData(qGeometry: QGeometry): any {
    if (qGeometry) {
      let coordCollection = qGeometry.getCoordCollection();
      // let length = geometryData.getQCoordinatesLength();
      let coords = coordCollection.toArray();
      let tcoord = qGeometry.temporaryCoord?.toArray();
      let result: any = null;
      let data: any[] = [...coords];
      if (tcoord) data = [...coords, tcoord];
      let len = data.length;

      if (len > 2) {
        let one = data[0];
        let two = data[1];
        let three = tcoord ? tcoord : data[2];

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
        let linestring = turf.lineString(newCoords, {
          id: this.getFeatureKey(),
        });
        let polygon = turf.lineToPolygon(linestring);
        result = polygon;
      } else if (len > 1) {
        let linestring = turf.lineString(data, {
          id: this.getFeatureKey(),
        });
        result = linestring;
      }

      return result;
    }
    return null;
  }
}

export default DrawRectangle;
