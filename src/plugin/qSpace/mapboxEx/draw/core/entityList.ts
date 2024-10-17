import { EntityModel } from '../../../core';

// 点
import Point from '../qEntity/point/point';
import QPoint from '../qEntity/point/qPoint';

// 线
import Linestring from '../qEntity/linestring/lineString';
import QLinestring from '../qEntity/linestring/qLinestring';

// 多边形
import Polygon from '../qEntity/polygon/polygon';
import QPolygon from '../qEntity/polygon/qPolygon';

// 多边形线
import PolygonLine from '../qEntity/polygonLine/polygonLine';
import QPolygonLine from '../qEntity/polygonLine/qPolygonLine';

// 矩形
import Rectangle from '../qEntity/rectangle/rectangle/rectangle';
import QRectangle from '../qEntity/rectangle/rectangle/qRectangle';

// 正矩形
import NortherlinessRectangle from '../qEntity/rectangle/northerlinessRectangle/rectangle';
import QNortherlinessRectangle from '../qEntity/rectangle/northerlinessRectangle/qRectangle';

// 圆
import Ellipse from '../qEntity/ellipse/ellipse';
import QEllipse from '../qEntity/ellipse/qEllipse';

// 注记
import Text from '../qEntity/text/text';
import QText from '../qEntity/text/qText';

// 标注
// import TextDiv from '../qEntity/textDiv/textDiv';
// import QTextDiv from '../qEntity/textDiv/qTextDiv';

// 动态点
import DynamicPoint from '../qEntity/dynamic/dynamicPoint/dynamicPoint';
import QDynamicPoint from '../qEntity/dynamic/dynamicPoint/qDynamicPoint';

import DynamicLine from '../qEntity/dynamic/dynamicLine/dynamicLine';
import QDynamicLine from '../qEntity/dynamic/dynamicLine/qDynamicLine';

// 模型
import QModel from '../qEntity/threeModels/qModel';
import LiaoNingHaoModel from '../qEntity/threeModels/liaoninghao';
import WeiXingModel from '../qEntity/threeModels/weixing';
// import LeidaModel from '../qEntity/threeModels/leida';

// 图标
import IconBase from '../qEntity/iconBase/icon_base';
import QIconBase from '../qEntity/iconBase/qIconBase';

// 军标
import IconMilitary from '../qEntity/iconMilitary/icon_military';
import QIconMilitary from '../qEntity/iconMilitary/qIconMilitary';

// 立方体
import Cube from '../qEntity/cube/cube';
import QCube from '../qEntity/cube/qCube';

// 箭头符号
import AttackArrow from '../qEntity/arrows/attackArrow';
import DoubleArrow from '../qEntity/arrows/doubleArrow';
import GatheringPlace from '../qEntity/arrows/gatheringPlace';
import SquadCombat from '../qEntity/arrows/squadCombat';
import StraightArrow from '../qEntity/arrows/straightArrow';
import FineArrow from '../qEntity/arrows/fineArrow';
import TailedAttackArrow from '../qEntity/arrows/tailedattackArrow';

import QArrows from '../qEntity/arrows/qArrows';

// 自定义图片
import IconCustom from '../qEntity/IconCustom/icon_custom';
import QIconCustom from '../qEntity/IconCustom/qIconCustom';

// Three 实体
// import ThreeRadianLine from '../qThreeEntity/line/radianLine';
// import ThreeQLinestring from '../qThreeEntity/line/qLinestring';

// 曲线
// import CurveLinestring from '../qEntity/curve/linestring/lineString';
// import QCurveLinestring from '../qEntity/curve/linestring/qLinestring';

// 水  面
import WaterPolygonCustom from '../qEntity/custom/water/polygon/polygon';
import WaterPolygonCustom1 from '../qEntity/custom/water/polygon/polygon1';
import WaterPolygonCustom2 from '../qEntity/custom/water/polygon/polygon2';
import QWaterPolygonCustom from '../qEntity/custom/water/polygon/qPolygon';

