import DrawCore from '../../core/DrawCore';
import { EntityModel } from '../../../../core';

class DrawPoint extends DrawCore {
  constructor(
    map: any,
    factory: EntityModel,
    style: object = {},
    opts: object = {},
  ) {
    super(map, factory, style, opts);
    this.controlPointHasMid = false;
  }

  // 添加图层
  addLayer() {
    this.createPointLayer();
    this.updateNoteLayer();
    if (this.controlPointLayer) this.controlPointLayer.moveLayer();
  }
  updateLayers(type: string, item: any) {
    const allid = this.getAllId();
    const pid = allid.pid;

    const lay = this.map.getLayer(pid);
    if (!lay) return;

    const qStyles = this.getQStyles();
    const layoutObj: any = qStyles.getLayoutObj();

    if (type === 'layout') {
      for (let i in item) {
        if (i.indexOf('_') < 0) {
          this.map.setLayoutProperty(pid, i, item[i]);
        } else {
          if (i === '_minzoom') {
            const n = layoutObj['_maxzoom'];
            this.map.setLayerZoomRange(pid, item[i], n);
          } else if (i === '_maxzoom') {
            const n = layoutObj['_minzoom'];
            this.map.setLayerZoomRange(pid, n, item[i]);
          }
        }
      }
    } else if (type === 'paint') {
      for (let i in item) {
        if (i.indexOf('_') < 0) this.map.setPaintProperty(pid, i, item[i]);
      }
    }
  }
  createPointLayer() {
    const allid = this.getAllId();
    const sid = allid.sid;
    const pid = allid.pid;

    const qStyles = this.getQStyles();
    const layoutObj: any = qStyles.getLayoutObj();
    const paintObj: any = qStyles.getPaintObj();

    const layer = {
      id: pid,
      type: 'circle',
      source: sid,
      minzoom: layoutObj['_minzoom'],
      maxzoom: layoutObj['_maxzoom'],
      layout: {
        visibility: this.show ? 'visible' : 'none',
      },
      paint: {
        'circle-color': paintObj['circle-color'],
        'circle-opacity': paintObj['circle-opacity'],
        'circle-pitch-alignment': paintObj['circle-pitch-alignment'],
        'circle-radius': paintObj['circle-radius'],
        'circle-stroke-color': paintObj['circle-stroke-color'],
        'circle-stroke-opacity': paintObj['circle-stroke-opacity'],
        'circle-stroke-width': paintObj['circle-stroke-width'],
        'circle-blur': paintObj['circle-blur'],
      },
    };
    if (!this.map) return;
    const lay = this.map.getLayer(pid);
    if (lay) this.map.removeLayer(pid);
    this.map.addLayer(layer);
  }

  isComplete() {
    return true;
  }
}
export default DrawPoint;
