import * as turf from '@turf/turf';
import QGeometry from '../../core/QGeometry';
import DrawPolygon from '../polygon/polygon';
import { EntityModel } from '../../../../core';

class DrawEllipse extends DrawPolygon {
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
      let coords = coordCollection.toArray();
      let tcoord = qGeometry.temporaryCoord?.toArray();
      let result: any = null;
      let data: any[] = [...coords];
      if (tcoord) data = [...coords, tcoord];
      let len = data.length;

      if (len > 1) {
        let one = data[0];
        let two = data[1];
        let point1 = turf.point(one, {
          id: this.getFeatureKey(),
        });
        let point2 = turf.point(two);
        const options: any = { units: 'meters' };

        let distance = turf.rhumbDistance(point1, point2, options);
        let buffered = turf.buffer(point1, distance, options);
        result = buffered;
      }

      return result;
    }
    return null;
  }
}
export default DrawEllipse;
