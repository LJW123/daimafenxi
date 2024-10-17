import DrawLineString from '../linestring/lineString';
import { EntityModel } from '../../../../core';

class DrawPolygon extends DrawLineString {
  constructor(
    map: any,
    factory: EntityModel,
    style: object = {},
    opts: object = {},
  ) {
    super(map, factory, style, opts);
  }
  // 添加图层
  addLayer() {
    this.createFillLayer();
    this.createLineLayer();
    this.updateNoteLayer();
    if (this.controlPointLayer) this.controlPointLayer.moveLayer();
  }
  updateLayers(type: string, item: any) {
    const allid = this.getAllId();
    const fid = allid.fid;
    const lid = allid.lid;

    const lay = this.map.getLayer(fid);
    const lay_l = this.map.getLayer(lid);
    if (!lay || !lay_l) return;

    const qStyles = this.getQStyles();
    const layoutObj: any = qStyles.getLayoutObj();
    if (type === 'layout') {
      for (let i in item) {
        if (i.indexOf('_') < 0) {
          this.map.setLayoutProperty(fid, i, item[i]);
        } else {
          if (i === '_minzoom') {
            const n = layoutObj['_maxzoom'];
            this.map.setLayerZoomRange(fid, item[i], n);
          } else if (i === '_maxzoom') {
            const n = layoutObj['_minzoom'];
            this.map.setLayerZoomRange(fid, n, item[i]);
          }
        }
        if (i.indexOf('_') < 0) {
          this.map.setLayoutProperty(lid, i, item[i]);
        } else {
          if (i === '_minzoom') {
            const n = layoutObj['_maxzoom'];
            this.map.setLayerZoomRange(lid, item[i], n);
          } else if (i === '_maxzoom') {
            const n = layoutObj['_minzoom'];
            this.map.setLayerZoomRange(lid, n, item[i]);
          }
        }
      }
    } else if (type === 'paint') {
      for (let i in item) {
        if (i.indexOf('_') < 0) {
          if (i.indexOf('line') > -1) {
            this.map.setPaintProperty(lid, i, item[i]);
          } else {
            this.map.setPaintProperty(fid, i, item[i]);
          }
        }
      }
    }
  }

  createFillLayer() {
    const allid = this.getAllId();
    const sid = allid.sid;
    const fid = allid.fid;

    const qStyles = this.getQStyles();
    const layoutObj: any = qStyles.getLayoutObj();
    const paintObj: any = qStyles.getPaintObj();

    let layer = {
      id: fid,
      type: 'fill',
      source: sid,
      minzoom: layoutObj['_minzoom'],
      maxzoom: layoutObj['_maxzoom'],
      layout: {
        visibility: this.show ? 'visible' : 'none',
      },
      paint: {
        'fill-color': paintObj['fill-color'],
        'fill-opacity': paintObj['fill-opacity'],
      },
    };
    if (!this.map) return;
    const lay = this.map.getLayer(fid);
    if (lay) this.map.removeLayer(fid);
    this.map.addLayer(layer);
  }
  createLineLayer() {
    const allid = this.getAllId();
    const sid = allid.sid;
    const lid = allid.lid;

    const qStyles = this.getQStyles();
    const layoutObj: any = qStyles.getLayoutObj();
    const paintObj: any = qStyles.getPaintObj();
    let layer = {
      id: lid,
      type: 'line',
      source: sid,
      minzoom: layoutObj['_minzoom'],
      maxzoom: layoutObj['_maxzoom'],
      layout: {
        visibility: this.show ? 'visible' : 'none',
      },
      paint: {
        'line-opacity': paintObj['line-opacity'],
        'line-color': paintObj['line-color'],
        'line-width': paintObj['line-width'],
      },
    };
    if (!this.map) return;
    const lay = this.map.getLayer(lid);
    if (lay) this.map.removeLayer(lid);
    this.map.addLayer(layer);
  }
}

export default DrawPolygon;
