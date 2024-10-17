import * as PlotUtils from './plotUtil';
import Constants from './constants';
import AttackArrowUtil from './attackArrowUtil';

class GatheringPlaceUtil extends AttackArrowUtil {
  t: number = 0.4;
  generate(pnts: any) {
    if (pnts.length < 2) {
      return [];
    }
    if (pnts.length == 2) {
      var mid = PlotUtils.mid(pnts[0], pnts[1]);
      var d = PlotUtils.distance(pnts[0], mid) / 0.9;
      var pnt = PlotUtils.getThirdPoint(
        pnts[0],
        mid,
        Constants.HALF_PI,
        d,
        true,
      );
      pnts = [pnts[0], pnt, pnts[1]];
    }
    var mid = PlotUtils.mid(pnts[0], pnts[2]);
    pnts.push(mid, pnts[0], pnts[1]);

    let normals: Array<Array<number>> = [];
    for (var i = 0; i < pnts.length - 2; i++) {
      var pnt1 = pnts[i];
      var pnt2 = pnts[i + 1];
      var pnt3 = pnts[i + 2];
      var normalPoints = PlotUtils.getBisectorNormals(this.t, pnt1, pnt2, pnt3);
      normals = normals.concat(normalPoints);
    }
    var count = normals.length;
    normals = [normals[count - 1]].concat(normals.slice(0, count - 1));
    var pList = [];
    for (i = 0; i < pnts.length - 2; i++) {
      pnt1 = pnts[i];
      pnt2 = pnts[i + 1];
      pList.push(pnt1);
      for (let t = 0; t <= Constants.FITTING_COUNT; t++) {
        let pnt: Array<number> = PlotUtils.getCubicValue(
          t / Constants.FITTING_COUNT,
          pnt1,
          normals[i * 2],
          normals[i * 2 + 1],
          pnt2,
        );
        pList.push(pnt);
      }
      pList.push(pnt2);
    }

    return pList;
  }
}

export default GatheringPlaceUtil;
