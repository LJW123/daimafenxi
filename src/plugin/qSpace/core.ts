/**
 * 整个map导出 出口
 */
import QMapModel from './mapboxEx/mapModel/QMapModel';

import BaseQMap from './mapboxEx/mapsView/baseMap/Map';
import { RollerQMap, RollerQMaps } from './mapboxEx/mapsView/rollerMap/Map';
import {
  MultiwindowQMap,
  MultiwindowQMaps,
} from './mapboxEx/mapsView/multiwindowMap/Map';

import QProject from './mapboxEx/mapModel/QProject';
import SquareGrid from './mapboxEx/squareRid/squaregrid';
import ToolBox from './mapboxEx/tool/ToolBox';
import MapSource from './mapboxEx/mapModel/MapSource';
import MapLayer from './mapboxEx/layers/layer/MapLayer';
import Tiles3Dlayer from './mapboxEx/layers/layer/Tiles3Dlayer';
import FeatureLayer from './mapboxEx/layers/layer/FeatureLayer';
import TerrainLayer from './mapboxEx/layers/layer/TerrainLayer';
import DrawEntityFactory from './mapboxEx/draw/core/DrawEntityFactory';

import GeometryHighlightedLayer from './mapboxEx/layers/other/GeometryHighlightedLayer';
import FeatureHighlightedLayer from './mapboxEx/layers/other/FeatureHighlightedLayer';
import EmergencyLayer from './mapboxEx/layers/other/EmergencyLayer';
import GeometryLayer from './mapboxEx/layers/other/GeometryLayer';
import GeometryLayer2 from './mapboxEx/layers/other/GeometryLayer2';

import BaseScene from './mapboxEx/baseScene/BaseScene';
import BusinessScene from './mapboxEx/baseScene/BusinessScene';

import DrawCore from './mapboxEx/draw/core/DrawCore';
import QGeometry from './mapboxEx/draw/core/QGeometry';
import QCoordinate from './mapboxEx/draw/qCoord/QCoordinate';
import DrawCollection from './mapboxEx/draw/core/DrawCollection';
import Color from './util/Color';
import QStyles from './mapboxEx/draw/core/QStyles';
import entityList from './mapboxEx/draw/core/entityList';

import * as toolList from './mapboxEx/tool/toolList';

import DeduceCollection from './mapboxEx/deduce/DeduceCollection';

import DeduceDrawEntity from './mapboxEx/deduce/node/DeduceDrawEntity';
import DeduceCamera from './mapboxEx/deduce/node/DeduceCamera';
import DeduceDataLayer from './mapboxEx/deduce/node/DeduceDataLayer';
import DeduceQPage from './mapboxEx/deduce/node/DeduceQPage';

import CameraEffect from './mapboxEx/deduce/effect/CameraEffect';
import EntityEffect from './mapboxEx/deduce/effect/EntityEffect';
import LayerEffect from './mapboxEx/deduce/effect/LayerEffect';
import QpageEffect from './mapboxEx/deduce/effect/QpageEffect';

import ProjectFn from './mapboxEx/mapAxios/project';
import STObjectFn from './mapboxEx/mapAxios/stobject';
import MetainfoFn from './mapboxEx/mapAxios/metainfo';

import QLayerDataModel from './mapboxEx/mapModel/QLayerDataModel';

import * as exportMap from './mapboxEx/export/index';

import QPagePositionCollection from './mapboxEx/qPagePart/QPagePositionCollection';
import QPagePosition from './mapboxEx/qPagePart/QPagePosition';

// import Animation from './animation/Animation';
import {
  importProject,
  querySceneId,
  queryBasicmapList,
} from './mapboxEx/func';

import * as G2 from '@antv/g2';

import { renderFunction } from './util/requestAnimationFrameFn';
renderFunction();
declare global {
  interface Window {
    QMapboxGl: any;
  }
}

declare global {
  interface Window {
    WindGL: any;
  }
}

declare global {
  interface Window {
    Handlebars: any;
  }
}

const QMapGl: any = window.QMapboxGl;
// const QMapGl: any = window.maptilersdk;
const QCompare: any = QMapGl.Compare;
QMapGl.config.MAX_PARALLEL_IMAGE_REQUESTS = 256;

const WindGL: any = window.WindGL;

const Handlebars: any = window.Handlebars;

declare global {
  interface Window {
    G2: any;
  }
}
window.G2 = G2;

declare global {
  interface Window {
    qSpaceToken: any;
  }
}

declare global {
  interface Window {
    THREE: any;
  }
}

//地图
// export let qMap: QMapModel | null = null;
// export let setQMap = (qmap: QMapModel | null) => {
//   if (qMap) qMap.destroy();
//   if (qmap == null && qMap !== null) {
//     qMap.Evented._events = {};
//   }
//   qMap = qmap;
// };
let qMapList: Array<QMapModel> = [];

let setQMap = (id: string, qmap: QMapModel | null) => {
  let num = qMapList.findIndex((item: QMapModel) => item.id === id);
  if (qmap === null) {
    if (num > -1) {
      qMapList[num].Evented._events = {};
      qMapList.splice(num, 1);
    }
  } else {
    if (num > -1) {
      qMapList.splice(num, 1, qmap);
    } else {
      qMapList.push(qmap);
    }
  }
};

