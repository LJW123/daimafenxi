import DrawPolygon from '../polygon/polygon';
import { EntityModel } from '../../../../core';

// 立方体
class DrawCube extends DrawPolygon {
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
    this.createFillExtrusionLayer();
    this.updateNoteLayer();
    if (this.controlPointLayer) this.controlPointLayer.moveLayer();
  }
  updateLayers(type: string, item: any) {
    const allid = this.getAllId();
    const fid = allid.fid;

    const lay = this.map.getLayer(fid);
    if (!lay) return;
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
      }
    } else if (type === 'paint') {
      for (let i in item) {
        if (i.indexOf('_') < 0) {
          this.map.setPaintProperty(fid, i, item[i]);
        }
      }
    }
  }
  createFillExtrusionLayer() {
    const allid = this.getAllId();
    const sid = allid.sid;
    const fid = allid.fid;

    const qStyles = this.getQStyles();
    const layoutObj: any = qStyles.getLayoutObj();
    const paintObj: any = qStyles.getPaintObj();

    let layer = {
      id: fid,
      type: 'fill-extrusion',
      source: sid,
      minzoom: layoutObj['_minzoom'],
      maxzoom: layoutObj['_maxzoom'],
      layout: {
        visibility: this.show ? 'visible' : 'none',
      },
      paint: {
        'fill-extrusion-opacity': paintObj['fill-extrusion-opacity'],
        'fill-extrusion-color': paintObj['fill-extrusion-color'],
        'fill-extrusion-height': paintObj['fill-extrusion-height'],
        'fill-extrusion-base': paintObj['fill-extrusion-base'],
        'fill-extrusion-ambient-occlusion-intensity':
          paintObj['fill-extrusion-ambient-occlusion-intensity'],
        'fill-extrusion-ambient-occlusion-radius':
          paintObj['fill-extrusion-ambient-occlusion-radius'],
      },
    };
    if (!this.map) return;
    const lay = this.map.getLayer(fid);
    if (lay) this.map.removeLayer(fid);
    this.map.addLayer(layer);
  }
}

export default DrawCube;