const base: EntityModel[] = [
  {
    alias: '点',
    name: 'Point',
    icon: 'icon-webicon318',
    type: 'base',
    tool: 'addTool',
    qEntity: Point,
    qStyles: 'circle',
    qGeometry: QPoint,
  },
  {
    alias: '线',
    name: 'Linestring',
    icon: 'icon-xian',
    type: 'base',
    tool: 'addTool',
    qEntity: Linestring,
    qStyles: 'line',
    qGeometry: QLinestring,
  },
  {
    alias: '闭合线',
    name: 'PolygonLine',
    icon: 'icon-bihexian',
    type: 'base',
    tool: 'addTool',
    qEntity: PolygonLine,
    qStyles: 'line',
    qGeometry: QPolygonLine,
  },
  {
    alias: '填充多边形',
    name: 'Polygon',
    icon: 'icon-duobianxing',
    type: 'base',
    tool: 'addTool',
    qEntity: Polygon,
    qStyles: 'fill',
    qGeometry: QPolygon,
  },
  {
    alias: '矩形',
    name: 'Rectangle',
    icon: 'icon-juxing2',
    type: 'base',
    tool: 'addTool',
    qEntity: Rectangle,
    qStyles: 'fill',
    qGeometry: QRectangle,
  },
  {
    alias: '正矩形',
    name: 'NortherlinessRectangle',
    icon: 'icon-juxing_1',
    type: 'base',
    tool: 'addTool',
    qEntity: NortherlinessRectangle,
    qStyles: 'fill',
    qGeometry: QNortherlinessRectangle,
  },
  {
    alias: '圆',
    name: 'Ellipse',
    icon: 'icon-tuoyuan',
    type: 'base',
    tool: 'addTool',
    qEntity: Ellipse,
    qStyles: 'fill',
    qGeometry: QEllipse,
  },
  {
    alias: '立方体',
    name: 'Cube',
    icon: 'icon-pt-lifangti',
    type: 'base',
    tool: 'addTool',
    qEntity: Cube,
    qStyles: 'fill-extrusion',
    qGeometry: QCube,
  },
];

const text: EntityModel[] = [
  {
    alias: '注记',
    name: 'Text',
    icon: 'icon-zhuji',
    type: 'base',
    tool: 'addTool',
    qEntity: Text,
    qStyles: 'symbol_text',
    qGeometry: QText,
  },
  // {
  //   alias: '标注',
  //   name: 'TextDiv',
  //   icon: 'icon-zhuji',
  //   type: 'base',
  //   tool: 'addTool',
  //   qEntity: TextDiv,
  //   qStyles: 'symbol_text',
  //   qGeometry: QTextDiv,
  // },
];

const dynamic: EntityModel[] = [
  {
    alias: '动态点',
    name: 'DynamicPoint',
    icon: 'icon-webicon318',
    type: 'base',
    tool: 'addTool',
    qEntity: DynamicPoint,
    qStyles: 'symbol_icon_dynamic',
    qGeometry: QDynamicPoint,
  },
  {
    alias: '动态线',
    name: 'DynamicLine',
    icon: 'icon-xian',
    type: 'base',
    tool: 'addTool',
    qEntity: DynamicLine,
    qStyles: 'line_dynamic',
    qGeometry: QDynamicLine,
  },
  // {
  //   alias: '曲线',
  //   name: 'Curve_line',
  //   icon: 'icon-xian',
  //   type: 'base',
  //   tool: 'addTool',
  //   qEntity: CurveLinestring,
  //   qStyles: 'line',
  //   qGeometry: QCurveLinestring,
  // },
  // {
  //   alias: '弧度线',
  //   name: 'Radian_line',
  //   icon: 'icon-webicon318',
  //   type: 'base',
  //   tool: 'addTool',
  //   qEntity: ThreeRadianLine,
  //   qStyles: 'three_line',
  //   qGeometry: ThreeQLinestring,
  // },
  {
    alias: '水',
    name: 'WaterPolygon',
    icon: 'icon-xian',
    type: 'base',
    tool: 'addTool',
    qEntity: WaterPolygonCustom1,
    qStyles: 'water',
    qGeometry: QWaterPolygonCustom,
    // qGeometry: QModel,
    // qEntity: Polygon,
    // qGeometry: QPolygon,
  },
];

const model: EntityModel[] = [
  {
    alias: '辽宁号',
    name: 'liaoninghao',
    icon: 'icon-moxingguanli',
    type: 'model',
    tool: 'addTool',
    qEntity: LiaoNingHaoModel,
    qStyles: 'symbol_model',
    qGeometry: QModel,
  },
  {
    alias: '卫星',
    name: 'weixing',
    icon: 'icon-moxingguanli',
    type: 'model',
    tool: 'addTool',
    qEntity: WeiXingModel,
    qStyles: 'symbol_model',
    qGeometry: QModel,
  },
  // {
  //   alias: '雷达',
  //   name: 'leida',
  //   icon: 'icon-moxingguanli',
  //   type: 'model',
  //   tool: 'addTool',
  //   qEntity: LeidaModel,
  //   qStyles: 'symbol_model',
  //   qGeometry: QModel,
  // },
];

