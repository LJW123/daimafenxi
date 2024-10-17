import * as turf from '@turf/turf';
import { getQMap } from '../../../core';

/**
 * 构建绘制控制点
 */
class ControlPointLayer {
  map: any;
  featureKey: any;

  layerId: string = 'ctrlPoint';
  sourceId: string = 'ctrlPoint';

  curveLayerId: string = 'curvePoint';
  curveSourceId: string = 'curvePoint';

  have: boolean = false;
  show: boolean = true;

  constructor(map: any, featureKey: any) {
    this.map = map;
    this.featureKey = featureKey;

    this.layerId = `${featureKey}_ctrlPoint`;
    this.sourceId = `${featureKey}_ctrlPoint`;

    this.curveLayerId = `${featureKey}_curvePoint`;
    this.curveSourceId = `${featureKey}_curvePoint`;

    this.removeCtrlPt();
    this.show = true;
    this.have = false;
    // 这个编辑点 有待思考  是每个实体都有一个还是公用一个  目前是每个一个
  }

  // 创建编辑点
  createCtrlPt(ctrlPointList: any, allowCurve: boolean = false) {
    if (!this.map) {
      return;
    }
    let preview = getQMap()?.getPreview();
    if (preview) {
      return;
    }
    let collection = turf.featureCollection(ctrlPointList);
    if (this.map.getSource(this.sourceId)) {
      //更新数据
      this.map.getSource(this.sourceId).setData(collection);
    } else {
      this.map.addSource(this.sourceId, {
        type: 'geojson',
        data: collection,
      });
    }

    if (!this.have) {
      this.have = true;

      if (ctrlPointList.length < 2) {
        let name = 'sel_point';
        this.map.addLayer({
          id: this.layerId,
          source: this.sourceId,
          type: 'symbol',
          layout: {
            'icon-allow-overlap': true,
            'icon-ignore-placement': true,
            'icon-image': name,
            'icon-size': 0.5,
            visibility: this.show ? 'visible' : 'none',
          },
          paint: {
            'icon-color': '#2e2',
          },
        });
      } else {
        this.map.addLayer({
          id: this.layerId,
          source: this.sourceId,
          type: 'circle',
          layout: {
            visibility: this.show ? 'visible' : 'none',
          },
          paint: {
            'circle-radius': 4,
            'circle-color': '#fbb03b',
            'circle-stroke-color': '#fff',
            'circle-stroke-width': {
              type: 'categorical',
              property: 'isMid',
              stops: [
                [true, 0],
                [false, 3],
              ],
            },
          },
        });

        if (allowCurve) {
          this.activateCurve(ctrlPointList);
        } else {
          this.inactiveCurve();
        }
      }
    }
  }

  // 激活曲线编辑
  activateCurve(ctrlPointList: any[]) {
    if (!this.map) {
      return;
    }
    const layid = `${this.layerId}_curve`;
    const souid = `${this.sourceId}_curve`;

    // let midPoints: any[] = []
    // let curvePoints: any[] = []
    // ctrlPointList.forEach((it: any) => {
    //   if (it.properties.isMid) {
    //     midPoints.push(it)
    //   } else {
    //     curvePoints.push(it)
    //   }
    // });

    // if (curvePoints.length == midPoints.length) {
    //   // 多边形

    // } else {
    //   // 线

    //   var currentBezier;
    //   var prevBezier;
    //   curvePoints.forEach((po: any) => {

    //   });

    // }

    // let arr = [];
    // ctrlPointList.forEach((po: any) => { });

    // // const coordinate = [-122.420679, 37.772537];
    // // const point = this.map.project(coordinate);
    // // const coordinate = map.unproject(e.point);
    // const curve = new THREE.CubicBezierCurve(
    //   new THREE.Vector2(-10, 0),
    //   new THREE.Vector2(-5, 15),
    //   new THREE.Vector2(20, 15),
    //   new THREE.Vector2(10, 0)
    // );

    // const points = curve.getPoints(10);
  }

  // 注销曲线编辑
  inactiveCurve() {
    if (!this.map) {
      return;
    }
    const layid = `${this.layerId}_curve`;
    const souid = `${this.sourceId}_curve`;
    if (this.map.getLayer(layid)) {
      this.map.removeLayer(layid);
    }
    if (this.map.getSource(souid)) {
      this.map.removeSource(souid);
    }
  }

  moveLayer() {
    if (this.map) this.map.moveLayer(this.layerId);
  }
  setShow(show: boolean) {
    if (this.map.getLayer(this.layerId)) {
      this.map.setLayoutProperty(
        this.layerId,
        'visibility',
        show ? 'visible' : 'none',
      );
    }
    this.show = show;
  }
  removeCtrlPt() {
    if (!this.map) {
      return;
    }
    if (this.map.getLayer(this.layerId)) {
      this.map.removeLayer(this.layerId);
    }
    if (this.map.getSource(this.sourceId)) {
      this.map.removeSource(this.sourceId);
    }

    this.inactiveCurve();
  }
}
export default ControlPointLayer;
