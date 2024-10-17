import BaseTool from '../BaseTool';
import { getQMap, MapSource, getDataUrl } from '../../../core';
import * as turf from '@turf/turf';
import { message } from 'antd';

class MapClickTool extends BaseTool {

  sourceName = 'mapClickTool';
  layerName = 'mapClickTool';
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
  }
  disable() {
    this.deleteHighlightedLayer()
    this.unBindEvent();
  }

  addHighlightedLayer(feature: any) {

    const properties = feature.properties
    const layer = feature.layer
    const sourceLayer = feature.sourceLayer
    const type = layer.type
    const filter = []
    for (const key in properties) {
      const element = properties[key];
      filter.push(["==", ["get", key], element])

    }
    const lid = `l_${this.layerName}`;

    let _layer: any = null
    if (type == 'symbol' || type == 'circle') {
      _layer = {
        id: lid,
        source: feature.source,
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
        source: feature.source,
        type: 'line',
        layout: {
          'line-cap': "round",
          'line-join': "round",
        },
        paint: {
          'line-gap-width': 5,
          'line-blur': 4,
          'line-color': '#ff0000',
          'line-width': 4,
        },
        filter: [
          "all",
          ...filter
        ]
      }
    }
if(sourceLayer){
  _layer['source-layer']=sourceLayer
}
    const map = getQMap()?.getMap();
    const ll = map.getLayer(lid);
    if (ll) map.removeLayer(lid);
    map.addLayer(_layer);

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

    const features = this.pickFeature(eve);
    this.deleteHighlightedLayer()
    if (features.length > 0) {
      const feature = features[0]
      const layer = feature.layer
      let _feature = null
      if (layer.type == 'symbol' && !layer.layout['icon-image']) {

      } else if (layer.id == '蒙版') {

      } else {
        _feature = feature

      }

      if (_feature) {
        this.addHighlightedLayer(_feature)
        
        getQMap()?.Evented.fire('mapQueryData', {
          data: {
            feature: _feature,
            eve: eve,
            style: getQMap()?.getMap().getStyle(),
          }
        });
      } else {
        getQMap()?.Evented.fire('mapQueryData', { data: null });
      }

    } else {
      getQMap()?.Evented.fire('mapQueryData', { data: null });
    }
  }


}

export default MapClickTool;
