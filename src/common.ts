declare global {
  interface Window {
    qConf: any;
  }
}



export const appId = window.qConf.appId;

export const serverUrl = window.qConf.ip;
export const ssoLoginUrl = window.qConf.ssoLoginUrl;
export const ssoUrl = `${serverUrl}/sso-server`;
export const glyphsUrl = window.qConf.glyphsUrl;

export const dataUrl = window.qConf.dataUrl;

export const datamg = dataUrl + '/datamg';
export const authUrl = dataUrl + '/auth';
export const coreUrl = dataUrl + '/core';
export const imgUrl = dataUrl + '/image';

export const systemTitle = window.qConf.systemTitle;



export const defaultMapLayer = {
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

export const groupId = window.qConf.groupId;
export const qProjectId = window.qConf.qProjectId;
export const sceneId = window.qConf.sceneId;
export const terrainId = window.qConf.terrainId;
export const keypointId = window.qConf.keypointId;


export const cityId = window.qConf.cityId;
export const countyId = window.qConf.countyId;
export const rvMetaId = window.qConf.rvMetaId;
export const riverMetaId = window.qConf.riverMetaId;
export const riverRelationMetaId = window.qConf.riverRelationMetaId;
export const rv_service = window.qConf.rv_service;
export const liuyuId = window.qConf.liuyuId;


