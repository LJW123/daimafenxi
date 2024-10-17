import short from 'short-uuid';
import * as turf from '@turf/turf';

import QGeometry from './QGeometry';
import QStyles from './QStyles';
import QAttribute from '../qAttribute/qAttribute';

import ControlPointLayer from '../controlPoint/ControlPointLayer';

import TextLayer from '../note/TextLayer';
import LabelLayer from '../note/LabelLayer';
import AssemblyLayer from '../note/AssemblyLayer';

import { getQMap, EntityModel } from '../../../core';

class DrawCore {
  map: any;

  // 原始数据
  oldData: any;
  id: any;

  //额外参数  用于储存一些其他数据
  opts: any;

  // 绘制类型 对应绘制实体列表的name  内部使用
  drawName: string;

  //绘制的数据本身
  qGeometry: QGeometry = new QGeometry();

  // 样式
  qStyles: QStyles = new QStyles();

  // 属性
  qAttribute: QAttribute = new QAttribute();

  //唯一值  相当于内部id
  featureKey: string;

  // 是否显示
  show: boolean = true;

  // 是否是跟新状态
  // geojson  style  all 三个状态
  // 为geojson时刷新数据  状态
  updateState: string = '';

  // 控制点的图层
  controlPointLayer: ControlPointLayer | null = null;
  // 控制点是否有中间点  添加点
  controlPointHasMid: boolean = true;

  textLayer: TextLayer;

  labelLayer: LabelLayer;

  assemblyLayer: AssemblyLayer;

  //是否允许曲线
  allowCurve: boolean = false;

  //图层是否准备  是否加载过
  ready: boolean = false;

  // 模型
  mesh: any = null;
  entityType: string = '';
  modelName: string = '';
  customLayer: any = null;

  /**
   * 图层id列表
   * 基础源       s_
   * 基础图层 点  p_
   * 基础图层 线  l_
   * 基础图层 面  f_
   * 注记源      st_
   * 注记图层     t_
   *
   */

  constructor(
    map: any,
    factory: EntityModel,
    style: object = {},
    opts: object = {},
    featureKey: string = '',
  ) {
    this.map = map;
    this.opts = opts;
    if (featureKey) {
      this.featureKey = featureKey;
    } else {
      this.featureKey = short.generate();
    }
    this.drawName = factory.name;

    this.qStyles = new QStyles(factory.qStyles, style);
    this.qGeometry = new factory.qGeometry();

    // 注记
    this.textLayer = new TextLayer(map);
    // 标注
    this.labelLayer = new LabelLayer(map, this);
    // 部件
    this.assemblyLayer = new AssemblyLayer(map, this);

    // this.addSource();

    /**
     * 先new
     * 样式赋值
     * 数据赋值
     * 添加源  这时候是空值null
     * 添加图层  这时因为是空值 所以不显示
     * 然后走一个 setUpdateState('geojson') 触发刷新 生成geojson
     * 图层出现
     * ----------
     * 修改数据只走 updateData  内部只刷新数据源
     * 修改样式只走 updateStyle 内部会去走updateLayers并且记录修改的样式储存
     * ----------------
     * 也就是说 这个实体new完后 源和图层已经在mapbox上了
     */
  }

  update() {
    if (this.qGeometry) {
      if (this.updateState === 'geojson') this.updateData();
      // if (this.updateState === 'geojson') {
      //   this.updateData();
      // } else if (this.updateState === 'style') {
      //   this.updateStyle();
      // } else if (this.updateState === 'all') {
      //   this.updateData();
      //   this.updateStyle();
      // }
      this.labelLayer.updateShow(this.show, this.featureKey);
      this.assemblyLayer.updateShow(this.show, this.featureKey);
      if (this.updateState !== '') this.setUpdateState();
    }
  }
  //控制 跟新状态
  setUpdateState(type: string = '') {
    if (type === 'geojson' || type === 'all') this.createGeojson();
    this.updateState = type;
  }
  //更新 数据
  updateData() {
    let geojson = this.getGeojson();

    this.updateSource(geojson);

    if (this.controlPointLayer) {
      let ctrlPointList = this.qGeometry?.createCtrlPoint(
        this.controlPointHasMid,
        this.featureKey,
      );
      this.controlPointLayer.createCtrlPt(ctrlPointList, this.allowCurve);
    }

    if (!this.ready) {
      this.ready = true;
      this.addLayer();
    }
  }

