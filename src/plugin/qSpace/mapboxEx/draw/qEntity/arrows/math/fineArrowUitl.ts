import * as PlotUtils from './plotUtil';
import Constants from './constants';
import QCoordinate from '../../../qCoord/QCoordinate';
import QGeometry from '../../../core/QGeometry';

class FineArrowUtil {
  generate(pnts: any) {
    const tailWidthFactor = 0.15;
    const neckWidthFactor = 0.2;
    const headWidthFactor = 0.25;
    const headAngle = Math.PI / 8.5;
    const neckAngle = Math.PI / 13;
    const fixPointCount = 2;

    let pnt1 = pnts[0];
    let pnt2 = pnts[1];
    let len = PlotUtils.getBaseLength(pnts);
    let tailWidth = len * tailWidthFactor;
    let neckWidth = len * neckWidthFactor;
    let headWidth = len * headWidthFactor;
    let tailLeft = PlotUtils.getThirdPoint(
      pnt2,
      pnt1,
      Constants.HALF_PI,
      tailWidth,
      true,
    );
    let tailRight = PlotUtils.getThirdPoint(
      pnt2,
      pnt1,
      Constants.HALF_PI,
      tailWidth,
      false,
    );
    let headLeft = PlotUtils.getThirdPoint(
      pnt1,
      pnt2,
      headAngle,
      headWidth,
      false,
    );
    let headRight = PlotUtils.getThirdPoint(
      pnt1,
      pnt2,
      headAngle,
      headWidth,
      true,
    );
    let neckLeft = PlotUtils.getThirdPoint(
      pnt1,
      pnt2,
      neckAngle,
      neckWidth,
      false,
    );
    let neckRight = PlotUtils.getThirdPoint(
      pnt1,
      pnt2,
      neckAngle,
      neckWidth,
      true,
    );
    let pList = [
      tailLeft,
      neckLeft,
      headLeft,
      pnt2,
      headRight,
      neckRight,
      tailRight,
    ];

    // let list = toLngLatCartesian(pList);

    // list.push(list[0]);
    // return list;
    pList.push(pList[0]);
    return pList;
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

export default FineArrowUtil;
