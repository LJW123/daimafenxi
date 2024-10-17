let color = '#ff0000';
// let color='#8297fc';

class FeatureLayer {
  map: any;
  feature: any;

  sourceId: string;
  layerId: string;
  geometry: any;

  constructor(map: any, feature: any) {
    this.map = map;
    this.feature = feature;
    this.layerId = feature.id;
    this.sourceId = feature.id;

    this.geometry = JSON.parse(feature.geom);

    // layerId = this.layerId;
  }

  addLayer() {
    let geometry = this.geometry;
    geometry.properties = this.feature.attributes;

    if (this.map.getSource(this.sourceId)) {
      this.map.getSource(this.sourceId).setData(geometry);
    } else {
      this.map.addSource(this.sourceId, {
        type: 'geojson',
        data: geometry,
      });
    }
    let layer: any = null;
    if (geometry.type === 'Polygon' || geometry.type === 'MultiPolygon') {
      layer = this.addPolygon();
    } else if (geometry.type === 'LineString') {
      layer = this.addLine();
    } else if (geometry.type === 'Point') {
      layer = this.addPoint();
    }
    if (layer) {
      let ll = this.map.getLayer(layer.id);
      if (ll) {
        this.map.removeLayer(layer.id);
      }
      this.map.addLayer(layer);
    }
  }

  removeLayer() {
    let ll = this.map.getLayer(this.layerId);
    if (ll) {
      this.map.removeLayer(this.layerId);
    }
  }

  addPolygon() {
    let layer = {
      id: this.layerId,
      type: 'fill',
      source: this.sourceId,
      layout: {},
      paint: {
        'fill-color': color,
        'fill-opacity': 0.6,
      },
    };
    return layer;
  }
  addLine() {
    let layer = {
      id: this.layerId,
      type: 'line',
      source: this.sourceId,
      layout: {},
      paint: {
        'line-color': color,
        'line-width': 4,
      },
    };
    return layer;
  }
  addPoint() {
    let layer = {
      id: this.layerId,
      source: this.sourceId,
      type: 'circle',
      layout: {},
      paint: {
        'circle-radius': 8,
        'circle-color': color,
      },
    };
    return layer;
  }
}

export default FeatureLayer;
