import * as turf from '@turf/turf';
import BaseTool from '../../BaseTool';
import { getQMap, DrawCore } from '../../../../core';
import { message } from 'antd';

//剖面线
let poingL = 2;

class ProfileLineTool extends BaseTool {
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

  //计算剖面数据
  calculate(position: any) {
    let haveTerrain = this.isHaveTerrain();
    if (!haveTerrain) {
      return;
    }
    let map = getQMap()?.getMap();
    let firstPos = position[0];
    let secondPos = position[1];
    let profile = {
      arrXAxis: <any[]>[], // X轴数据
      // arrYAxis: <any[]>[], // Y轴数据
      // maxElevation: -12000, // 最大高程值,int
      // minElevation: 9000, // 最小高程值,int
      // samplingPoints: <any[]>[], // 插值后无高程采样点集,C3,[]
      renderPoints: <any[]>[], // 经过高程处理后的可渲染点,C3,[]
    };

    let positions: any[] = [firstPos];
    let count = 200; // 采样点的数目，太大耗时没必要，太小反应不出地形起伏变化，

    let line = turf.lineString(position);
    let distance = turf.length(line, { units: 'kilometers' });
    profile.arrXAxis.push(0);

    for (let q = 1; q < count; q++) {
      let factor = q / count;
      let along = turf.along(line, factor * distance, { units: 'kilometers' });
      let coord = turf.getCoord(along);
      positions.push(coord);
      profile.arrXAxis.push(factor * distance * 1000);
    }
    positions.push(secondPos);
    profile.arrXAxis.push(distance * 1000);

    for (let w = 0; w < positions.length; w++) {
      let pos = positions[w];
      const lngLat = {
        lng: pos[0],
        lat: pos[1],
      };
      let height = map.queryTerrainElevation(lngLat, { exaggerated: false });
      profile.renderPoints.push(height);
    }
    getQMap()?.Evented.fire('profileLine', {
      data: profile,
    });
  }
}

export default ProfileLineTool;
