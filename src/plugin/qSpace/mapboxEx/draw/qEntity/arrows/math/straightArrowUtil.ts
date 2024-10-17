import * as PlotUtils from './plotUtil';
import QCoordinate from '../../../qCoord/QCoordinate';
import QGeometry from '../../../core/QGeometry';

class StraightArrowUtil {
  generate(pnts: any) {
    const maxArrowLength = 3000000;
    const arrowLengthScale = 5;

    let pnt1 = pnts[0];
    let pnt2 = pnts[1];

    let distance = PlotUtils.distance(pnt1, pnt2);

    let len = distance / arrowLengthScale;
    len = len > maxArrowLength ? maxArrowLength : len;
    let leftPnt = PlotUtils.getThirdPoint(pnt1, pnt2, Math.PI / 6, len, false);
    let rightPnt = PlotUtils.getThirdPoint(pnt1, pnt2, Math.PI / 6, len, true);

    // let list = toLngLatCartesian([pnt1, pnt2, leftPnt, pnt2, rightPnt]);
    // return list;
    return [pnt1, pnt2, leftPnt, pnt2, rightPnt];
  }
  createDrawData(geometryData: QGeometry): any {
    if (geometryData) {
      let length = geometryData.getQCoordinatesLength();
      let coordCollection = geometryData.getCoordCollection();
      let coords = coordCollection.toArray();
      let tcoord = geometryData.temporaryCoord?.toArray();
      let data: any[] = [...coords];

      let pt1 = QCoordinate.fromArray(data[length - 1]);
      let pt2 = geometryData.temporaryCoord;
      let isEq = pt2 ? QCoordinate.equal(pt1, pt2) : false;
      if (tcoord && !isEq) data = [...coords, tcoord];
      let len = data.length;
      if (len > 1) {
        return this.generate(data);
      }
    }
    return null;
  }
}
export default StraightArrowUtil;