const icon_military: EntityModel[] = [
  {
    alias: '军标',
    name: 'IconMilitary',
    icon: 'iconwebicon318',
    type: 'iconMilitary',
    tool: 'addTool',
    qEntity: IconMilitary,
    qStyles: 'symbol_icon_military',
    qGeometry: QIconMilitary,
  },
];

const icon_base: EntityModel[] = [
  {
    alias: '图标',
    name: 'IconBase',
    icon: 'iconwebicon318',
    type: 'iconBase',
    tool: 'addTool',
    qEntity: IconBase,
    qStyles: 'symbol_icon',
    qGeometry: QIconBase,
  },
];

const arrow: EntityModel[] = [
  {
    alias: '进攻方向',
    name: 'AttackArrow',
    icon: 'icon-jingongfangxiang',
    type: 'arrows',
    tool: 'addTool',
    qEntity: AttackArrow,
    qStyles: 'fill',
    qGeometry: QArrows,
  },
  {
    alias: '钳击',
    name: 'DoubleArrow',
    icon: 'icon-qianji',
    type: 'arrows',
    tool: 'addTool',
    qEntity: DoubleArrow,
    qStyles: 'fill',
    qGeometry: QArrows,
  },
  {
    alias: '聚集地',
    name: 'GatheringPlace',
    icon: 'icon-jujidi',
    type: 'arrows',
    tool: 'addTool',
    qEntity: GatheringPlace,
    qStyles: 'fill',
    qGeometry: QArrows,
  },
  {
    alias: '箭头',
    name: 'SquadCombat',
    icon: 'icon-jiantou',
    type: 'arrows',
    tool: 'addTool',
    qEntity: SquadCombat,
    qStyles: 'fill',
    qGeometry: QArrows,
  },
  {
    alias: '直箭头',
    name: 'StraightArrow',
    icon: 'icon-zhijiantou',
    type: 'arrows',
    tool: 'addTool',
    qEntity: StraightArrow,
    qStyles: 'line',
    qGeometry: QArrows,
  },
  {
    alias: '细直箭头',
    name: 'FineArrow',
    icon: 'icon-xizhijiantou',
    type: 'arrows',
    tool: 'addTool',
    qEntity: FineArrow,
    qStyles: 'fill',
    qGeometry: QArrows,
  },
  {
    alias: '燕尾箭头',
    name: 'TailedAttackArrow',
    icon: 'icon-yanweijiantou',
    type: 'arrows',
    tool: 'addTool',
    qEntity: TailedAttackArrow,
    qStyles: 'fill',
    qGeometry: QArrows,
  },
];

const icon_1: EntityModel[] = [
  {
    alias: '自定义',
    name: 'IconCustom',
    icon: 'iconwebicon318',
    type: 'iconCustom',
    tool: 'addTool',
    qEntity: IconCustom,
    qStyles: 'symbol_icon_military',
    qGeometry: QIconCustom,
  },
];

const entityList: EntityModel[] = [
  ...base,
  ...text,
  ...dynamic,
  ...model,
  ...icon_military,
  ...icon_base,
  ...arrow,
  ...icon_1,

  /**
   * 这俩文本需要重新考虑
   * 主要是 点击选中和拖拽移动
   */
  // {
  //   alias: '文本1',
  //   name: 'Div',
  //   icon: 'iconwebicon318',
  //   type: 'base',
  //   qEntity: Div,
  // },
  // {
  //   alias: '文本2',
  //   name: 'Div2',
  //   icon: 'iconwebicon318',
  //   type: 'base',
  //   qEntity: Div2,
  // },

  /**
   * mapbox 里线没有高度···
   * 墙怎么做···
   */
  // {
  //   alias: '区域',
  //   name: 'PolygonWall',
  //   icon: 'iconmian',
  //   type: 'base',
  //   qEntity: PolygonWall,
  // },
  // {
  //   alias: '墙',
  //   name: 'Wall',
  //   icon: 'iconwall',
  //   type: 'base',
  //   qEntity: Wall,
  // },
  // {
  //   alias: '封闭墙',
  //   name: 'ClosedWall',
  //   icon: 'iconwall',
  //   type: 'base',
  //   qEntity: ClosedWall,
  // },
  /**
   * 需要额外加一个model  点击两点 计算缓冲区
   */
];
export default entityList;