  // 添加源  空值
  addSource() {
    const allid = this.getAllId();
    const sid = allid.sid;
    const stid = allid.stid;

    if (this.map.getSource(sid)) {
      this.map.getSource(sid).setData(null);
    } else {
      this.map.addSource(sid, {
        type: 'geojson',
        data: null,
      });
    }

    if (this.map.getSource(stid)) {
      this.map.getSource(stid).setData(null);
    } else {
      this.map.addSource(stid, {
        type: 'geojson',
        data: null,
      });
    }
  }
  // 刷新 数据源
  updateSource(geojson: any = null) {
    if (!this.map) return;
    let allid = this.getAllId();
    let sid = allid.sid;
    let stid = allid.stid;
    if (this.map.getSource(sid)) {
      this.map.getSource(sid).setData(geojson);
    } else {
      this.map.addSource(sid, {
        type: 'geojson',
        data: geojson,
      });
    }

    this.textLayer.updateData(geojson, stid);
    if (geojson) {
      const center: any = this.qGeometry.getCenter();
      // const centroid = turf.centroid(geojson);
      // const center: number[] = turf.getCoord(centroid);
      if (center == null) return;
      this.labelLayer.updateData(center);
      this.assemblyLayer.updateData(center);
    }
  }

  //更新 样式 刷新图层
  updateStyle(type: string, item: any) {
    let isRun = true;
    for (let i in item) {
      if (item[i] === null) {
        isRun = false;
      }
      if (type === 'layout' && i == 'visibility') {
        let show = item[i] == 'visible' ? true : false;
        this.setShow(show);
      }
    }
    if (!isRun) return;
    this.qStyles.setStyleValue(type, item);
    this.updateLayers(type, item);
    const allid = this.getAllId();
    const stid = allid.stid;
    const tid = allid.tid;
    const qStyles = this.getQStyles();

    if (this.show) {
      this.textLayer.updateStyle(qStyles, type, item, tid, stid);
      this.labelLayer.updateStyle(qStyles, this.featureKey);
      this.assemblyLayer.updateStyle(qStyles, this.featureKey);
    }
  }
  // 添加图层
  addLayer() {}
  // 更新图层----------
  // 更新图层样式
  updateLayers(type: string, item: any) {}

  // 跟新 标签图层  数据
  updateNoteLayer() {
    const qStyles = this.getQStyles();
    const layout_textObj: any = qStyles.getLayoutTextObj();
    const allid = this.getAllId();
    const tid = allid.tid;
    const stid = allid.stid;
    const text_type = layout_textObj['_text-type'];

    if (this.show) {
      if (text_type === '注记') {
        this.textLayer.addLayer(qStyles, tid, stid);
      } else if (text_type === '标注') {
        const center: any = this.qGeometry.getCenter();
        if (center == null) return;
        this.labelLayer.updateData(center);
        this.labelLayer.addLayer(qStyles, this.featureKey);
      } else if (text_type === '部件') {
        const center: any = this.qGeometry.getCenter();
        if (center == null) return;
        this.assemblyLayer.updateData(center);
        this.assemblyLayer.addLayer(qStyles, this.featureKey);
      }
    } else {
      this.textLayer.removeLayer(stid, tid);
      this.labelLayer.removeLayer(this.featureKey);
      this.assemblyLayer.removeLayer(this.featureKey);
    }
  }
  // -----操作数据----------------------------
  // 获取geojson
  getGeojson() {
    return this.qGeometry.getGeojson();
  }
  // 修改 geojson
  setGeojson(geojson: any) {
    this.qGeometry.setGeojson(geojson);
    this.updateState === 'geojson';
  }
  // 生成geojson
  createGeojson() {
    return this.qGeometry.createGeojson(this.featureKey);
  }

  getShow(): boolean {
    return this.show;
  }

  //控制显示隐藏
  setShow(boo: boolean) {
    let map = this.map;
    let allid = this.getAllId();

    let stid = allid.stid;
    let pid = allid.pid;
    let lid = allid.lid;
    let fid = allid.fid;
    let tid = allid.tid;
    if (map) {
      let layer_p = this.map.getLayer(pid);
      let layer_l = this.map.getLayer(lid);
      let layer_f = this.map.getLayer(fid);
      // let layer_t = this.map.getLayer(tid);

      if (layer_p)
        map.setLayoutProperty(pid, 'visibility', boo ? 'visible' : 'none');
      if (layer_l)
        map.setLayoutProperty(lid, 'visibility', boo ? 'visible' : 'none');
      if (layer_f)
        map.setLayoutProperty(fid, 'visibility', boo ? 'visible' : 'none');
      // if (layer_t) map.setLayoutProperty(tid, 'visibility', boo ? 'visible' : 'none');
    }

    this.show = boo;
    // this.updateStyle('layout', { visibility: boo ? 'visible' : 'none' })
    this.qStyles.setStyleValue('layout', {
      visibility: boo ? 'visible' : 'none',
    });
    if (this.ready) {
      this.updateNoteLayer();
    }
  }

  // 获取各个图层id
  getAllId() {
    let featureKey = this.getFeatureKey();
    let sid = `s_${featureKey}`;
    let stid = `st_${featureKey}`;

    let pid = `p_${featureKey}`;
    let lid = `l_${featureKey}`;
    let fid = `f_${featureKey}`;
    let tid = `t_${featureKey}`;

    return {
      sid,
      stid,
      pid,
      lid,
      fid,
      tid,
    };
  }

