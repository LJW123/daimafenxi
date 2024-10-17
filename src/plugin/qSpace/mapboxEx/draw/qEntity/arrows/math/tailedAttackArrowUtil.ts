import * as PlotUtils from './plotUtil';
import AttackArrowUtil from './attackArrowUtil';

class TailedAttackArrowUtil extends AttackArrowUtil {
  headHeightFactor: number = 0.18;
  headWidthFactor: number = 0.3;
  neckHeightFactor: number = 0.85;
  neckWidthFactor: number = 0.15;
  tailWidthFactor: number = 0.1;
  headTailFactor: number = 0.8;
  swallowTailFactor: number = 1;
  swallowTailPnt: Array<number> = [];

  generate(pnts: any) {
    // 计算箭尾
    var tailLeft = pnts[0];
    var tailRight = pnts[1];
    if (PlotUtils.isClockWise(pnts[0], pnts[1], pnts[2])) {
      tailLeft = pnts[1];
      tailRight = pnts[0];
    }
    var midTail = PlotUtils.mid(tailLeft, tailRight);
    var bonePnts = [midTail].concat(pnts.slice(2));
    var headPnts = this.getArrowHeadPoints(bonePnts, tailLeft, tailRight);
    var neckLeft = headPnts[0];
    var neckRight = headPnts[4];
    var tailWidth = PlotUtils.distance(tailLeft, tailRight);
    var allLen = PlotUtils.getBaseLength(bonePnts);
    var len = allLen * this.tailWidthFactor * this.swallowTailFactor;
    this.swallowTailPnt = PlotUtils.getThirdPoint(
      bonePnts[1],
      bonePnts[0],
      0,
      len,
      true,
    );
    var factor = tailWidth / allLen;
    var bodyPnts = this.getArrowBodyPoints(
      bonePnts,
      neckLeft,
      neckRight,
      factor,
    );
    var count = bodyPnts.length;
    var leftPnts = [tailLeft].concat(bodyPnts.slice(0, count / 2));
    leftPnts.push(neckLeft);
    var rightPnts = [tailRight].concat(bodyPnts.slice(count / 2, count));
    rightPnts.push(neckRight);

    leftPnts = PlotUtils.getQBSplinePoints(leftPnts);
    rightPnts = PlotUtils.getQBSplinePoints(rightPnts);

    // let pslist = leftPnts.concat(headPnts, rightPnts.reverse());
    let pslist = [
      ...leftPnts.concat(
        headPnts,
        rightPnts.reverse(),
        [this.swallowTailPnt],
        [leftPnts[0]],
      ),
    ];

    // let list = toLngLatCartesian(pslist);

    // //  list.push(list[0])
    // return list;
    return pslist;
  }
}

export default TailedAttackArrowUtil;
