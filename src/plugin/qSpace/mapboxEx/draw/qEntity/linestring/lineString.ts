import DrawCore from '../../core/DrawCore';
import { EntityModel } from '../../../../core';
import {
  addEventFrame,
  clearEventFrame,
} from '../../../../util/requestAnimationFrameFn';

class DrawLineString extends DrawCore {
  timeC: number = 60;
  step: number = 0;

  // 1是正 2是反
  direction: number = 1;

  dashArraySequence: any[] = [
    // [0, 1, 6],
    // [0.5, 1, 5.5],
    // [1, 1, 5],
    // [1.5, 1, 4.5],
    // [2, 1, 4],
    // [2.5, 1, 3.5],
    // [3, 1, 3],
    // [3.5, 1, 2.5],
    // [4, 1, 2],
    // [4.5, 1, 1.5],
    // [5, 1, 1],
    // [5.5, 1, 0.5],
    // [6, 1, 0],
  ];

  constructor(
    map: any,
    factory: EntityModel,
    style: object = {},
    opts: object = {},
  ) {
    super(map, factory, style, opts);
  }

  animateLine(timestamp: number) {
    const length = this.dashArraySequence.length;
    if (length > 0) {
      const newStep = Math.floor((timestamp / this.timeC) % length);
      if (newStep !== this.step) {
        let _newStep = newStep;
        // let _newStep = this.step
        if (this.direction == 1) {
        } else if (this.direction == 2) {
          _newStep = length - this.step - 1;
        }
        if (!this.map) return;
        const allid = this.getAllId();
        const lid = allid.lid;
        const ll = this.map?.getLayer(lid);
        if (ll) {
          this.map.setPaintProperty(
            lid,
            'line-dasharray',
            this.dashArraySequence[_newStep],
          );
        }
        this.step = newStep;
      }
    }
  }

  setStyleDirection(dir: string) {
    if (dir == 'left') {
      this.direction = 1;
    } else if (dir == 'right') {
      this.direction = 2;
    }
  }

  setDashArraySequence(num: number) {
    let arr = [];
    if (num > 0) {
      for (let index = 0; index < num; index++) {
        arr.push([index, 1, num - index]);
        arr.push([index + 0.5, 1, num - 0.5 - index]);
      }
      arr.push([num, 1, 0]);
    }
    this.dashArraySequence = arr;
  }

  disposeEventFrame(style_type: string) {
    const allid = this.getAllId();
    const lid = allid.lid;
    const frame_name = `${lid}_fluxion_frame`;
    if (style_type == 'default') {
      clearEventFrame(frame_name);
    } else if (style_type == 'fluxion') {
      addEventFrame({
        name: frame_name,
        time: this.timeC,
        func: (time: number) => {
          this.animateLine(time);
        },
      });
    }
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
          } else if (i === '_line-style-type') {
            this.disposeEventFrame(item[i]);
          } else if (i === '_line-style-direction') {
            this.setStyleDirection(item[i]);
          }
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
        }
      }
    }
  }

  createLineLayer() {
    const allid = this.getAllId();
    const sid = allid.sid;
    const lid = allid.lid;

    const qStyles = this.getQStyles();
    const layoutObj: any = qStyles.getLayoutObj();
    const paintObj: any = qStyles.getPaintObj();

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
        'line-opacity': paintObj['line-opacity'],
        'line-color': paintObj['line-color'],
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
      this.setDashArraySequence(paintObj['line-dasharray']);
    } else {
      this.setDashArraySequence(0);
    }

    if (!this.map) return;
    const lay = this.map.getLayer(lid);
    if (lay) this.map.removeLayer(lid);
    this.map.addLayer(layer);

    this.disposeEventFrame(layoutObj['_line-style-type']);
  }
}

export default DrawLineString;
