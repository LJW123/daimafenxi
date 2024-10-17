import BaseTool from '../BaseTool';
import { getQMap, MapSource, getDataUrl, QMapGl } from '../../../core';
import * as turf from '@turf/turf';
import { message } from 'antd';
import AttributeConfig from '@/configs/attributeConfig/attributeConfig';
import { datamg, riverRelationMetaId, rv_service } from '@/common';
import axios from 'axios';
import { log } from 'console';
function isObjectEqual(obj1: any, obj2: any) {
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (let key of keys1) {
    if (!obj2.hasOwnProperty(key) || obj1[key] !== obj2[key]) {
      return false;
    }
  }

  return true;
}


class MapMoveTool extends BaseTool {

  sourceName = 'mapMoveTool';
  layerName = 'mapMoveTool';

  feature: any = null
  popup: any = null

  layerShow: any = null

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

    const map = getQMap()?.getMap();
    if (map) {
      map.getCanvas().style.cursor = 'default';
    }

    this.popup = new QMapGl.Popup({
      closeButton: false,
      closeOnClick: false
    });
  }
  disable() {
    this.deleteHighlightedLayer()
    this.unBindEvent();
  }

  addHighlightedLayer(feature: any) {

    const properties = feature.properties
    const layer = feature.layer
    const source = feature.source
    const sourceLayer = feature.sourceLayer
    const type = layer.type

    const filter = []
    for (const key in properties) {
      const element = properties[key];
      filter.push(["==", ["get", key], element])

    }
    const lid = `l_${this.layerName}`;

    if (layer.id == lid) {
      return
    }

    if (this.feature) {
      if (isObjectEqual(properties, this.feature.properties)) {
        return
      }

      // if (source == this.feature.source && sourceLayer == this.feature.sourceLayer) {
      //   return
      // }
    }
    this.deleteHighlightedLayer()

    let _layer: any = null
    if (type == 'symbol' || type == 'circle') {
      _layer = {
        id: lid,
        source: source,
        type: 'symbol',
        layout: {
          'icon-allow-overlap': true,
          'icon-ignore-placement': true,
          'icon-image': 'sel_point',
          'icon-size': 0.5,
        },
        paint: {
          'icon-color': '#2e2',
        },
        filter: [
          "all",
          ...filter
        ]
      }
    } else {
      _layer = {
        id: lid,
        source: source,
        type: 'line',
        layout: {
          'line-cap': "round",
          'line-join': "round",
        },
        paint: {
          'line-gap-width': 5,
          'line-blur': 4,
          // 'line-color': '#ff0000',
          'line-color': '#f8f58b',
          'line-width': 4,
        },
        filter: [
          "all",
          ...filter
        ]
      }
    }
    if (sourceLayer) {
      _layer['source-layer'] = sourceLayer
    }
    // this.layerShow = layer
    const map = getQMap()?.getMap();
    if (map) {
      const ll = map.getLayer(lid);
      if (ll) map.removeLayer(lid);
      map.addLayer(_layer);
    }
    this.feature = feature


  }

  deleteHighlightedLayer() {
    const lid = `l_${this.layerName}`;
    const map = getQMap()?.getMap();
    const ll = map.getLayer(lid);
    if (ll) map.removeLayer(lid);

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

  leftClickEvent(eve: any) {

    if (this.feature) {
      this.showFeatureChild(this.feature)
      getQMap()?.Evented.fire('mapQueryData', {
        data: {
          feature: this.feature,
          eve: eve,
          style: getQMap()?.getMap().getStyle(),
        }
      });
    } else {
      getQMap()?.Evented.fire('mapQueryData', { data: null });
      this.deleteHighlightedLayer_child()
    }

  }
  mouseMoveEvent(eve: any) {

    const features = this.pickFeature(eve);
    const lid = `l_${this.layerName}`;
    const ffs = features.filter((f: any) => f.layer.id != lid)
    let ffsArr = []
    for (const key in ffs) {
      const fea = ffs[key];
      const layer = fea.layer
      const source = layer.source
      let attr = AttributeConfig.getInstance().getAttributeById(source)
      if (attr) ffsArr.push(fea)
    }



    if (ffsArr.length > 0) {
      const feature = ffsArr[0]
      const layer = feature.layer
      let _feature = null
      if (layer.type == 'symbol' && !layer.layout['icon-image']) {

      } else if (layer.id == '蒙版') {

      } else {
        _feature = feature

      }

      if (_feature) {
        this.addHighlightedLayer(_feature)

        // const coordinates = [eve.lngLat.lng, eve.lngLat.lat]
        // const properties = _feature.properties
        // const html = `<div>${properties.NAME}</div>`
        // const map = getQMap()?.getMap();
        // if (properties.NAME) {
        // this.popup?.setLngLat(coordinates).setHTML(html).addTo(map);
        // }

      } else {
        this.deleteHighlightedLayer()
        this.feature = null
        // this.popup?.remove();

      }

    } else {
      this.deleteHighlightedLayer()
      this.feature = null
      // this.popup?.remove();

    }




  }

  showFeatureChild(feature: any) {

    const properties = feature.properties
    const lv = properties.RV_GRAD ? parseInt(properties.RV_GRAD) : 0
    const name = properties.NAME ? properties.NAME : ''

    this.queryData(lv, name)

  }

  queryData = (num: number = 0, rName: string = '') => {
    let params = {
      "metaId": riverRelationMetaId,
      "whereCondition": {
        "conditionType": "leaf",
        "fieldName": `data.N${num}`,
        "opType": "eq",
        "value": rName,
        "fieldType": 9
      },
      "sType": "query",
      "rType": "json",
      "pageSize": 9999,
      "pageNum": 1,
    }
    let _url = `${datamg}/insights/query/data`;
    axios.create().post(_url, params).then((res: any) => {
      if (res.status == 200) {
        const _data = res.data
        if (_data.length > 0) {
          let obj: any = {}
          for (let index = 0; index < _data.length; index++) {
            const data = _data[index];
            function createNestedObject(_n: number, _obj: any = {}) {
              const key = `N${_n}`
              const _nn = data[key]
              if (_nn) {
                if (!_obj[_nn]) {
                  _obj[_nn] = {};
                }
                if (_n < 7) {
                  const n = _n + 1
                  createNestedObject(n, _obj[_nn]);
                }
              }
            }
            createNestedObject(num, obj)
          }
          const rvNameObj: any = {}
          rvNameObj[rName] = rName
          function dRvName(_obj: any, _data: any) {
            if (Object.keys(_obj).length > 0) {
              for (const key in _obj) {
                const item = _obj[key];
                if (!_data[key]) {
                  _data[key] = key
                }
                dRvName(item, _data)
              }
            }
          }
          dRvName(obj, rvNameObj)
          this.addHighlightedLayer_child(rvNameObj)
        }
      }
    })

  }

  addHighlightedLayer_child(rvNameObj: any) {
    const feature = this.feature
    if (feature) {
      const layer = feature.layer
      const type = layer.type

      if (rv_service) {
        const source = rv_service.source
        const sourceLayer = rv_service.sourceLayer

        const filter = []
        for (const key in rvNameObj) {
          const element = rvNameObj[key];
          filter.push(["==", ["get", 'NAME'], element])

        }
        const lid = `l_c_${this.layerName}`;

        if (layer.id == lid) {
          return
        }

        this.deleteHighlightedLayer_child()

        let _layer: any = null
        if (type == 'line') {
          _layer = {
            id: lid,
            source: source,
            type: 'line',
            layout: {
              'line-cap': "round",
              'line-join': "round",
            },
            paint: {
              'line-gap-width': 5,
              'line-blur': 4,
              // 'line-color': '#ff0000',
              'line-color': '#f8f58b',
              'line-width': 4,
            },
            filter: [
              "any",
              ...filter
            ]
          }
        }
        if (sourceLayer) {
          _layer['source-layer'] = sourceLayer
        }

        const map = getQMap()?.getMap();
        if (map) {
          const ll = map.getLayer(lid);
          if (ll) map.removeLayer(lid);
          map.addLayer(_layer);
        }
      }

    }



  }

  deleteHighlightedLayer_child() {
    const lid = `l_c_${this.layerName}`;
    const map = getQMap()?.getMap();
    const ll = map.getLayer(lid);
    if (ll) map.removeLayer(lid);

  }


}

export default MapMoveTool;
