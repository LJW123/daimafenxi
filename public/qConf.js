
//  内
// const url = 'http://10.65.8.231';

// 德帆
// const url = 'http://47.92.111.107:801';
const url = 'http://192.168.1.127';

const ssoLoginUrl = `${url}/usercenter/#/login`; //单点登录地址
const dataUrl = `${url}/ds`; //接口地址
const glyphsUrl = `${url}/font/{fontstack}/{range}.pbf`;
// const defaultBaseMapUrl = `https://server.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}`; //默认底图地址
const defaultBaseMapUrl = `http://192.168.1.127/mapservice/PZXMap/globe_img_n/{z}/{x}/{y}`; //默认底图地址

const qConf = {

  ssoLoginUrl: ssoLoginUrl, //单点登录地址
  ip: `${url}`,
  dataUrl: dataUrl, //接口地址
  glyphsUrl: glyphsUrl,

  appId: '1456734202287680', //单点的ID
  systemTitle: '黄河河防工程信息管理系统',
  // groupId: 1786854443525696,
  // qProjectId: 1786949580056128,
  groupId: 1776549508007488,
  qProjectId: 1797508928112192,
  sceneId: null,
  terrainId: null,
  keypointId: null,
  defaultBaseMapUrl: defaultBaseMapUrl,

  // 流域id
  liuyuId: 1791568011941440,

  // 行政区划
  // 市
  cityId: 1790843254167104,
  // 县
  countyId: 1790843329209920,

  // 河流
  // 上下级关系
  rvMetaId: 1788556946376256,
  // 子集 河流
  riverMetaId: 1786914407884352,

  // 河流上下级总关系
  riverRelationMetaId: 1788556619122240,

  // 全部河流的服务
  // 用于在点击查询时候去找所有子集河流
  rv_service: {
    source: "1787174981539392",
    sourceLayer: '河流'
  },
};


window.qConf = qConf;
