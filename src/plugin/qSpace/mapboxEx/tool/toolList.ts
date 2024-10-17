import { ToolModel } from '../../core';

import AddTool from './tools/AddTool';
import SelectTool from './tools/SelectTool';

//
import MeasureExtentTool from './tools/extra/MeasureExtentTool';
import MeasureAreaTool from './tools/extra/MeasureAreaTool';
import MeasureVolumeTool from './tools/extra/MeasureVolumeTool';
import AngleTool from './tools/extra/AngleTool';
import ProfileLineTool from './tools/extra/ProfileLineTool';
import RhumbBearingTool from './tools/extra/RhumbBearingTool';
import VisibilityAnalysisTool from './tools/extra/VisibilityAnalysisTool';

// 推演
import DrawTrajectoryTool from './tools/deduce/DrawTrajectoryTool';

// 拾取
import PickPointLonLatTool from './tools/pick/PickPointLonLatTool';
import PickPolygonTool from './tools/pick/PickPolygonTool';
import PickLineTool from './tools/pick/PickLineTool';
import PickRectangleTool from './tools/pick/PickRectangleTool';

// 查询
// import ClickQueryBusinessTool from './tools/query/ClickQueryBusinessTool';
// import ClickQueryDataTool from './tools/query/ClickQueryDataTool';
// import ClickQueryAreaDataTool from './tools/query/ClickQueryAreaDataTool';
// import ClickQueryBufferDataTool from './tools/query/ClickQueryBufferDataTool';

import ClickQueryTool from './tools/ClickQueryTool';
import MapClickTool from './tools/MapClickTool';
import MapMoveTool from './tools/MapMoveTool';

// 选择
export const selectToolList: ToolModel[] = [
  {
    name: 'selectTool',
    alias: '选择',
    icon: 'icon-pt-xuanze',
    tool: SelectTool,
    type: 'select',
  },
];

// 添加 绘制
export const drawToolList: ToolModel[] = [
  {
    name: 'addTool',
    alias: '添加',
    icon: '',
    tool: AddTool,
    type: 'draw',
  },
];
// 测量工具
export const measureToolList: ToolModel[] = [
  {
    name: 'measureExtentTool',
    alias: '测距',
    icon: 'icon-pt-cejuli',
    tool: MeasureExtentTool,
    type: 'map',
  },
  {
    name: 'measureAreaTool',
    alias: '测面积',
    icon: 'icon-pt-celiangmianji',
    tool: MeasureAreaTool,
    type: 'map',
  },
  {
    name: 'measureVolumeTool',
    alias: '测体积',
    icon: 'icon-pt-cetiji',
    tool: MeasureVolumeTool,
    type: 'map',
  },
  {
    name: 'angleTool',
    alias: '测角度',
    icon: 'icon-pt-cejiaodu1',
    tool: AngleTool,
    type: 'map',
  },
  {
    name: 'rhumbBearingTool',
    alias: '测正北角',
    icon: 'icon-pt-cezhengbeijiao',
    tool: RhumbBearingTool,
    type: 'map',
  },
  {
    name: 'profileLineTool',
    alias: '剖面线',
    icon: 'icon-pt-poumianxian',
    tool: ProfileLineTool,
    type: 'map',
  },
  {
    name: 'visibilityAnalysisTool',
    alias: '通视',
    icon: 'icon-tongshifenxi',
    tool: VisibilityAnalysisTool,
    type: 'map',
  },
];

// 推演 轨迹线
export const deduceToolList: ToolModel[] = [
  {
    name: 'drawTrajectoryTool',
    alias: '画轨迹线',
    icon: '',
    tool: DrawTrajectoryTool,
    type: 'deduce',
  },
];

// 查询工具
export const queryToolList: ToolModel[] = [
  {
    name: 'mapClickTool',
    alias: '地图查询',
    icon: 'icon-a-shujuchaxunshujukuchaxun',
    tool: MapClickTool,
    type: 'query',
  },
  {
    name: 'clickQueryTool',
    alias: '点击查询',
    icon: 'icon-a-shujuchaxunshujukuchaxun',
    tool: ClickQueryTool,
    type: 'query',
  },
  {
    name: 'moveQueryTool',
    alias: '移动查询',
    icon: 'icon-a-shujuchaxunshujukuchaxun',
    tool: MapMoveTool,
    type: 'query',
  },
  // {
  //   name: 'clickQueryDataTool',
  //   alias: '数据点击查询',
  //   icon: 'icon-a-shujuchaxunshujukuchaxun',
  //   tool: ClickQueryDataTool,
  //   type: 'query',
  // },
  // {
  //   name: 'clickQueryBusinessTool',
  //   alias: '业务点击查询',
  //   icon: 'icon-pt-yewuchaxun',
  //   tool: ClickQueryBusinessTool,
  //   type: 'query',
  // },
  // {
  //   name: 'clickQueryAreaDataTool',
  //   alias: '业务区域查询',
  //   icon: 'icon-pt-quyuchaxun',
  //   tool: ClickQueryAreaDataTool,
  //   type: 'query',
  // },
  // {
  //   name: 'clickQueryBufferDataTool',
  //   alias: '业务缓冲区查询',
  //   icon: 'icon-pt-huanchongquchaxun',
  //   tool: ClickQueryBufferDataTool,
  //   type: 'query',
  // },
];

// 获取坐标工具
export const pickToolList: ToolModel[] = [
  {
    name: 'pickPointTool',
    alias: '点坐标拾取',
    icon: 'icon-pt-zuobiaoshiqu',
    tool: PickPointLonLatTool,
    type: 'pick',
  },
];

// 额外的
export const extraToolList: ToolModel[] = [
  {
    name: 'pickLineTool',
    alias: '拾取线',
    icon: 'icon-pt-zuobiaoshiqu',
    tool: PickLineTool,
    type: '',
  },
  {
    name: 'pickPolygonTool',
    alias: '拾取多边形',
    icon: 'icon-pt-zuobiaoshiqu',
    tool: PickPolygonTool,
    type: '',
  },
  {
    name: 'pickRectangleTool',
    alias: '拾取矩形',
    icon: 'icon-pt-zuobiaoshiqu',
    tool: PickRectangleTool,
    type: '',
  },
];

export const allToolList: ToolModel[] = [
  ...selectToolList,
  ...drawToolList,
  ...measureToolList,
  ...queryToolList,
  ...deduceToolList,
  ...pickToolList,
  ...extraToolList,
];
