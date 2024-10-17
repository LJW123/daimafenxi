import {
  addEventFrame,
  clearEventFrame,
  getEventFrame,
} from '../../../util/requestAnimationFrameFn';

let mapboxMap: any = null;

let sId: string = 'geometry_highlighted_source_line';
let lId: string = 'geometry_highlighted_layer_line';
let l_dashed_Id: string = 'geometry_highlighted_layer_line_dashed';

let color = '#0000CC';

const dashArraySequence = [
  [0, 1, 6],
  [0.5, 1, 5.5],
  [1, 1, 5],
  [1.5, 1, 4.5],
  [2, 1, 4],
  [2.5, 1, 3.5],
  [3, 1, 3],
  [3.5, 1, 2.5],
  [4, 1, 2],
  [4.5, 1, 1.5],
  [5, 1, 1],
  [5.5, 1, 0.5],
  [6, 1, 0],
];

let step = 0;
const animateLine = (timestamp: number) => {
  const newStep = Math.floor((timestamp / 50) % dashArraySequence.length);
  if (newStep !== step) {
    let ll = mapboxMap?.getLayer(l_dashed_Id);
    if (ll) {
      mapboxMap.setPaintProperty(
        l_dashed_Id,
        'line-dasharray',
        dashArraySequence[step],
      );
    }
    step = newStep;
  }
};

class GeometryHighlightedLayer {
  map: any;

  constructor(map: any) {
    this.map = map;
    mapboxMap = map;
  }

  addLayer(geometry: any) {
    this.removeLayer();

    if (this.map.getSource(sId)) {
      this.map.getSource(sId).setData(geometry);
    } else {
      this.map.addSource(sId, {
        type: 'geojson',
        data: geometry,
      });
    }
    if (!geometry) return;
    let layer: any = null;
    let layer_dashed: any = null;
    if (geometry.type === 'LineString' || geometry.type === 'MultiLineString') {
      layer = this.addLine();
      layer_dashed = this.addLine_dashed();
    }

    if (layer) {
      this.map.addLayer(layer);
    }

    if (layer_dashed) {
      this.map.addLayer(layer_dashed);
    }

    clearEventFrame('geometryHighlightedLayerLineUpdate');

    addEventFrame({
      name: 'geometryHighlightedLayerLineUpdate',
      time: 50,
      func: (time: number) => {
        animateLine(time);
      },
    });
  }

  removeLayer() {
    clearEventFrame('geometryHighlightedLayerLineUpdate');

    let ll = this.map.getLayer(lId);
    if (ll) {
      this.map.removeLayer(lId);
    }

    let ll2 = this.map.getLayer(l_dashed_Id);
    if (ll2) {
      this.map.removeLayer(l_dashed_Id);
    }
  }
  removeLayerAll() {
    this.removeLayer();
  }
  destroy() {
    clearEventFrame('geometryHighlightedLayerLineUpdate');

    mapboxMap = null;
  }

  addLine() {
    let layer = {
      id: lId,
      source: sId,
      type: 'line',
      layout: {},
      paint: {
        'line-color': '#fff',
        'line-width': 5,
        'line-opacity': 0.8,
      },
    };
    return layer;
  }

  addLine_dashed() {
    let layer = {
      id: l_dashed_Id,
      source: sId,
      type: 'line',
      layout: {},
      paint: {
        'line-color': '#4169E1',
        'line-width': 3.5,
        // 'line-dasharray': [10,1],
        'line-dasharray': dashArraySequence[0],
      },
    };
    return layer;
  }
}

export default GeometryHighlightedLayer;
