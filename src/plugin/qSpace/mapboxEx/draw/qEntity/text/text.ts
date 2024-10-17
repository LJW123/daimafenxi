import DrawCore from '../../core/DrawCore';
import { EntityModel } from '../../../../core';

class DrawText extends DrawCore {
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
    let layer: any = {
      id: pid,
      type: 'symbol',
      source: sid,
      minzoom: layoutObj['_minzoom'],
      maxzoom: layoutObj['_maxzoom'],
      layout: {
        'text-field': layoutObj['text-field'],
        'text-size': layoutObj['text-size'],
        'text-anchor': layoutObj['text-anchor'],
        'text-ignore-placement': layoutObj['text-ignore-placement'],
        'text-justify': layoutObj['text-justify'],
        'text-letter-spacing': layoutObj['text-letter-spacing'],
        'text-line-height': layoutObj['text-line-height'],
        'text-allow-overlap': layoutObj['text-allow-overlap'],
        'text-pitch-alignment': layoutObj['text-pitch-alignment'],
        'text-max-width': layoutObj['text-max-width'],
        'text-rotate': layoutObj['text-rotate'],
        visibility: this.show ? 'visible' : 'none',
      },
      paint: {
        'text-color': paintObj['text-color'],
        'text-halo-blur': paintObj['text-halo-blur'],
        'text-halo-color': paintObj['text-halo-color'],
        'text-halo-width': paintObj['text-halo-width'],
        'text-opacity': paintObj['text-opacity'],
      },
    };
    if (layoutObj.hasOwnProperty('text-font')) {
      layer.layout['text-font'] = [layoutObj['text-font']];
    }
    if (!this.map) return;
    const lay = this.map.getLayer(pid);
    if (lay) this.map.removeLayer(pid);
    this.map.addLayer(layer);
  }

  isComplete() {
    return true;
  }
}
export default DrawText;
