import * as turf from '@turf/turf';
import QCoordinate from './QCoordinate';

class QCoordinateCollection {
  coordinates: Array<QCoordinate> = new Array();
  constructor() {}
  //添加到集合 点
  addCoordinate(coordinate: QCoordinate, idx?: number) {
    if (idx) {
      this.coordinates.splice(idx, 0, coordinate);
    } else {
      this.coordinates.push(coordinate);
    }
  }
  /**
   *
   * @param coordinate 更新的点
   * @param idx  第几个
   * @returns
   */
  updateCoordinate(coordinate: QCoordinate | null, idx: number) {
    let length = this.coordinates.length;
    if (coordinate == null) return;
    if (idx > length || idx < 0) {
      this.coordinates.push(coordinate);
    } else {
      if ((idx === 0 || idx === length - 1) && length > 2) {
        if (
          this.coordinates[0].x === this.coordinates[length - 1].x &&
          this.coordinates[0].y === this.coordinates[length - 1].y
        ) {
          this.coordinates[0] = coordinate;
          this.coordinates[length - 1] = coordinate;
        } else {
          this.coordinates[idx] = coordinate;
        }
      } else {
        this.coordinates[idx] = coordinate;
      }
    }
  }

  setCoordinates(coordinates: Array<QCoordinate>) {
    this.coordinates = coordinates;
  }
  //删除点
  removeCoordinate(idx: number) {
    if (idx < this.coordinates.length && idx >= 0) {
      this.coordinates.splice(idx, 1);
    }
  }
  //获取  所有点长度
  getCoordinatesLength(): number {
    return this.coordinates.length;
  }
  //获取  所有点
  getCoordinates() {
    return this.coordinates;
  }
  //获取点
  getCoordinate(idx: number) {
    if (idx < this.coordinates.length && idx >= 0) {
      return this.coordinates[idx];
    }
    throw '错误的索引';
  }
  /**
   * 偏移  整体偏移
   * @param offsetCoord 偏移值
   */
  offsetCoords(offsetCoord: QCoordinate) {
    let count = this.coordinates.length;
    for (let i = 0; i < count; i++) {
      this.coordinates[i] = this.coordinates[i].subtract(offsetCoord);
    }
  }
  //返回 坐标数组 集合
  toArray(length?: number) {
    let count = length ? length : this.coordinates.length;
    let result = [];
    for (let i = 0; i < count; i++) {
      result.push(this.coordinates[i].toArray());
    }
    return result;
  }

  // 计算坐标数据的中心点和 高差
  getMiddlePos() {
    let maxh = 0;
    let minh = 0;
    let h = 0;
    let length = this.coordinates.length;

    let array = this.toArray();
    let features = turf.points(array);
    let center = turf.center(features);
    let coord = turf.getCoord(center);

    for (let i = 0; i < length; i++) {
      let coord = this.coordinates[i];
      h += coord.z;
      if (coord.z > maxh) maxh = coord.z;
      if (coord.z < minh) minh = coord.z;
    }
    return {
      pos: [...coord, h / length],
      hc: Math.abs(maxh - minh),
    };
  }
}

export default QCoordinateCollection;
