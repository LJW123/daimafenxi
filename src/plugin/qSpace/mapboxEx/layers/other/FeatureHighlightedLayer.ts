import {
  addEventFrame,
  clearEventFrame,
  getEventFrame,
} from '../../../util/requestAnimationFrameFn';

let startTime = 0;
let progress = 0;
let mapboxMap: any = null;
let layerId = '';
let layerType = '';
let color = '#0000CC';

// let color='#8297fc';
function animateLine(timestamp: any) {
  progress = timestamp - startTime;
  let p = parseInt(`${progress / 1000}`);
  if (p >= 2) {
    startTime = timestamp;
  }
  let pp = (progress % 1000) / 1000;
  if (isNaN(pp)) {
    pp = 0;
  }
  let ps = pp * 0.5;

  if (p == 1) {
    ps = (1 - pp) * 0.5;
  }

  let ll = mapboxMap?.getLayer(layerId);
  if (ll) {
    if (layerType === 'fill') {
      mapboxMap.setPaintProperty(layerId, 'fill-opacity', 0.3 + ps);
    } else if (layerType === 'line') {
      mapboxMap.setPaintProperty(layerId, 'line-opacity', 0.3 + ps);
    } else if (layerType === 'point') {
      mapboxMap.setPaintProperty(layerId, 'circle-opacity', 0.3 + ps);
    }
  }
}

class FeatureHighlightedLayer {
  map: any;
  obj: any = null;

  // sourceId: string = 'highlighted_source';
  layerId: string = 'feature_highlighted_layer';

  constructor(map: any) {
    this.map = map;
    mapboxMap = map;
    layerId = this.layerId;
  }

  // 接收的是mapbox自己的图层
  // 走maobox的点击查询返回的feature
  addLayer(feature: any) {
    let geometry = feature.geometry;
    // let source = `highlighted_${feature.source}`;
    let source = feature.source;

    let sourceLayer = feature.sourceLayer;
    let feaId = feature.properties?.id;

    this.removeLayer();
    let layer: any = null;
    if (geometry.type === 'Polygon' || geometry.type === 'MultiPolygon') {
      layer = this.addPolygon(source, sourceLayer, feaId);
      layerType = 'fill';
    } else if (geometry.type === 'LineString') {
      layer = this.addLine(source, sourceLayer, feaId);
      layerType = 'line';
    } else if (geometry.type === 'Point') {
      layer = this.addPoint(source, sourceLayer, feaId);
      layerType = 'point';
    }
    if (layer) {
      this.createLayer(layer);
    }
  }
  createLayer(layer: any) {
    this.map.addLayer(layer);
    addEventFrame({
      name: 'featureHighlightedLayerUpdate',
      time: 50,
      func: (time: number) => {
        animateLine(time);
      },
    });
  }
  removeLayer() {
    let ll = this.map.getLayer(this.layerId);
    if (ll) {
      this.map.removeLayer(this.layerId);
    }
  }

  destroy() {
    clearEventFrame('featureHighlightedLayerUpdate');

    mapboxMap = null;
  }
  addPolygon(source: any, sourceLayer: any, feaId: any) {
    if (sourceLayer) {
      let layer = {
        id: this.layerId,
        type: 'fill',
        source: source,
        'source-layer': sourceLayer,
        layout: {},
        paint: {
          'fill-color': color,
          'fill-opacity': 1,
        },
        filter: ['==', ['get', 'id'], feaId],
      };
      return layer;
    } else {
      let layer = {
        id: this.layerId,
        type: 'fill',
        source: source,
        layout: {},
        paint: {
          'fill-color': color,
          'fill-opacity': 1,
        },
        filter: ['==', ['get', 'id'], feaId],
      };
      return layer;
    }
  }
  addLine(source: any, sourceLayer: any, feaId: any) {
    if (sourceLayer) {
      let layer = {
        id: this.layerId,
        type: 'line',
        source: source,
        'source-layer': sourceLayer,
        layout: {},
        paint: {
          'line-color': color,
          'line-width': 4,
        },
        filter: ['==', ['get', 'id'], feaId],
      };
      return layer;
    } else {
      let layer = {
        id: this.layerId,
        type: 'line',
        source: source,
        layout: {},
        paint: {
          'line-color': color,
          'line-width': 4,
        },
        filter: ['==', ['get', 'id'], feaId],
      };
      return layer;
    }
  }
  addPoint(source: any, sourceLayer: any, feaId: any) {
    if (sourceLayer) {
      let layer = {
        id: this.layerId,
        source: source,
        'source-layer': sourceLayer,
        type: 'circle',
        layout: {},
        paint: {
          'circle-radius': 8,
          'circle-color': color,
        },
        filter: ['==', ['get', 'id'], feaId],
      };
      return layer;
    } else {
      let layer = {
        id: this.layerId,
        source: source,
        type: 'circle',
        layout: {},
        paint: {
          'circle-radius': 8,
          'circle-color': color,
        },
        filter: ['==', ['get', 'id'], feaId],
      };
      return layer;
    }
  }
}

export default FeatureHighlightedLayer;
