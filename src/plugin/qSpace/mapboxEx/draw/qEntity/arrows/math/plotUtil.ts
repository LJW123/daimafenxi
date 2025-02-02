import Constants from './constants';

export function distance(pnt1: any, pnt2: any) {
  return Math.sqrt(
    Math.pow(pnt1[0] - pnt2[0], 2) + Math.pow(pnt1[1] - pnt2[1], 2),
  );
}
export function wholeDistance(points: any) {
  var n_distance = 0;
  for (var i = 0; i < points.length - 1; i++)
    n_distance += distance(points[i], points[i + 1]);
  return n_distance;
}

export function getBaseLength(points: any) {
  return Math.pow(wholeDistance(points), 0.99);
  //return wholeDistance(points);
}

export function mid(pnt1: any, pnt2: any) {
  return [(pnt1[0] + pnt2[0]) / 2, (pnt1[1] + pnt2[1]) / 2];
}

export function getCircleCenterOfThreePoints(pnt1: any, pnt2: any, pnt3: any) {
  var pntA = [(pnt1[0] + pnt2[0]) / 2, (pnt1[1] + pnt2[1]) / 2];
  var pntB = [pntA[0] - pnt1[1] + pnt2[1], pntA[1] + pnt1[0] - pnt2[0]];
  var pntC = [(pnt1[0] + pnt3[0]) / 2, (pnt1[1] + pnt3[1]) / 2];
  var pntD = [pntC[0] - pnt1[1] + pnt3[1], pntC[1] + pnt1[0] - pnt3[0]];
  return getIntersectPoint(pntA, pntB, pntC, pntD);
}

export function getIntersectPoint(pntA: any, pntB: any, pntC: any, pntD: any) {
  if (pntA[1] == pntB[1]) {
    var f = (pntD[0] - pntC[0]) / (pntD[1] - pntC[1]);
    var x = f * (pntA[1] - pntC[1]) + pntC[0];
    var y = pntA[1];
    return [x, y];
  }
  if (pntC[1] == pntD[1]) {
    var e = (pntB[0] - pntA[0]) / (pntB[1] - pntA[1]);
    x = e * (pntC[1] - pntA[1]) + pntA[0];
    y = pntC[1];
    return [x, y];
  }
  e = (pntB[0] - pntA[0]) / (pntB[1] - pntA[1]);
  f = (pntD[0] - pntC[0]) / (pntD[1] - pntC[1]);
  y = (e * pntA[1] - pntA[0] - f * pntC[1] + pntC[0]) / (e - f);
  x = e * y - e * pntA[1] + pntA[0];
  return [x, y];
}

export function getAzimuth(startPnt: any, endPnt: any) {
  var azimuth = 0;
  var angle = Math.asin(
    Math.abs(endPnt[1] - startPnt[1]) / distance(startPnt, endPnt),
  );
  if (endPnt[1] >= startPnt[1] && endPnt[0] >= startPnt[0])
    azimuth = angle + Math.PI;
  else if (endPnt[1] >= startPnt[1] && endPnt[0] < startPnt[0])
    azimuth = Constants.TWO_PI - angle;
  else if (endPnt[1] < startPnt[1] && endPnt[0] < startPnt[0]) azimuth = angle;
  else if (endPnt[1] < startPnt[1] && endPnt[0] >= startPnt[0])
    azimuth = Math.PI - angle;
  return azimuth;
}

export function getAngleOfThreePoints(pntA: any, pntB: any, pntC: any) {
  var angle = getAzimuth(pntB, pntA) - getAzimuth(pntB, pntC);
  return angle < 0 ? angle + Constants.TWO_PI : angle;
}

export function isClockWise(pnt1: any, pnt2: any, pnt3: any) {
  return (
    (pnt3[1] - pnt1[1]) * (pnt2[0] - pnt1[0]) >
    (pnt2[1] - pnt1[1]) * (pnt3[0] - pnt1[0])
  );
}
export function getPointOnLine(t: any, startPnt: any, endPnt: any) {
  var x = startPnt[0] + t * (endPnt[0] - startPnt[0]);
  var y = startPnt[1] + t * (endPnt[1] - startPnt[1]);
  return [x, y];
}

export function getCubicValue(
  t: any,
  startPnt: any,
  cPnt1: any,
  cPnt2: any,
  endPnt: any,
) {
  t = Math.max(Math.min(t, 1), 0);
  var tp = 1 - t;
  var t2 = t * t;
  var t3 = t2 * t;
  var tp2 = tp * tp;
  var tp3 = tp2 * tp;
  var x =
    tp3 * startPnt[0] +
    3 * tp2 * t * cPnt1[0] +
    3 * tp * t2 * cPnt2[0] +
    t3 * endPnt[0];
  var y =
    tp3 * startPnt[1] +
    3 * tp2 * t * cPnt1[1] +
    3 * tp * t2 * cPnt2[1] +
    t3 * endPnt[1];
  return [x, y];
}

