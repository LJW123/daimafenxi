import BaseTool from '../BaseTool';
import { getQMap, MapSource, getDataUrl } from '../../../core';
import * as turf from '@turf/turf';
import axios from 'axios';
import { message } from 'antd';

class ClickQueryTool extends BaseTool {
  constructor() {
    super();
  }
  disable() {
    getQMap()?.geometryHighlightedLayer.removeLayerAll();
    this.unBindEvent();
  }
  leftClickEvent(eve: any) {
    let point = eve.point;
    let maxPoint = {
      x: point.x + 5,
      y: point.y + 5,
    };
    let minPoint = {
      x: point.x - 5,
      y: point.y - 5,
    };
    let map = getQMap()?.getMap();

    let max = map.unproject(maxPoint);
    let min = map.unproject(minPoint);
    let box = turf.bboxPolygon([min.lng, min.lat, max.lng, max.lat]);

    let geometry = box.geometry;

    this.onQuery(geometry);
  }

  onQuery(geometry: any) {
    try {
      let geoJson = JSON.stringify(geometry);
      const datamg = `${getDataUrl()}/datamg`;
      const token = window.qSpaceToken;
      let b = turf.bbox(geometry);

      let maps = getQMap();
      if (maps) {
        const zoom = getQMap()?.getMap().getZoom();
        getQMap()?.geometryHighlightedLayer.removeLayerAll();

        let ajaxlist = [];
        let ajaxlist_raster: any[] = [];

        const layers: MapSource[] = maps.getDataLayerList();
        if (layers.length > 0) {
          let ajaxlist_feature: any[] = [];
          for (let i = 0; i < layers.length; i++) {
            const s: MapSource = layers[i];
            const qLayerData = s.qLayerData;
            if (qLayerData.dataType == 'metainfo') {
              if (qLayerData.metaInfo?.imgType == 'Raster') {
                const id = s.qLayerData.id;
                const params = {
                  metaIds: [id],
                  minx: b[0],
                  miny: b[1],
                  maxx: b[2],
                  maxy: b[3],
                };

                const ajax = axios
                  .create({
                    headers: {
                      token: token,
                    },
                  })
                  .post(`${datamg}/services/raster/queryValue`, params);

                ajaxlist_raster.push(ajax);
              } else if (qLayerData.metaInfo?.imgType == 'Vector') {
                const id = s.qLayerData.id;
                const params = {
                  geoJson: geoJson,
                  loadAttr: true,
                  loadClass: true,
                  l: zoom,
                  metaId: id,
                };
                const ajax = axios
                  .create({
                    headers: {
                      token: token,
                    },
                  })
                  .post(`${datamg}/stobject/query`, params);

                ajaxlist.push(ajax);
              } else if (qLayerData.metaInfo?.imgType == 'Service') {
                if (qLayerData.which?.code == '0201') {
                  let params = {
                    geoJson: geoJson,
                    loadAttr: true,
                    loadClass: true,
                    l: zoom,
                  };

                  let url = `${qLayerData.attributes.serviceUrl}/feature`;

                  let ajax = axios
                    .create({
                      headers: {
                        token: token,
                      },
                    })
                    .post(url, params);
                  ajaxlist.push(ajax);
                }
              }
            } else if (qLayerData.dataType == 'feature') {
              const id = s.qLayerData.metaInfo.from;
              const has = ajaxlist_feature.find((it) => it == id);
              if (!has) {
                const params = {
                  geoJson: geoJson,
                  loadAttr: true,
                  loadClass: true,
                  l: zoom,
                  metaId: id,
                };

                const ajax = axios
                  .create({
                    headers: {
                      token: token,
                    },
                  })
                  .post(`${datamg}/stobject/query`, params);

                ajaxlist_feature.push(id);
                ajaxlist.push(ajax);
              }
            }
          }
        }

        const businessScene = getQMap()?.businessScene || [];
        for (let index = 0; index < businessScene.length; index++) {
          const business = businessScene[index];
          const sources = business?.sources || {};
          const sourcesKeys = Object.keys(sources);
          if (sourcesKeys.length > 0) {
            for (let i = 0; i < sourcesKeys.length; i++) {
              const key = sourcesKeys[i];
              const it = sources[key];
              if (it.tt) {
                if (it.tt == 'data') {
                  let params = {
                    geoJson: geoJson,
                    loadAttr: true,
                    loadClass: true,
                    l: zoom,
                    metaId: key,
                  };
                  let ajax = axios
                    .create({
                      headers: {
                        token: token,
                      },
                    })
                    .post(`${datamg}/stobject/query`, params);
                  ajaxlist.push(ajax);
                } else if (it.tt == 'service') {
                  let params = {
                    geoJson: geoJson,
                    loadAttr: true,
                    loadClass: true,
                    l: zoom,
                  };
                  let ajax = axios
                    .create({
                      headers: {
                        token: token,
                      },
                    })
                    .post(`${datamg}/services/${key}/feature`, params);
                  ajaxlist.push(ajax);
                } else if (it.tt == 'third') {
                } else if (it.tt == 'basemap') {
                }
              }
            }
          }
        }

        axios.all(ajaxlist).then((reslist: any[]) => {
          let datalist: any[] = [];
          for (let i = 0; i < reslist.length; i++) {
            let res = reslist[i];
            if (res.data.status === 200) {
              let data = res.data.data;
              let items = data.items;
              datalist = [...datalist, ...items];
            }
          }
          let geom = null;
          if (datalist.length > 0) {
            try {
              geom = JSON.parse(datalist[0].geom);
              getQMap()?.geometryHighlightedLayer.addLayer(geom);
            } catch (err) {
              console.error(err);
            }
          }
          getQMap()?.Evented.fire('clickQueryData', { data: datalist });
        });
      }
    } catch (error) {}
  }
}

export default ClickQueryTool;
