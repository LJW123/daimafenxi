// import * as THREE from 'three';
import QCoordinate from '../../draw/qCoord/QCoordinate';
import BaseTool from '../BaseTool';
import { getQMap, DrawCore } from '../../../core';
// import { getRootStyle } from '../../../util/helper';
class SelectTool extends BaseTool {
  /**
   * 当前选中编辑对象
   */
  selectEntity: DrawCore | null = null;
  /**
   * 选中后的控制点
   */
  selectCtrl: any;
  /**
   * 选中后的贝塞尔曲线控制点
   */
  selectCurvePoint: any;
  /**
   * 按下点
   */
  downEve: any;
  downEveThing: boolean = false;
  downEveEnt: any = null;

  threeClickData: any[] = [];
  constructor() {
    super();
  }
  activate(opts: any) {
    if (!this.handler) {
      this.bindEvent();
    }
    this.opts = opts;
    if (opts.drawType) {
      this.drawType = opts.drawType;
    }

    getQMap()?.Evented.on('modelClick', this.threeClickEvent);
  }
  disable() {
    this.unBindEvent();
    this.clearSlect();

    getQMap()?.Evented.off('modelClick', this.threeClickEvent);
  }

  pickFeature(eve: any) {
    const bbox = [
      [eve.point.x - 5, eve.point.y - 5],
      [eve.point.x + 5, eve.point.y + 5],
    ];
    const map = getQMap()?.getMap();
    const features = map.queryRenderedFeatures(bbox);
    return features;
  }

  getParentName(gr: any, pid: string): any {
    if (gr.name.indexOf(pid) > -1) return gr;
    if (gr.parent) return this.getParentName(gr.parent, pid);
    return null;
  }

  threeClickEvent = (data: any) => {
    const intersects = data.data.intersects || [];
    const _threeClickData = [...this.threeClickData, ...intersects];
    this.threeClickData = [..._threeClickData];
  };

  leftClickEvent(eve: any) {
    this.clearSlect(); //清除选择
    if (this.threeClickData.length > 0) {
      // 进入three的选择
      const threeModel = this.threeClickData[0];
      const drawCollection = getQMap()?.getDrawCollection();
      const gr = this.getParentName(threeModel.object, 'p_');
      if (gr && drawCollection) {
        try {
          const name = `${gr.name || ''}`;
          const ids = name.split('_');
          if (ids.length < 2) return;
          const id = ids[1];
          const entity = drawCollection.getEntity(id);
          if (entity) {
            entity.setEdit(true);
            this.selectEntity = entity;
            getQMap()?.Evented.fire('selectEntity', { data: entity });
          }
        } catch (error) {}
      }
      this.threeClickData = [];
    } else {
      // this.clearSlect(); //清除选择
      const features = this.pickFeature(eve);
      if (features.length > 0) {
        const ctrlLayer = features.find(
          (f: any) => f.source.indexOf('ctrlPoint') > -1,
        );
        const curvePointLayer = features.find(
          (f: any) => f.source.indexOf('curvePoint') > -1,
        );
        if (curvePointLayer) {
          //选中后的贝塞尔曲线控制点
        } else if (ctrlLayer) {
          //处理控制点
        } else {
          //处理绘制对象
          const drawCollection = getQMap()?.getDrawCollection();
          if (drawCollection) {
            const feature = features[0];
            const properties = feature.properties;
            const entity = drawCollection.getEntity(properties.id);

            if (entity) {
              entity.setEdit(true);
              this.selectEntity = entity;
              getQMap()?.Evented.fire('selectEntity', { data: entity });
            }
          }
        }
      }
    }
  }

  leftDownEvent(eve: any): void {
    const map = getQMap()?.getMap();
    const features = this.pickFeature(eve);

    if (features.length > 0) {
      const ctrlLayer = features.find(
        (f: any) => f.source.indexOf('ctrlPoint') > -1,
      );
      const curvePointLayer = features.find(
        (f: any) => f.source.indexOf('curvePoint') > -1,
      );
      const drawCollection = getQMap()?.getDrawCollection();
      const entity = features.find((t: any) =>
        drawCollection?.getEntity(t.properties.id),
      );

      if (curvePointLayer) {
        //处理 贝塞尔曲线控制点
        this.selectCurvePoint = curvePointLayer;
      } else if (ctrlLayer) {
        //处理控制点
        this.selectCtrl = ctrlLayer;
        if (ctrlLayer.properties.isMid) {
          this.selectEntity?.addPoint(
            ctrlLayer.geometry.coordinates,
            ctrlLayer.properties.idx,
          );

          this.selectEntity?.setUpdateState('geojson');
        }
      } else if (entity) {
        //按下实体 拖动
        // map.dragPan.disable();
        this.selectEntity?.setControlPointShow(false);
        this.downEveEnt = entity;
      } else {
        //处理绘制对象
        this.downEveEnt = null;
        // map.dragPan.enable();
      }
      this.downEveThing = true;
      this.downEve = new QCoordinate(eve.lngLat.lng, eve.lngLat.lat);
      map.dragPan.disable();
    } else {
      this.downEveThing = false;
      // map.dragPan.enable();
    }
  }
  mouseMoveEvent(eve: any): any {
    const preview = getQMap()?.getPreview();
    if (!this.downEveThing) return;
    const pt = [eve.lngLat.lng, eve.lngLat.lat];

    if (this.selectEntity) {
      //选中有实体

      if (this.selectCurvePoint) {
        //贝塞尔曲线控制点
      } else if (this.selectCtrl) {
        //控制点
        this.selectEntity?.qGeometry.moveCtrlPoint(this.selectCtrl, pt);
        this.selectEntity?.setUpdateState('geojson');
      } else if (this.downEve && this.downEveEnt) {
        //选中 拖动
        const currentPt = new QCoordinate(eve.lngLat.lng, eve.lngLat.lat);
        if (
          this.downEveEnt.source.indexOf(this.selectEntity.featureKey) > -1 &&
          currentPt &&
          !preview
        ) {
          const q1 = this.downEve;
          const q2 = currentPt;
          const moveCoord = q1.subtract(q2);
          this.selectEntity?.qGeometry.offsetCoords(moveCoord);
          this.selectEntity?.setUpdateState('geojson');
          this.downEve = new QCoordinate(eve.lngLat.lng, eve.lngLat.lat);
        }
      }
    }
  }
  leftUpEvent(eve: any): void {
    if (this.downEveEnt) {
      this.selectEntity?.setControlPointShow(true);
    }

    this.downEveThing = false;
    this.downEve = null;
    this.selectCtrl = null;
    this.selectCurvePoint = null;
    this.downEveEnt = null;

    const map = getQMap()?.getMap();
    map.dragPan.enable();
  }
  clearSlect() {
    //清除已经选中的
    if (this.selectEntity) {
      this.selectEntity.setEdit(false);
      const drawCollection = getQMap()?.getDrawCollection();
      if (drawCollection) {
        const entity = drawCollection.getEntity(this.selectEntity?.featureKey);
        if (entity) {
          getQMap()?.Evented.fire('selectEntity', {
            data: entity,
            complete: true,
          });
        }
      }
    }

    this.selectEntity = null;
    getQMap()?.Evented.fire('selectEntity', {});
  }
  selectEntityFn(qEntity: DrawCore) {
    qEntity.setEdit(true);
    this.selectEntity = qEntity;
  }
}

export default SelectTool;