export function getThirdPoint(
  startPnt: any,
  endPnt: any,
  angle: any,
  distance: any,
  clockWise: any,
) {
  var azimuth = getAzimuth(startPnt, endPnt);
  var alpha = clockWise ? azimuth + angle : azimuth - angle;
  var dx = distance * Math.cos(alpha);
  var dy = distance * Math.sin(alpha);
  return [endPnt[0] + dx, endPnt[1] + dy];
}

export function getArcPoints(
  center: any,
  radius: any,
  startAngle: any,
  endAngle: any,
) {
  var x,
    y,
    pnts = [];
  var angleDiff = endAngle - startAngle;
  angleDiff = angleDiff < 0 ? angleDiff + Constants.TWO_PI : angleDiff;
  for (var i = 0; i <= Constants.FITTING_COUNT; i++) {
    var angle = startAngle + (angleDiff * i) / Constants.FITTING_COUNT;
    x = center[0] + radius * Math.cos(angle);
    y = center[1] + radius * Math.sin(angle);
    pnts.push([x, y]);
  }
  return pnts;
}

export function getBisectorNormals(t: any, pnt1: any, pnt2: any, pnt3: any) {
  var normal = getNormal(pnt1, pnt2, pnt3);
  var dist = Math.sqrt(normal[0] * normal[0] + normal[1] * normal[1]);
  var uX = normal[0] / dist;
  var uY = normal[1] / dist;
  var d1 = distance(pnt1, pnt2);
  var d2 = distance(pnt2, pnt3);
  if (dist > Constants.ZERO_TOLERANCE) {
    if (isClockWise(pnt1, pnt2, pnt3)) {
      var dt = t * d1;
      var x = pnt2[0] - dt * uY;
      var y = pnt2[1] + dt * uX;
      var bisectorNormalRight = [x, y];
      dt = t * d2;
      x = pnt2[0] + dt * uY;
      y = pnt2[1] - dt * uX;
      var bisectorNormalLeft = [x, y];
    } else {
      dt = t * d1;
      x = pnt2[0] + dt * uY;
      y = pnt2[1] - dt * uX;
      bisectorNormalRight = [x, y];
      dt = t * d2;
      x = pnt2[0] - dt * uY;
      y = pnt2[1] + dt * uX;
      bisectorNormalLeft = [x, y];
    }
  } else {
    x = pnt2[0] + t * (pnt1[0] - pnt2[0]);
    y = pnt2[1] + t * (pnt1[1] - pnt2[1]);
    bisectorNormalRight = [x, y];
    x = pnt2[0] + t * (pnt3[0] - pnt2[0]);
    y = pnt2[1] + t * (pnt3[1] - pnt2[1]);
    bisectorNormalLeft = [x, y];
  }
  return [bisectorNormalRight, bisectorNormalLeft];
}

export function getNormal(pnt1: any, pnt2: any, pnt3: any) {
  var dX1 = pnt1[0] - pnt2[0];
  var dY1 = pnt1[1] - pnt2[1];
  var d1 = Math.sqrt(dX1 * dX1 + dY1 * dY1);
  dX1 /= d1;
  dY1 /= d1;

  var dX2 = pnt3[0] - pnt2[0];
  var dY2 = pnt3[1] - pnt2[1];
  var d2 = Math.sqrt(dX2 * dX2 + dY2 * dY2);
  dX2 /= d2;
  dY2 /= d2;

  var uX = dX1 + dX2;
  var uY = dY1 + dY2;
  return [uX, uY];
}

// export function getCurvePoints(t:any, controlPoints:any) {
//   var leftControl = getLeftMostControlPoint(controlPoints);
//   var normals = [leftControl];
//   for (var i = 0; i < controlPoints.length - 2; i++) {
//     var pnt1 = controlPoints[i];
//     var pnt2 = controlPoints[i + 1];
//     var pnt3 = controlPoints[i + 2];
//     var normalPoints = getBisectorNormals(t, pnt1, pnt2, pnt3);
//     normals = normals.concat(normalPoints);
//   }
//   var rightControl = getRightMostControlPoint(controlPoints);
//   normals.push(rightControl);
//   var points = [];
//   for (i = 0; i < controlPoints.length - 1; i++) {
//     pnt1 = controlPoints[i];
//     pnt2 = controlPoints[i + 1];
//     points.push(pnt1);
//     for (var w = 0; w < Constants.FITTING_COUNT; w++) {
//       var pnt = getCubicValue(
//         w / Constants.FITTING_COUNT,
//         pnt1,
//         normals[i * 2],
//         normals[i * 2 + 1],
//         pnt2,
//       );
//       points.push(pnt);
//     }
//     points.push(pnt2);
//   }
//   return points;
// }

// export function getLeftMostControlPoint(controlPoints:any) {
//   var pnt1 = controlPoints[0];
//   var pnt2 = controlPoints[1];
//   var pnt3 = controlPoints[2];
//   var pnts = getBisectorNormals(0, pnt1, pnt2, pnt3);
//   var normalRight = pnts[0];
//   var normal = getNormal(pnt1, pnt2, pnt3);
//   var dist = Math.sqrt(normal[0] * normal[0] + normal[1] * normal[1]);
//   if (dist > Constants.ZERO_TOLERANCE) {
//     var arr_mid = mid(pnt1, pnt2);
//     var pX = pnt1[0] - arr_mid[0];
//     var pY = pnt1[1] - arr_mid[1];

