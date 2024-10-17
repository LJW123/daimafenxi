import DrawPoint from '../point/point';
import { getQMap, EntityModel } from '../../../../core';

class DrawIconMilitary extends DrawPoint {
  imgUrl: string = '';
  constructor(
    map: any,
    factory: EntityModel,
    style: object = {},
    opts: any = {},
  ) {
    super(map, factory, style, opts);
    this.imgUrl = opts.imgUrl;
  }
  // 添加图层
  addLayer() {
    this.createImage(() => {
      this.createPointLayer();
      this.updateNoteLayer();
      if (this.controlPointLayer) this.controlPointLayer.moveLayer();
    });
  }
  updateLayers(type: string, item: any) {
    const allid = this.getAllId();
    const pid = allid.pid;
    const qStyles = this.getQStyles();
    const layoutObj: any = qStyles.getLayoutObj();
    const lay = this.map.getLayer(pid);
    if (!lay) return;
    if (type === 'layout') {
      for (let i in item) {
        if (i.indexOf('_') < 0) {
          if (i === 'icon-offset-right') {
            const n = layoutObj['icon-offset-bottom'];
            this.map.setLayoutProperty(pid, 'icon-offset', [item[i], n]);
          } else if (i === 'icon-offset-bottom') {
            const n = layoutObj['icon-offset-right'];
            this.map.setLayoutProperty(pid, 'icon-offset', [n, item[i]]);
          } else {
            this.map.setLayoutProperty(pid, i, item[i]);
          }
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
      source: sid,
      type: 'symbol',
      minzoom: layoutObj['_minzoom'],
      maxzoom: layoutObj['_maxzoom'],
      layout: {
        'icon-allow-overlap': layoutObj['icon-allow-overlap'],
        'icon-ignore-placement': layoutObj['icon-ignore-placement'],
        'icon-size': layoutObj['icon-size'],
        // 'icon-image': layoutObj['icon-image'],
        'icon-rotate': layoutObj['icon-rotate'],
        'icon-offset': [
          layoutObj['icon-offset-right'],
          layoutObj['icon-offset-bottom'],
        ],
        'icon-anchor': layoutObj['icon-anchor'],
        'icon-pitch-alignment': layoutObj['icon-pitch-alignment'],
        'icon-image': this.getIconId(),
        visibility: this.show ? 'visible' : 'none',
      },
      paint: {
        'icon-opacity': paintObj['icon-opacity'],
        'icon-color': paintObj['icon-color'],
        'icon-halo-color': paintObj['icon-halo-color'],
        'icon-halo-width': paintObj['icon-halo-width'],
        'icon-halo-blur': paintObj['icon-halo-blur'],
      },
    };

    if (!this.map) return;
    const lay = this.map.getLayer(pid);
    if (lay) this.map.removeLayer(pid);
    this.map.addLayer(layer);
  }
  createImage(callback?: any) {
    const iconImage = this.getIconId();

    let image = new Image();
    let imgUrl = this.imgUrl;
    image.src = imgUrl;
    image.width = 100;
    image.height = 100;
    image.onload = () => {
      getQMap()?.addImageToMap(iconImage, image, { sdf: true });
      // getQMap()?.updateImageToMap(iconImage, image, { sdf: true });
      if (callback) callback();
    };
  }
  getIconId() {
    return `icon_${this.getFeatureKey()}`;
  }
  getQAttributeToObjectData() {
    let attribute: any = this.qAttribute.toObjectData();
    let obj = {
      o_drawType: this.drawName,
      o_imgUrl: this.imgUrl,
      o_featureKey: this.getFeatureKey(),
      o_show: this.show,
      ...attribute,
    };
    return obj;
  }
}

export default DrawIconMilitary;