let getQMap = (id?: string): QMapModel | null => {
  if (id === undefined) {
    return qMapList.length > 0 ? qMapList[0] : null;
  }
  let num = qMapList.findIndex((item: QMapModel) => item.id === id);
  if (num > -1) {
    return qMapList[num];
  } else {
    return null;
  }
};

// 请求地址
let groupId: string | number | null = null;
const setGroupId = (url: string | number | null) => {
  groupId = url;
};
const getGroupId = () => {
  return groupId;
};

// 请求 组织id
let dataUrl: string = '';
const setDataUrl = (url: string) => {
  dataUrl = url;
};
const getDataUrl = () => {
  return dataUrl;
};

// 静态路径
let PUBLIC_PATH: string = '';
const setPUBLIC_PATH = (url: string) => {
  PUBLIC_PATH = url;
};
const getPUBLIC_PATH = () => {
  return PUBLIC_PATH;
};

//矢量类型模板
let metaTemplate: any | null = null;
let setmetaTemplate = (temp: any) => {
  metaTemplate = temp;
};

const glyphsUrl = window.qConf.glyphsUrl;
const defaultMapLayer = {
  sources: {
    底图影像: {
      tileSize: 256,
      type: 'raster',
      tiles: [window.qConf.defaultBaseMapUrl],
    },
  },
  layers: [
    {
      id: '底图影像',
      type: 'raster',
      source: '底图影像',
    },
  ],
};

const defStyle = {
  version: 8,
  id: '1',
  // center: [105, 35],
  center: [85.4850833323876 , 41.821024534128696],
  zoom: 4,
  sources: {},
  layers: [
    {
      id: 'bg_lay',
      type: 'background',
      paint: {
        'background-color': 'rgba(0, 0, 0, 0)',
      },
    },
  ],
  glyphs: glyphsUrl,
};

const defBaseStyle = {
  id: '11',
  style: JSON.stringify({
    layers: [...(defaultMapLayer?.layers || [])],
    sources: { ...(defaultMapLayer?.sources || {}) },
  }),
};

const noneBaseStyle = {
  id: '00',
  style: JSON.stringify({
    layers: [],
    sources: {},
  }),
};

interface MapDataTypeModel {
  code: string;
  name: string;
}

const mapDataType: MapDataTypeModel[] = [
  {
    code: '0101',
    name: '矢量',
    // whichLayer: 'engineTile',
    // whichLayer: 'vector',
  },
  {
    code: '0102',
    name: '栅格-影像',
    // whichLayer: 'tile',
  },
  // {
  //   code: '0103',
  //   name: '文件',
  //   whichLayer: '',
  // },
  {
    code: '0201',
    name: '引擎服务',
    // whichLayer: 'engineTile',
  },
  {
    code: '0202',
    name: '地图服务',
    // whichLayer: 'tile',
  },
  {
    code: '0203',
    name: '地形服务',
    // whichLayer: 'terrain',
  },
  {
    code: '0204',
    name: '倾斜服务',
    // whichLayer: 'tiles3d',
  },
  // {
  //   code: '0205',
  //   name: 'bim服务',
  //   whichLayer: 'bim',
  // },
  // {
  //   code: '0206',
  //   name: '引擎地形服务',
  //   whichLayer: 'terrain',
  // },
  // {
  //   code: '0207',
  //   name: '点云服务',
  //   whichLayer: 'tiles3d',
  // },
];

//工具
interface QToolModel {
  // toolName: string;
  activate(opts: any): void;
  disable(): void;

  leftDownEvent(eve: any): void;
  leftUpEvent(eve: any): void;
  leftClickEvent(eve: any): void;
  leftDoubleClickEvent(eve: any): void;
  rightClickEvent(eve: any): void;
  mouseMoveEvent(eve: any): void;
}

//工具 模板
interface ToolModel {
  alias: string;
  name: string;
  icon: string;
  tool: any; //工具本身
  type: string; //工具类型  用于区别工具
  id?: any; //额外记录数据
}

/**
 * 实体模型
 */
interface EntityModel {
  alias: string; //别名
  name: string; //名字  用于识别和new  指向是个什么实体
  icon: string; //图标
  type: string; //实体分类  用于区别类型

  tool: string; //工具名称  指向new这个实体需要调用的工具
  qEntity: typeof DrawCore; //实体本身
  qStyles: string; //实体样式
  qGeometry: typeof QGeometry; //实体数据类型
}

//底图默认模板
interface BaseDefaultLayerModel {
  type: string;
  name: string;
  url: string;
  show?: boolean;
  layers?: any[];
  [key: string]: any;
}

// 图表模块结构
interface ChartModel {
  id: string;
  name: string;
  icon: string;
  chartType: string;
  oldData: any;
}

interface CameraData {
  pitch: number; //俯仰角
  bearing: number; //方位角
  zoom: number;
  longitude: number; //相机位置 经度
  latitude: number; //纬度
}