//     var d1 = distance(pnt1, pnt2);
//     // normal at midpoint
//     var n = 2.0 / d1;
//     var nX = -n * pY;
//     var nY = n * pX;

//     // upper triangle of symmetric transform matrix
//     var a11 = nX * nX - nY * nY;
//     var a12 = 2 * nX * nY;
//     var a22 = nY * nY - nX * nX;

//     var dX = normalRight[0] - arr_mid[0];
//     var dY = normalRight[1] - arr_mid[1];

//     // coordinates of reflected vector
//     var controlX = arr_mid[0] + a11 * dX + a12 * dY;
//     var controlY = arr_mid[1] + a12 * dX + a22 * dY;
//   } else {
//     controlX = pnt1[0] + t * (pnt2[0] - pnt1[0]);
//     controlY = pnt1[1] + t * (pnt2[1] - pnt1[1]);
//   }
//   return [controlX, controlY];
// }

// export function getRightMostControlPoint(controlPoints:any) {
//   var count = controlPoints.length;
//   var pnt1 = controlPoints[count - 3];
//   var pnt2 = controlPoints[count - 2];
//   var pnt3 = controlPoints[count - 1];
//   var pnts = getBisectorNormals(0, pnt1, pnt2, pnt3);
//   var normalLeft = pnts[1];
//   var normal = getNormal(pnt1, pnt2, pnt3);
//   var dist = Math.sqrt(normal[0] * normal[0] + normal[1] * normal[1]);
//   if (dist > Constants.ZERO_TOLERANCE) {
//     var arr_mid = mid(pnt2, pnt3);
//     var pX = pnt3[0] - arr_mid[0];
//     var pY = pnt3[1] - arr_mid[1];

//     var d1 = distance(pnt2, pnt3);
//     // normal at midpoint
//     var n = 2.0 / d1;
//     var nX = -n * pY;
//     var nY = n * pX;

//     // upper triangle of symmetric transform matrix
//     var a11 = nX * nX - nY * nY;
//     var a12 = 2 * nX * nY;
//     var a22 = nY * nY - nX * nX;

//     var dX = normalLeft[0] - arr_mid[0];
//     var dY = normalLeft[1] - arr_mid[1];

//     // coordinates of reflected vector
//     var controlX = arr_mid[0] + a11 * dX + a12 * dY;
//     var controlY = arr_mid[1] + a12 * dX + a22 * dY;
//   } else {
//     controlX = pnt3[0] + t * (pnt2[0] - pnt3[0]);
//     controlY = pnt3[1] + t * (pnt2[1] - pnt3[1]);
//   }
//   return [controlX, controlY];
// }

export function getBezierPoints(points: any) {
  if (points.length <= 2) return points;

  var bezierPoints = [];
  var n = points.length - 1;
  for (var t = 0; t <= 1; t += 0.01) {
    var x = 0;
    var y = 0;
    for (var index = 0; index <= n; index++) {
      var factor = getBinomialFactor(n, index);
      var a = Math.pow(t, index);
      var b = Math.pow(1 - t, n - index);
      x += factor * a * b * points[index][0];
      y += factor * a * b * points[index][1];
    }
    bezierPoints.push([x, y]);
  }
  bezierPoints.push(points[n]);
  return bezierPoints;
}

export function getBinomialFactor(n: any, index: any) {
  return getFactorial(n) / (getFactorial(index) * getFactorial(n - index));
}
export function getFactorial(n: any) {
  if (n <= 1) return 1;
  if (n == 2) return 2;
  if (n == 3) return 6;
  if (n == 4) return 24;
  if (n == 5) return 120;
  var result = 1;
  for (var i = 1; i <= n; i++) result *= i;
  return result;
}

export function getQBSplinePoints(points: any) {
  if (points.length <= 2) return points;

  var n = 2;

  var bSplinePoints = [];
  var m = points.length - n - 1;
  bSplinePoints.push(points[0]);
  for (var i = 0; i <= m; i++) {
    for (var t = 0; t <= 1; t += 0.05) {
      var x = 0;
      var y = 0;
      for (var k = 0; k <= n; k++) {
        var factor = getQuadricBSplineFactor(k, t);
        x += factor * points[i + k][0];
        y += factor * points[i + k][1];
      }
      bSplinePoints.push([x, y]);
    }
  }
  bSplinePoints.push(points[points.length - 1]);
  return bSplinePoints;
}

export function getQuadricBSplineFactor(k: any, t: any) {
  if (k == 0) return Math.pow(t - 1, 2) / 2;
  if (k == 1) return (-2 * Math.pow(t, 2) + 2 * t + 1) / 2;
  if (k == 2) return Math.pow(t, 2) / 2;
  return 0;
}
