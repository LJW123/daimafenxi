import * as turf from '@turf/turf';
import QCoordinate from '../qCoord/QCoordinate';
import QCoordinateCollection from '../qCoord/QCoordinateCollection';

class QGeometry {
  //geojson的类型
  geoType: string = 'none';

  // 提前生成  完整的可用于显示的geometry数据
  // 用于刷新
  geojson: any = null;

  //是否是闭合图形
  closed: boolean = false;

  //坐标集合  点击的原始坐标  生成的可直接渲染的坐标
  coordCollection: QCoordinateCollection = new QCoordinateCollection();

  //临时坐标点
  temporaryCoord: QCoordinate | null = null;

  constructor() {}

  //添加坐标
  addPoint(pts: Array<number>, idx?: number) {
    let coord = QCoordinate.fromArray(pts);
    if (coord != null) {
      this.coordCollection.addCoordinate(coord, idx);
      if (!idx) {
        this.temporaryCoord = coord;
      }
    }
  }

  //获取 所有坐标 数组本身
  getCoordCollection(): QCoordinateCollection {
    return this.coordCollection;
  }
  //获取 所有坐标 数组
  getQCoordinates(): Array<QCoordinate> {
    return this.coordCollection.getCoordinates();
  }
  //获取 所有坐标长度
  getQCoordinatesLength(): number {
    return this.coordCollection.getCoordinatesLength() || 0;
  }
  //获取某个坐标
  getCoordinate(idx?: number): QCoordinate {
    if (idx) {
      return this.coordCollection.getCoordinate(idx);
    } else {
      return this.coordCollection.getCoordinate(0);
    }
  }

  //修改某个坐标
  setCoordinate(pts: Array<number>, idx: number = 0) {
    this.coordCollection.updateCoordinate(QCoordinate.fromArray(pts), idx);
  }
  //修改整个坐标
  setCoordinates(coords: Array<QCoordinate>) {
    this.coordCollection.setCoordinates(coords);
  }
  /**
   * 偏移  整体偏移
   * @param offsetCoord 偏移值
   */
  offsetCoords(offsetCoord: QCoordinate) {
    this.coordCollection.offsetCoords(offsetCoord);
  }
  // 移动 编辑点
  moveCtrlPoint(ctrlPoint: any, latlng: any) {
    if (!latlng) return;
    let coordCollection = this.getCoordCollection();
    coordCollection.updateCoordinate(
      QCoordinate.fromArray(latlng),
      ctrlPoint.properties.idx,
    );
  }
  //改变临时移动点
  setTemporaryCoord(pt: Array<number>) {
    this.temporaryCoord = QCoordinate.fromArray(pt);
  }
  // 返回geojson
  toGeojson(featureKey: string): any {}
  getGeojson() {
    return this.geojson;
  }
  setGeojson(geojson: any) {
    this.geojson = geojson;
  }
  // 生成geojson
  createGeojson(featureKey: string) {
    let length = this.getQCoordinatesLength();
    let geojson = null;
    if (length > 0) {
      geojson = this.toGeojson(featureKey);
    }
    this.setGeojson(geojson);
    return geojson;
  }
  //返回 坐标数组
  toCoordinates(geojson: any): Array<QCoordinate> {
    return [];
  }
  //返回 中心点
  getCenter(): any {}

  /**
   * 获取编辑点 的集合
   * @param hasMid 是否生成中间点
   * @returns
   */
  createCtrlPoint(hasMid: boolean = true, featureKey: string) {
    let coordinates = this.getQCoordinates();
    if (!coordinates) return;
    let resultList = [];
    let preCtrlPoint: any | null = null;
    let length = coordinates.length;

    let isX = coordinates[0].x === coordinates[length - 1].x;
    let isY = coordinates[0].y === coordinates[length - 1].y;
    if (this.geoType === 'Polygon' && isX && isY) {
      length--;
    }
    for (let i = 0; i < length; i++) {
      let pos = coordinates[i].toArray();
      //创建中间编辑点
      if (i > 0 && hasMid) {
        let midPos = this.getMidPos(turf.getCoord(preCtrlPoint), pos);

        midPos.properties = {
          idx: i,
          isMid: true,
          featureId: featureKey,
        };
        resultList.push(midPos);
      }

      let ctrlPoint: any = turf.point(pos, {
        idx: i,
        isMid: false,
        featureId: featureKey,
      });

      resultList.push(ctrlPoint);
      preCtrlPoint = ctrlPoint;

      if (i === length - 1 && this.closed && hasMid) {
        let midPos = this.getMidPos(turf.getCoord(resultList[0]), ctrlPoint);

        midPos.properties = {
          idx: length,
          isMid: true,
          featureId: featureKey,
        };
        resultList.push(midPos);
      }
    }
    return resultList;
  }

  // 获取中心点
  getMidPos(a: number[], b: number[]) {
    // let options: any = { units: 'meters' };
    // let line = turf.lineString([a, b]);
    // let lineLength = turf.length(line, options);
    // let midPos = turf.along(line, lineLength / 2, options);

    let midPos = turf.midpoint(a, b);

    return midPos;
  }
}

export default QGeometry;