// 时序数据  影像数据  在推演中的结构
interface DataLayerEffect {
  name: string; //名称
  layerList: any[]; //图层列表
}

// 图表模块 推演参数结构
interface ChartEffect {
  show: boolean;
  [key: string]: any;
}

type MapType = 'normal' | 'roller' | 'multiwindow';

// 时序数据  影像数据  在推演中的结构
interface CameraOptions {
  zoom?: number;
  pitch?: number;
  bearing?: number;
  padding?: number;
}

type ViewingAngleModes = 'nothing' | 'people' | 'car' | 'plane';

const viewingAngleModesObj = {
  nothing: {},
  people: {
    pitch: 80, //俯仰角
    zoom: 15.5,
    speed: 0.5,
  },
  car: {
    pitch: 80, //俯仰角
    zoom: 15.2,
    speed: 1,
  },
  plane: {
    pitch: 45, //俯仰角
    zoom: 14,
    speed: 5,
  },
};

type DeduceNodeType =
  | DeduceCamera
  | DeduceDrawEntity
  | DeduceDataLayer
  | DeduceQPage;
type DeduceEffectType = CameraEffect | EntityEffect | LayerEffect | QpageEffect;

const labelTemplates: any = [
  {
    id: '1',
    name: '模版1',
    content: (a: any, b: any) => {
      if (b) {
        return `<div style="width: 100%;height: 100%;color: #30cdd8;text-align:center;background-image: url(./images/popup1.png);background-position:center;background-size: 100% 100%;background-repeat: no-repeat;"><div style="padding:20px 43px 10px 30px"><div style="font-size:20px;">${a}</div><div style="font-size:14px;">${
          b || ''
        }</div></div></div>`;
      } else {
        return `<div style="width: 100%;height: 100%;color: #30cdd8;text-align:center;background-image: url(./images/popup1.png);background-position:center;background-size: 100% 100%;background-repeat: no-repeat;"><div style="padding:40px 43px 10px 30px"><div style="font-size:20px;">${a}</div></div></div>`;
      }
    },
  },
];

// #127C84

// color: #5B8FF9;
// color: #5AD8A6;
// color: #CDF3E4;
// color: #5D7092;
// color: #CED4DE;
// color: #F6BD16;
// color: #FCEBB9;
// color: #6F5EF9;
// color: #D3CEFD;
// color: #6DC8EC;
// color: #D3EEF9;
// color: #945FB9;
// color: #DECFEA;
// color: #FF9845;
// color: #FFE0C7;
// color: #1E9493;
// color: #BBDEDE;
// color: #FF99C3;
// color: #FFE0ED;
// '#5B8FF9',
//   '#5AD8A6',
//   '#CDF3E4',
//   '#5D7092',
// '#CED4DE',
// '#F6BD16',
// '#FCEBB9',
// '#6F5EF9',
// '#D3CEFD',
// '#6DC8EC',
// '#D3EEF9',
// '#945FB9',
// '#DECFEA',
// '#FF9845',
// '#FFE0C7',
// '#1E9493',
// '#BBDEDE',
// '#FF99C3',
// '#FFE0ED',

export {
  setDataUrl,
  getDataUrl,
  setGroupId,
  getGroupId,
  setPUBLIC_PATH,
  getPUBLIC_PATH,
  QMapGl,
  QCompare,
  WindGL,
  Handlebars,
  qMapList,
  setQMap,
  getQMap,
  metaTemplate,
  setmetaTemplate,
  defStyle,
  defBaseStyle,
  noneBaseStyle,
  MapDataTypeModel,
  mapDataType,
  QToolModel,
  ToolModel,
  EntityModel,
  BaseDefaultLayerModel,
  ChartModel,
  CameraData,
  DataLayerEffect,
  ChartEffect,
  MapType,
  CameraOptions,
  ViewingAngleModes,
  viewingAngleModesObj,
  DeduceNodeType,
  DeduceEffectType,
  labelTemplates,
  BaseQMap,
  RollerQMap,
  RollerQMaps,
  MultiwindowQMap,
  MultiwindowQMaps,
  QProject,
  BaseScene,
  BusinessScene,
  SquareGrid,
  TerrainLayer,
  QMapModel,
  ToolBox,
  toolList,
  MapLayer,
  Tiles3Dlayer,
  FeatureLayer,
  MapSource,
  DrawEntityFactory,
  entityList,
  FeatureHighlightedLayer,
  GeometryHighlightedLayer,
  EmergencyLayer,
  DrawCore,
  QGeometry,
  DrawCollection,
  ProjectFn,
  MetainfoFn,
  STObjectFn,
  QLayerDataModel,
  DeduceCollection,
  DeduceDrawEntity,
  DeduceCamera,
  EntityEffect,
  CameraEffect,
  QpageEffect,
  DeduceQPage,
  Color,
  QStyles,
  QCoordinate,
  exportMap,
  QPagePositionCollection,
  QPagePosition,
  importProject,
  querySceneId,
  queryBasicmapList,
  LayerEffect,
  DeduceDataLayer,
  GeometryLayer,
  GeometryLayer2,
};
