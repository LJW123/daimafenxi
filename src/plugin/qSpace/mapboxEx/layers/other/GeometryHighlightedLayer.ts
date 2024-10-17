import {
  addEventFrame,
  clearEventFrame,
  getEventFrame,
} from '../../../util/requestAnimationFrameFn';

interface lay {
  id: string;
  type: string;
}

let startTime = 0;
let progress = 0;
let mapboxMap: any = null;
let layerIds: lay[] = [];
// let color = '#0000CC';
// let color = '#f8f58b';
let color = '#ffd212';

const animateLine = (timestamp: any) => {
  if (layerIds.length < 1) return;
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

  for (let i = 0; i < layerIds.length; i++) {
    let la = layerIds[i];

    let ll = mapboxMap?.getLayer(la.id);
    if (ll) {
      if (la.type === 'fill') {
        mapboxMap.setPaintProperty(la.id, 'fill-opacity', 0.3 + ps);
      } else if (la.type === 'line') {
        mapboxMap.setPaintProperty(la.id, 'line-opacity', 0.3 + ps);
      } else if (la.type === 'point') {
        mapboxMap.setPaintProperty(la.id, 'circle-opacity', 0.3 + ps);
      }
    }
  }
};

class GeometryHighlightedLayer {
  map: any;
  obj: any = null;

  sId: string = 'geometry_highlighted_source';
  lId: string = 'geometry_highlighted_layer';

  layersList: [] = [];

  constructor(map: any) {
    this.map = map;
    mapboxMap = map;
  }

  addLayer(geometry: any, id?: string, obj: any = {}) {
    let lid = this.lId;
    let sid = this.sId;

    if (id) {
      this.removeLayer(id);

      lid = `ll_${id}`;
      sid = `ss_${id}`;
    } else {
      this.removeLayerAll();
    }

    if (this.map.getSource(sid)) {
      // this.map.getSource(sid).setData(geometry);
      this.map.getSource(sid).setData({
        type: 'Feature',
        geometry: geometry,
        properties: obj,
      });
    } else {
      this.map.addSource(sid, {
        type: 'geojson',
        // data: geometry,
        data: {
          type: 'Feature',
          geometry: geometry,
          properties: obj,
        },
      });
    }
    if (!geometry) return;
    let layer: any = [];
    if (geometry.type === 'Polygon' || geometry.type === 'MultiPolygon') {

      layer = this.addLine(sid, lid);
      layerIds.push({
        id: lid,
        type: 'line',
      });

      // layer = this.addPolygon(sid, lid);
      // layerIds.push({
      //   id: lid,
      //   type: 'fill',
      // });
    } else if (
      geometry.type === 'LineString' ||
      geometry.type === 'MultiLineString'
    ) {
      layer = this.addLine(sid, lid);
      layerIds.push({
        id: lid,
        type: 'line',
      });
    } else if (geometry.type === 'Point') {
      layer = this.addPoint(sid, lid);
      layerIds.push({
        id: lid,
        type: 'point',
      });
      layerIds.push({
        id: `sel_${lid}`,
        type: 'sel_point',
      });
    }

    if (layer) {
      for (const key in layer) {
        this.map.addLayer(layer[key]);
      }
      clearEventFrame('geometryHighlightedLayerUpdate');

      // addEventFrame({
      //   name: 'geometryHighlightedLayerUpdate',
      //   time: 50,
      //   func: (time: number) => {
      //     animateLine(time);
      //   },
      // });
    }
  }

  removeLayer(id?: string) {
    clearEventFrame('geometryHighlightedLayerUpdate');

    let lid = this.lId;
    if (id) {
      lid = `ll_${id}`;
    }

    layerIds = layerIds.filter((it: lay) => it.id !== lid);
    let ll = this.map.getLayer(lid);
    if (ll) {
      this.map.removeLayer(lid);
    }
  }
  removeLayerAll() {
    clearEventFrame('geometryHighlightedLayerUpdate');

    for (let i = 0; i < layerIds.length; i++) {
      let l: lay = layerIds[i];

      let ll = this.map.getLayer(l.id);
      if (ll) {
        this.map.removeLayer(l.id);
      }
    }

    layerIds = [];
  }

  destroy() {
    clearEventFrame('geometryHighlightedLayerUpdate');

    mapboxMap = null;
  }

  addPolygon(sid: string, lid: string) {
    let layer = {
      id: lid,
      source: sid,
      type: 'fill',
      layout: {},
      paint: {
        'fill-color': color,
        'fill-opacity': 1,
      },
    };
    return [layer];
  }
  addLine(sid: string, lid: string) {
    let layer = {
      id: lid,
      source: sid,
      type: 'line',
      "layout": {
        "line-cap": "round",
        "line-join": "round",
        "visibility": "visible"
      },
      paint: {
        'line-color': color,
        "line-width": {
          "stops": [
            [
              4,
              4
            ],
            [
              6,
              6
            ],
            [
              10,
              8
            ]
          ]
        },
        "line-blur": 1.5
      },
    };


    return [layer];
  }
  addPoint(sid: string, lid: string) {
    let name = 'sel_point';
    let layer: any = {
      id: `sel_${lid}`,
      source: sid,
      type: 'symbol',
      layout: {
        'icon-allow-overlap': true,
        'icon-ignore-placement': true,
        'icon-image': name,
        'icon-size': 0.5,
      },
      paint: {
        'icon-color': '#2e2',
      },
    };
    let layer1: any = {
      id: lid,
      source: sid,
      type: 'circle',
      paint: {
        'circle-radius': 8,
        'circle-color': color,
      },
    };
    return [layer, layer1];
  }
}

export default GeometryHighlightedLayer;
