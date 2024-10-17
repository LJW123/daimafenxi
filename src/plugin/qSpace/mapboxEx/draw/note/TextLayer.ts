import * as turf from '@turf/turf';
import QStyles from '../core/QStyles';

/**
 * 注记层
 */
class TextLayer {
  map: any;
  layerType: string = '注记';

  constructor(map: any) {
    this.map = map;
  }
  addLayer(qStyles: QStyles, tid: string, stid: string) {
    let lay = this.map.getLayer(tid);
    if (lay) this.map.removeLayer(tid);
    let layer = this.createLayer(qStyles, tid, stid);
    this.map.addLayer(layer);
  }
  updateData(geojson: any = null, stid: string) {
    if (!this.map) return;
    if (this.map.getSource(stid)) {
      this.map.getSource(stid).setData(geojson);
    } else {
      this.map.addSource(stid, {
        type: 'geojson',
        data: geojson,
      });
    }
  }
  updateStyle(
    qStyles: QStyles,
    type: string,
    item: any,
    tid: string,
    stid: string,
  ) {
    const layoutObj: any = qStyles.getLayoutObj();
    const layout_textObj: any = qStyles.getLayoutTextObj();
    const show = layout_textObj['visibility'] === 'visible';
    const text_type = layout_textObj['_text-type'];

    let lay = this.map.getLayer(tid);
    if (lay) {
      if (text_type === this.layerType && show) {
        this.map.setLayoutProperty(tid, 'visibility', 'visible');
      } else {
        this.map.setLayoutProperty(tid, 'visibility', 'none');
      }
      if (type === 'layout_text') {
        for (let i in item) {
          if (i.indexOf('_') < 0) {
            if (i === 'text-offset-right') {
              const n = layout_textObj['text-offset-bottom'] || 0;
              this.map.setLayoutProperty(tid, 'text-offset', [item[i], n]);
            } else if (i === 'text-offset-bottom') {
              const n = layout_textObj['text-offset-right'] || 0;
              this.map.setLayoutProperty(tid, 'text-offset', [n, item[i]]);
            } else if (i === 'text-font') {
              this.map.setLayoutProperty(tid, i, [item[i]]);
            } else {
              this.map.setLayoutProperty(tid, i, item[i]);
            }
          }
        }
      } else if (type === 'paint_text') {
        for (let i in item) {
          if (i.indexOf('_') < 0) {
            this.map.setPaintProperty(tid, i, item[i]);
          }
        }
      } else if (type === 'layout') {
        for (let i in item) {
          if (i.indexOf('_') < 0) {
            // this.map.setLayoutProperty(tid, i, item[i]);
          } else {
            if (i === '_minzoom') {
              const n = layoutObj['_maxzoom'];
              this.map.setLayerZoomRange(tid, item[i], n);
            } else if (i === '_maxzoom') {
              const n = layoutObj['_minzoom'];
              this.map.setLayerZoomRange(tid, n, item[i]);
            }
          }
        }
      }
    } else {
      if (text_type === this.layerType && show) {
        this.addLayer(qStyles, tid, stid);
      }
    }
  }

