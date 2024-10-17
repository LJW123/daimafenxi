interface lay {
  id: string;
}

class GeometryLayer {
  map: any;

  layerIds: lay[] = [];

  constructor(map: any) {
    this.map = map;
  }

  addLayer(geometry: any, id: string) {
    let sid = `s_${id}`;
    let fid = `f_${id}`;
    let lid = `l_${id}`;

    this.removeLayer(id);

    if (this.map.getSource(sid)) {
      // this.map.getSource(sid).setData(geometry);
      this.map.getSource(sid).setData({
        type: 'Feature',
        geometry: geometry,
        properties: {
          id: id,
        },
      });
    } else {
      this.map.addSource(sid, {
        type: 'geojson',
        // data: geometry,
        data: {
          type: 'Feature',
          geometry: geometry,
          properties: {
            id: id,
          },
        },
      });
    }
    if (!geometry) return;

    this.layerIds.push({
      id: id,
    });

    this.map.addLayer(this.addPolygon(sid, fid));
    this.map.addLayer(this.addLine(sid, lid));
  }

  removeLayer(id: string) {
    let fid = `f_${id}`;
    let lid = `l_${id}`;

    let fl = this.map.getLayer(fid);
    if (fl) this.map.removeLayer(fid);
    let ll = this.map.getLayer(lid);
    if (ll) this.map.removeLayer(lid);

    this.layerIds = this.layerIds.filter((it: lay) => it.id !== id);
  }
  removeLayerAll() {
    for (let i = 0; i < this.layerIds.length; i++) {
      let l: lay = this.layerIds[i];

      let fid = `f_${l.id}`;
      let lid = `l_${l.id}`;

      let fl = this.map.getLayer(fid);
      if (fl) this.map.removeLayer(fid);
      let ll = this.map.getLayer(lid);
      if (ll) this.map.removeLayer(lid);
    }

    this.layerIds = [];
  }
  addPolygon(sid: string, lid: string) {
    let layer = {
      id: lid,
      source: sid,
      type: 'fill',
      layout: {},
      paint: {
        'fill-color': '#fff',
        'fill-opacity': 0.3,
      },
    };
    return layer;
  }
  addLine(sid: string, lid: string) {
    let layer = {
      id: lid,
      source: sid,
      type: 'line',
      layout: {},
      paint: {
        'line-color': '#ff0000',
        'line-width': 1,
      },
    };
    return layer;
  }
}

export default GeometryLayer;
