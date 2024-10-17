import DrawCore from '../../../core/DrawCore';
import Color from '../../../../../util/Color';
import { getQMap, EntityModel } from '../../../../../core';

// 动态点
class DrawDynamicPoint extends DrawCore {
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
          this.map.setLayoutProperty(pid, i, item[i]);
        } else {
          if (i === '_minzoom') {
            const n = layoutObj['_maxzoom'];
            this.map.setLayerZoomRange(pid, item[i], n);
          } else if (i === '_maxzoom') {
            const n = layoutObj['_minzoom'];
            this.map.setLayerZoomRange(pid, n, item[i]);
          }
          this.createImage(() => {});
        }
        // if (i.indexOf('_') < 0) this.map.setLayoutProperty(pid, i, item[i]);
      }
    } else if (type === 'paint') {
      for (let i in item) {
        if (i.indexOf('_') < 0) {
          this.map.setPaintProperty(pid, i, item[i]);
        } else {
          this.createImage(() => {
            // this.map.triggerRepaint();
          });
        }
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

    let layer = {
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
        'icon-pitch-alignment': layoutObj['icon-pitch-alignment'],
        'icon-image': this.getIconId(),
        visibility: this.show ? 'visible' : 'none',
      },
      paint: {
        'icon-opacity': paintObj['icon-opacity'],
      },
    };

    if (!this.map) return;
    const lay = this.map.getLayer(pid);
    if (lay) this.map.removeLayer(pid);
    this.map.addLayer(layer);
  }
  createImage(callback?: any) {
    const qStyles = this.getQStyles();
    const paintObj: any = qStyles.getPaintObj();
    const fColor: any = Color.fromCssColorString(
      paintObj['_icon-color'],
    )?.toBytes();
    const oColor: any = Color.fromCssColorString(
      paintObj['_icon-outline-color'],
    )?.toBytes();

    let iconImage = this.getIconId();
    let _map = this.map;
    let size = 100;
    let image = {
      width: size,
      height: size,
      data: new Uint8Array(size * size * 4),
      context: <any>null,
      onAdd: function () {
        let canvas = document.createElement('canvas');
        canvas.width = this.width;
        canvas.height = this.height;
        this.context = canvas.getContext('2d');
      },

      render: function () {
        let duration = 1000;
        let t = (performance.now() % duration) / duration;

        let radius = (size / 2) * 0.3;
        let outerRadius = (size / 2) * 0.7 * t + radius;
        let context = this.context;

        context.clearRect(0, 0, this.width, this.height);
        context.beginPath();
        context.arc(
          this.width / 2,
          this.height / 2,
          outerRadius,
          0,
          Math.PI * 2,
        );
        context.fillStyle = `rgba(${oColor[0]}, ${oColor[1]}, ${oColor[2]},${
          1 - t
        })`;
        // context.fillStyle = 'rgba(255, 200, 200,' + (1 - t) + ')';
        context.fill();

        context.beginPath();
        context.arc(this.width / 2, this.height / 2, radius, 0, Math.PI * 2);
        context.fillStyle = `rgba(${fColor[0]}, ${fColor[1]}, ${fColor[2]}, ${fColor[3]})`;
        context.strokeStyle = `rgba(${fColor[0]}, ${fColor[1]}, ${fColor[2]}, ${fColor[3]})`;
        context.lineWidth = 2 + 4 * (1 - t);
        context.fill();
        context.stroke();

        this.data = context.getImageData(0, 0, this.width, this.height).data;
        _map.triggerRepaint();
        return true;
      },
    };

    getQMap()?.addImageToMap(iconImage, image);
    if (callback) callback();
  }
  getIconId() {
    return `icon_${this.getFeatureKey()}`;
  }
  isComplete() {
    return true;
  }
}
export default DrawDynamicPoint;