  createLayer(qStyles: QStyles, tid: string, stid: string) {
    const layoutObj: any = qStyles.getLayoutObj();
    const layout_textObj: any = qStyles.getLayoutTextObj();
    const paint_textObj: any = qStyles.getPaintTextObj();
    const text_type = layout_textObj['_text-type'];
    let visibility: string = layout_textObj['visibility'];

    if (text_type !== this.layerType) {
      visibility = 'none';
    }
    const layer: any = {
      id: tid,
      type: 'symbol',
      source: stid,
      // minzoom: layoutObj['_minzoom'],
      // maxzoom: layoutObj['_maxzoom'],
      layout: {
        'text-field': layout_textObj['text-field'],
        'text-size': layout_textObj['text-size'],
        // 'text-anchor': layout_textObj['text-anchor'],
        // 'text-ignore-placement': layout_textObj['text-ignore-placement'],
        // 'text-justify': layout_textObj['text-justify'],
        // 'text-letter-spacing': layout_textObj['text-letter-spacing'],
        // 'text-line-height': layout_textObj['text-line-height'],
        // 'text-allow-overlap': layout_textObj['text-allow-overlap'],
        // 'text-pitch-alignment': layout_textObj['text-pitch-alignment'],
        // 'text-rotate': layout_textObj['text-rotate'],
        // 'symbol-placement': layout_textObj['symbol-placement'],
        'text-offset': [
          layout_textObj['text-offset-right'] || 0,
          layout_textObj['text-offset-bottom'] || 0,
        ],
        visibility: visibility,
      },
      paint: {
        'text-color': paint_textObj['text-color'],
        // 'text-halo-blur': paint_textObj['text-halo-blur'],
        // 'text-halo-color': paint_textObj['text-halo-color'],
        // 'text-halo-width': paint_textObj['text-halo-width'],
        // 'text-opacity': paint_textObj['text-opacity'],
      },
    };
    if (layoutObj.hasOwnProperty('_minzoom')) {
      if (layoutObj['_minzoom'] > -1) layer.minzoom = layoutObj['_minzoom'];
    }
    if (layoutObj.hasOwnProperty('_maxzoom')) {
      if (layoutObj['_maxzoom'] > -1) layer.maxzoom = layoutObj['_maxzoom'];
    }

    if (layout_textObj.hasOwnProperty('text-font')) {
      layer.layout['text-font'] = [layout_textObj['text-font']];
    }
    if (layout_textObj.hasOwnProperty('text-allow-overlap')) {
      layer.layout['text-allow-overlap'] = layout_textObj['text-allow-overlap'];
    }
    if (layout_textObj.hasOwnProperty('text-ignore-placement')) {
      layer.layout['text-ignore-placement'] =
        layout_textObj['text-ignore-placement'];
    }
    if (layout_textObj.hasOwnProperty('symbol-placement')) {
      layer.layout['symbol-placement'] = layout_textObj['symbol-placement'];
    }
    if (layout_textObj.hasOwnProperty('text-justify')) {
      layer.layout['text-justify'] = layout_textObj['text-justify'];
    }
    if (layout_textObj.hasOwnProperty('text-anchor')) {
      layer.layout['text-anchor'] = layout_textObj['text-anchor'];
    }
    if (layout_textObj.hasOwnProperty('text-pitch-alignment')) {
      layer.layout['text-pitch-alignment'] =
        layout_textObj['text-pitch-alignment'];
    }
    if (layout_textObj.hasOwnProperty('text-max-width')) {
      layer.layout['text-max-width'] = layout_textObj['text-max-width'];
    }
    if (layout_textObj.hasOwnProperty('symbol-spacing')) {
      layer.layout['symbol-spacing'] = layout_textObj['symbol-spacing'];
    }
    if (layout_textObj.hasOwnProperty('text-line-height')) {
      layer.layout['text-line-height'] = layout_textObj['text-line-height'];
    }
    if (layout_textObj.hasOwnProperty('text-letter-spacing')) {
      layer.layout['text-letter-spacing'] =
        layout_textObj['text-letter-spacing'];
    }
    if (layout_textObj.hasOwnProperty('text-rotate')) {
      layer.layout['text-rotate'] = layout_textObj['text-rotate'];
    }
    // ---------------------------------
    if (paint_textObj.hasOwnProperty('text-opacity')) {
      layer.paint['text-opacity'] = paint_textObj['text-opacity'];
    }
    if (paint_textObj.hasOwnProperty('text-halo-color')) {
      layer.paint['text-halo-color'] = paint_textObj['text-halo-color'];
    }
    if (paint_textObj.hasOwnProperty('text-halo-width')) {
      layer.paint['text-halo-width'] = paint_textObj['text-halo-width'];
    }
    if (paint_textObj.hasOwnProperty('text-halo-blur')) {
      layer.paint['text-halo-blur'] = paint_textObj['text-halo-blur'];
    }
    return layer;
  }
  removeLayer(stid: string, tid: string) {
    if (!this.map) return;
    let lay = this.map.getLayer(tid);
    if (lay) this.map.removeLayer(tid);
  }
}

export default TextLayer;
