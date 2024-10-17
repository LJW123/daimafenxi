import * as turf from '@turf/turf';
import BaseTool from '../../BaseTool';
import { getQMap, DrawCore } from '../../../../core';
import { message } from 'antd';

//通视分析
let poingL = 2;

class VisibilityAnalysisTool extends BaseTool {
  drawEntity: DrawCore | null = null;
  drawLists: Array<any> = new Array();

  constructor() {
    super();
    this.drawType = 'Linestring';
  }
  /**
   * 左键点击
   * @param eve
   */
  leftClickEvent(eve: any) {
    let pt = [eve.lngLat.lng, eve.lngLat.lat];
    if (pt) {
      if (this.drawEntity == null) {
        this.drawEntity = this.createDrawbase();
        this.drawLists.push(this.drawEntity);
        getQMap()?.analysisCollection.push(this.drawLists);
      }

      this.drawEntity?.addPoint(pt);
      this.drawEntity?.setUpdateState('geojson');
      this.addPoint(pt);

      let l = this.drawEntity?.qGeometry.getQCoordinatesLength() || 0;
      if (l >= poingL) {
        let coordCollection = this.drawEntity?.qGeometry.getCoordCollection();
        let position = coordCollection?.toArray() || [];
        this.calculate(position);
        this.complete();
      }
    }
  }
  /**
   * 鼠标移动
   * @param eve
   */
  mouseMoveEvent(eve: any) {
    let pt = [eve.lngLat.lng, eve.lngLat.lat];
    if (this.drawEntity && this.drawEntity.setTemporaryCoord && pt) {
      this.drawEntity.setTemporaryCoord(pt);
      this.drawEntity?.setUpdateState('geojson');
    }
  }
  /**
   * 右击编辑结束
   * @param eve
   */
  rightClickEvent(eve: any) {
    eve.originalEvent.preventDefault();
    this.complete();
  }
  /**
   * 完成
   */
  complete() {
    if (this.drawEntity) {
      this.drawEntity?.complete();
      this.drawEntity = null;
      this.drawLists = [];
      getQMap()?.disableTool();
    }
  }
  activate(opts: any) {
    if (!this.handler) {
      this.bindEvent();
    }
    if (opts.drawType) {
      this.opts = opts;
      this.drawType = opts.drawType;
    }
    this.isHaveTerrain();
  }
  disable() {
    this.unBindEvent();
    if (this.drawEntity) {
      this.drawEntity?.complete();
      for (let i = 0; i < this.drawLists.length; i++) {
        let dd = this.drawLists[i];
        dd.remove();
      }
      this.drawEntity = null;
      this.drawLists = [];
    }
  }

  addPoint(pt: any) {
    let pointEntity: DrawCore = this.createDrawbase(
      {
        layout: {},
        paint: {
          'circle-radius': 5,
        },
      },
      'Point',
    );

    pointEntity?.addPoint(pt);
    pointEntity?.setUpdateState('geojson');
    if (pointEntity) {
      this.drawLists.push(pointEntity);
    }
  }
  isHaveTerrain() {
    let project = getQMap()?.getNowQProject();
    let haveTerrain = project?.getHaveTerrain();
    if (haveTerrain) {
      if (haveTerrain.show) {
        return true;
      } else {
        message.warning('此工具需要显示地形数据！');
        getQMap()?.disableTool();
      }
    } else {
      message.warning('此工具需要加载地形数据！');
      getQMap()?.disableTool();
    }
    return false;
  }

  //计算 通视 数据
  calculate(position: any) {
    let haveTerrain = this.isHaveTerrain();
    if (!haveTerrain) {
      return;
    }
    let map = getQMap()?.getMap();
    let firstPos = position[0];
    let secondPos = position[1];

    // 分段坐标
    let positionArr: any[] = [firstPos];

    // 分段距离
    let lengthArr: any[] = [0];

    // 分段高度
    let heightArr: any[] = [];

    let count = 200; // 采样点的数目，太大耗时没必要，太小反应不出地形起伏变化，

    let line = turf.lineString(position);
    // 总长度  支线距离
    let distance = turf.length(line, { units: 'meters' });

    for (let q = 1; q < count; q++) {
      let factor = q / count;
      let along = turf.along(line, factor * distance, { units: 'meters' });
      let coord = turf.getCoord(along);
      positionArr.push(coord);
      lengthArr.push(factor * distance);
    }

    positionArr.push(secondPos);
    lengthArr.push(distance);

    for (let w = 0; w < positionArr.length; w++) {
      let pos = positionArr[w];
      const lngLat = {
        lng: pos[0],
        lat: pos[1],
      };
      let height = map.queryTerrainElevation(lngLat, { exaggerated: false });
      heightArr.push(height);
    }

    let startH = heightArr[0];
    let endH = heightArr[count];
    // 高差
    let hCha = endH - startH;

    // 结果坐标
    let result1: any[] = [];
    let result2: any[] = [];
    let result3: any[] = [firstPos];

    let angle = hCha / distance;

    // 状态
    let v: boolean = true;

    for (let w = 0; w < positionArr.length; w++) {
      let hei = heightArr[w];
      let lon = lengthArr[w];
      let pos = positionArr[w];
      let angle1 = (hei - startH) / lon;
      result3.push(pos);
      if (angle >= angle1) {
        //通视
        if (!v) {
          result2.push(result3);
          result3 = [pos];
        }
        v = true;
      } else {
        //不通视
        if (v) {
          result1.push(result3);
          result3 = [pos];
        }
        angle = angle1;
        v = false;
      }
    }
    if (v) {
      result1.push(result3);
    } else {
      result2.push(result3);
    }

    for (let w = 0; w < result1.length; w++) {
      let resultEntity = this.createDrawbase({
        layout: {},
        paint: {
          'line-color': '#f5222d',
        },
      });
      let line2 = turf.lineString(result1[w]);
      let qGeometry2 = resultEntity?.qGeometry;
      let newCoord2 = qGeometry2?.toCoordinates(line2.geometry);
      if (newCoord2) qGeometry2?.setCoordinates(newCoord2);
      this.drawLists.push(resultEntity);
      resultEntity?.setUpdateState('geojson');
    }
    for (let w = 0; w < result2.length; w++) {
      let resultEntity = this.createDrawbase({
        layout: {},
        paint: {
          // 'line-color': '#f5222d'
        },
      });
      let line2 = turf.lineString(result2[w]);
      let qGeometry2 = resultEntity?.qGeometry;
      let newCoord2 = qGeometry2?.toCoordinates(line2.geometry);
      if (newCoord2) qGeometry2?.setCoordinates(newCoord2);
      this.drawLists.push(resultEntity);
      resultEntity?.setUpdateState('geojson');
    }

    this.drawEntity?.remove();
  }
}

export default VisibilityAnalysisTool;
