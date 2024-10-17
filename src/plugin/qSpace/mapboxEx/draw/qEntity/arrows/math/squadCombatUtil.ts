import * as PlotUtils from './plotUtil'; //plot/plotUtil';
import Constants from './constants';
import AttackArrowUtil from './attackArrowUtil';

class SquadCombatUtil extends AttackArrowUtil {
  headHeightFactor: number = 0.18;
  headWidthFactor: number = 0.3;
  neckHeightFactor: number = 0.85;
  neckWidthFactor: number = 0.15;
  tailWidthFactor: number = 0.1;

  generate(pnts: any) {
    let tailPnts = this.getTailPoints(pnts);
    let headPnts = this.getArrowHeadPoints(pnts, tailPnts[0], tailPnts[1]);
    let neckLeft = headPnts[0];
    let neckRight = headPnts[4];
    let bodyPnts = this.getArrowBodyPoints(
      pnts,
      neckLeft,
      neckRight,
      this.tailWidthFactor,
    );
    let count = bodyPnts.length;
    let leftPnts = [tailPnts[0]].concat(bodyPnts.slice(0, count / 2));
    leftPnts.push(neckLeft);
    var rightPnts = [tailPnts[1]].concat(bodyPnts.slice(count / 2, count));
    rightPnts.push(neckRight);

    leftPnts = PlotUtils.getQBSplinePoints(leftPnts);
    rightPnts = PlotUtils.getQBSplinePoints(rightPnts);

    let pslist = leftPnts.concat(headPnts, rightPnts.reverse());

    //  list.push(list[0])
    return pslist;
  }
  getTailPoints(points: Array<number>) {
    var allLen = PlotUtils.getBaseLength(points);
    var tailWidth = allLen * this.tailWidthFactor;
    var tailLeft = PlotUtils.getThirdPoint(
      points[1],
      points[0],
      Constants.HALF_PI,
      tailWidth,
      false,
    );
    var tailRight = PlotUtils.getThirdPoint(
      points[1],
      points[0],
      Constants.HALF_PI,
      tailWidth,
      true,
    );
    return [tailLeft, tailRight];
  }
}

export default SquadCombatUtil;
