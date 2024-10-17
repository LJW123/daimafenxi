import * as turf from '@turf/turf';

class QCoordinate {
  x: number;
  y: number;
  z: number;
  constructor(x: number, y: number, z: number = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
  toArray() {
    return [this.x, this.y, this.z];
  }
  //一个坐标和当前坐标的 差
  subtract(coord: QCoordinate): QCoordinate {
    let x = this.x - coord.x;
    let y = this.y - coord.y;
    let z = coord.z;
    return new QCoordinate(x, y, z);
  }
  //一个坐标和当前坐标的 和
  addition(coord: QCoordinate): QCoordinate {
    let x = this.x + coord.x;
    let y = this.y + coord.y;
    let z = coord.z;
    return new QCoordinate(x, y, z);
  }
  //判断两个值 是否相等
  static equal(pt1: QCoordinate, pt2: QCoordinate) {
    return turf.booleanEqual(
      turf.point(pt1.toArray()),
      turf.point(pt2.toArray()),
    );
  }
  //进入坐标数组  返回类
  static fromArray(array: Array<number>): QCoordinate {
    if (array) {
      if (array.length == 2) {
        return new QCoordinate(array[0], array[1]);
      }
      if (array.length == 3) {
        return new QCoordinate(array[0], array[1], array[2]);
      }
    }
    return new QCoordinate(0, 0);
  }
}

export default QCoordinate;