  //删除所有
  //删除 基础图层   注记单算
  remove() {
    if (!this.map) return;
    let allid = this.getAllId();
    let sid = allid.sid;
    let stid = allid.stid;

    let pid = allid.pid;
    let lid = allid.lid;
    let fid = allid.fid;
    let tid = allid.tid;

    let layer_p = this.map.getLayer(pid);
    let layer_l = this.map.getLayer(lid);
    let layer_f = this.map.getLayer(fid);

    if (layer_p) this.map.removeLayer(pid);
    if (layer_l) this.map.removeLayer(lid);
    if (layer_f) this.map.removeLayer(fid);

    let source = this.map.getSource(sid);
    if (source) this.map.removeSource(sid);

    this.textLayer.removeLayer(stid, tid);
    this.labelLayer.removeLayer(this.featureKey);
    this.assemblyLayer.removeLayer(this.featureKey);

    let source_t = this.map.getSource(stid);
    if (source_t) this.map.removeSource(stid);

    if (this.controlPointLayer != null) {
      this.controlPointLayer.removeCtrlPt();
      this.controlPointLayer = null;
    }

    if (this.customLayer) {
      this.customLayer = null;
    }
  }

  //获取唯一id  此id作为前端的唯一标识 对后台没用
  getFeatureKey() {
    return this.featureKey;
  }
  setFeatureKey(featureKey: string) {
    this.featureKey = featureKey;
  }
  getId() {
    return this.id;
  }
  setId(id: string) {
    this.id = id;
  }
  //添加坐标
  addPoint(pts: Array<number>, idx?: number) {
    this.qGeometry.addPoint(pts, idx);
  }
  //改变临时移动点
  setTemporaryCoord(pt: Array<number>) {
    this.qGeometry.setTemporaryCoord(pt);
  }
  // 克隆  创建一个新的实体
  toClone(): DrawCore | null {
    let drawEntityFactory = getQMap()?.drawEntityFactory;
    if (drawEntityFactory) {
      let opts = this.opts;
      let styleObj = this.qStyles.toObjectData();
      let drawEntity: DrawCore | null = drawEntityFactory.createDrawEntity(
        opts.drawType,
        styleObj,
        opts,
      );
      if (drawEntity) {
        let geojson = this.qGeometry.toGeojson(this.featureKey);
        let newCoord = this.qGeometry.toCoordinates(geojson);
        let attribute: any = this.qAttribute.toObjectData();

        drawEntity.qGeometry.setCoordinates(newCoord);
        drawEntity.qAttribute = new QAttribute(attribute);
        drawEntity.setShow(this.show);
        return drawEntity;
      }
    }
    return null;
  }

  /**
   * 属性和 样式
   * @returns
   */
  //获取属性
  getQAttribute(): QAttribute {
    return this.qAttribute;
  }
  // //编辑属性
  // setAttrValue(item: any, value: any) {
  //   this.qAttribute?.setAttributeField(item, value);
  // }
  //编辑属性
  setAttrValues(values: any) {
    this.qAttribute?.setAttributeFields(values);

    const qStyles = this.getQStyles();
    this.labelLayer.updateStyle(qStyles, this.featureKey);
    this.assemblyLayer.updateStyle(qStyles, this.featureKey);
  }
  getQAttributeToObjectData() {
    let attribute: any = this.qAttribute.toObjectData();
    let geojson: any = this.qGeometry.toGeojson(this.featureKey);

    let obj = {
      o_drawType: this.drawName,
      o_featureKey: this.getFeatureKey(),
      o_show: this.show,
      o_geometry: JSON.stringify(geojson?.geometry),
      ...attribute,
    };
    return obj;
  }
  //获取样式
  getQStyles(): QStyles {
    return this.qStyles;
  }
  //编辑  进入编辑状态
  setEdit(isEdit: boolean) {
    if (isEdit) {
      if (this.controlPointLayer == null) {
        this.controlPointLayer = new ControlPointLayer(
          this.map,
          this.getFeatureKey(),
        );
      }
      let ctrlPointList = this.qGeometry.createCtrlPoint(
        this.controlPointHasMid,
        this.featureKey,
      );
      this.controlPointLayer.createCtrlPt(ctrlPointList, this.allowCurve);
      this.labelLayer.startDragNote();
      this.assemblyLayer.startDragNote();
    } else {
      if (this.controlPointLayer != null) {
        this.controlPointLayer.removeCtrlPt();
        this.controlPointLayer = null;
      }
      this.labelLayer.endDragNote();
      this.assemblyLayer.endDragNote();
    }
  }
  //  控制点的显示隐藏
  setControlPointShow(boo: boolean) {
    if (this.controlPointLayer) {
      this.controlPointLayer.setShow(boo);
    }
  }
  // 完成 结束
  complete() {
    this.qGeometry.temporaryCoord = null;
    this.setUpdateState('geojson');
  }
  //是否满足完成条件
  //是否完成
  isComplete() {
    return false;
  }
  // 箭头用到  渲染前再次处理数据
  createDrawData(qGeometry: QGeometry): any {
    return null;
  }
}

export default DrawCore;
