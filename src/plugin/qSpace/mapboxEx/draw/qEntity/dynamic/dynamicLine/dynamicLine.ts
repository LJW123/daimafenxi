import DrawCore from '../../../core/DrawCore';
import { EntityModel } from '../../../../../core';

// 动态线 颜色交替
class DrawDynamicLineString extends DrawCore {
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
    this.createLineLayer();
    this.updateNoteLayer();
    if (this.controlPointLayer) this.controlPointLayer.moveLayer();
  }

  updateLayers(type: string, item: any) {
    const allid = this.getAllId();
    const lid = allid.lid;
    const lay = this.map.getLayer(lid);
    if (!lay) return;

    const qStyles = this.getQStyles();
    const layoutObj: any = qStyles.getLayoutObj();
    if (type === 'layout') {
      for (let i in item) {
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
          // this.createImage(() => {});
        }
      }
    } else if (type === 'paint') {
      for (let i in item) {
        if (i.indexOf('_') < 0) {
          if (i === 'line-dasharray') {
            this.createLineLayer();
          } else {
            this.map.setPaintProperty(lid, i, item[i]);
          }
        } else {
          // this.createImage(() => {});
        }
      }
    }
    this.animate();
  }

  createLineLayer() {
    const allid = this.getAllId();
    const sid = allid.sid;
    const lid = allid.lid;

    const qStyles = this.getQStyles();
    const layoutObj: any = qStyles.getLayoutObj();
    const paintObj: any = qStyles.getPaintObj();
    let lineC = paintObj['_line-color'];
    let lineO = paintObj['_line-opacity'];
    let layer: any = {
      id: lid,
      type: 'line',
      source: sid,
      minzoom: layoutObj['_minzoom'],
      maxzoom: layoutObj['_maxzoom'],
      layout: {
        'line-cap': layoutObj['line-cap'],
        'line-join': layoutObj['line-join'],
        // 'line-miter-limit': layoutObj['line-miter-limit'],
        // 'line-round-limit': layoutObj['line-round-limit'],
        visibility: this.show ? 'visible' : 'none',
      },
      paint: {
        'line-opacity': lineO,
        'line-color': lineC,
        'line-width': paintObj['line-width'],
        'line-gap-width': paintObj['line-gap-width'],
        'line-blur': paintObj['line-blur'],
      },
    };

    if (layoutObj.hasOwnProperty('line-miter-limit')) {
      layer.layout['line-miter-limit'] = layoutObj['line-miter-limit'];
    }
    if (layoutObj.hasOwnProperty('line-round-limit')) {
      layer.layout['line-round-limit'] = layoutObj['line-round-limit'];
    }
    if (paintObj['line-dasharray'] > 0) {
      layer.paint['line-dasharray'] = [
        paintObj['line-dasharray'],
        paintObj['line-dasharray'],
      ];
    }
    if (!this.map) return;
    const lay = this.map.getLayer(lid);
    if (lay) this.map.removeLayer(lid);
    this.map.addLayer(layer);
    this.animate();
  }

  animate() {
    const _map = this.map;
    let n = 0;

    const allid = this.getAllId();
    const lid = allid.lid;

    const qStyles = this.getQStyles();
    const paintObj: any = qStyles.getPaintObj();

    let lineC = paintObj['_line-color'];
    let lineO = paintObj['_line-opacity'];
    let line2C = paintObj['_line-outline-color'];
    let line2O = paintObj['_line-outline-opacity'];

    function animateDashArray(timestamp: number) {
      const lay = _map.getLayer(lid);
      if (lay) {
        let num = `${(timestamp / 1000) % 2}`;
        let _n = parseInt(num);
        if (_n == 0 && n != _n) {
          _map.setPaintProperty(lid, 'line-color', lineC);
          n = _n;
        }
        if (_n == 1 && n != _n) {
          _map.setPaintProperty(lid, 'line-color', line2C);
          n = _n;
        }

        requestAnimationFrame(animateDashArray);
      }
    }

    animateDashArray(0);
  }
}

export default DrawDynamicLineString;
