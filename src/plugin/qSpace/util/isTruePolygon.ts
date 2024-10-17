/**
 * geometric 几何工具库
 */
import * as turf from '@turf/turf';
/**
 * 坐标转线段
 * @param {*} path
 * @returns {arr}
 */
export function pathToLines(path: any) {
  const lines: any[] = [];

  path.forEach((p: any, pi: any) => {
    let line;
    if (pi == path.length - 1) {
      line = turf.lineString([path[pi], path[0]]);
      lines.push(line);
      return;
    }
    line = turf.lineString([path[pi], path[pi + 1]]);
    lines.push(line);
  });
  return lines;
}
/**
 * 判断坐标组成的单个多边形是否合法
 * @param {*} path
 * @description 请传入[[1,2],[2,2],[3,3]] 类似的二维数组
 * @returns {boolean}
 */
export function isTruePolygon(path: any) {
  //  判断数组且数组的长度小于3不构成满足一个面的必要条件终止
  if (!Array.isArray(path) || path.length < 3) return false;
  //  具体坐标也需是一个一维数组，并且数组的长度等于2
  if (!path.every((item) => Array.isArray(item))) return false;
  // if (!path.every(item => Array.isArray(item) && item.length == 2)) return false;

  // 将坐标转成线段
  const lines = pathToLines(path);
  // 是否合法标志
  let isTrue = true;
  // 验证函数
  function check() {
    // 倒序循环
    for (let i = lines.length - 1; i >= 0; i--) {
      // 基准线段
      const line = lines[i];
      const lineNextIndex = i == 0 ? lines.length - 1 : i - 1;
      const lineLastIndex = i == lines.length - 1 ? 0 : i + 1;
      const lineNext = lines[lineNextIndex];
      const lineLast = lines[lineLastIndex];
      // 相邻二根线段必须要有交点
      if (!isIntersect(line, lineNext) || !isIntersect(line, lineLast)) {
        // '相邻二根线段必须要有交点',
        // line,
        // lineNext,
        // lineLast,
        // isIntersect(line, lineNext),
        // isIntersect(line, lineLast),
        isTrue = false;
        return;
      }
      // 非相邻的线段必须无交点
      const noNearLines = lines.filter(
        (item, i) => i !== lineNextIndex && i !== lineLastIndex,
      );
      noNearLines.forEach((le) => {
        if (isIntersect(line, le)) {
          // 非相邻的线段必须无交点
          isTrue = false;
          return;
        }
      });
    }
  }
  check();
  isTrue ? console.info('多边形合法') : console.error('多边形不合法');
  return isTrue;
}

function isIntersect(line1: any, line2: any) {
  return turf.lineIntersect(line1, line2).features.length > 0;
}
export default {
  pathToLines,
  isTruePolygon,
};
