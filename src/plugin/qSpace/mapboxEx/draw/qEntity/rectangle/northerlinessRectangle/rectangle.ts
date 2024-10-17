import * as turf from '@turf/turf';
import { EntityModel } from '../../../../../core';
import QGeometry from '../../../core/QGeometry';
import DrawRectangle from '../rectangle/rectangle';
class DrawNortherlinessRectangle extends DrawRectangle {
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
    if (length >= 2) {
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

      if (len > 1) {
        let one = data[0];
        let two = data[1];
        let three = [one[0], two[1]];
        let four = [two[0], one[1]];

        let newCoords = [one, three, two, four];
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

export default DrawNortherlinessRectangle;
