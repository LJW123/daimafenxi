import {
  QMapGl,
  QStyles,
  Color,
  getDataUrl,
  getQMap,
  DrawCore,
  EntityModel,
} from '../../../../core';

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
    this.createLayer();
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

  createLayer() {
    const imageUrl = `${getDataUrl()}/image`;

    const qStyles = this.getQStyles();
    const layout_textObj: any = qStyles.getLayoutTextObj();
    const paint_textObj: any = qStyles.getPaintTextObj();

    const text_color_w = paint_textObj['text-color'];
    const text_size = layout_textObj['text-size'];
    const text_field = layout_textObj['text-field'];

    const bg_image = layout_textObj['_text-bg-image'];

    const bg_color = layout_textObj['_text-bg-color'];
    const bg_opacity = layout_textObj['_text-bg-opacity'];
    const _bg_color: any = Color.fromCssColorString(bg_color);
    _bg_color.alpha = bg_opacity;

    const border_color = layout_textObj['_text-border-color'];
    const border_opacity = layout_textObj['_text-border-opacity'];
    const _border_color: any = Color.fromCssColorString(border_color);
    _border_color.alpha = border_opacity;

    const line_color = layout_textObj['_text-line-color'];
    const line_opacity = layout_textObj['_text-line-opacity'];
    const _line_color: any = Color.fromCssColorString(line_color);
    _line_color.alpha = line_opacity;

    const div_width = layout_textObj['_text-div-width'];
    const div_height = layout_textObj['_text-div-height'];

    const offset_right = layout_textObj['_text-offset-right'];
    const offset_top = layout_textObj['_text-offset-top'];

    const line_length = Math.sqrt(
      Math.pow(Math.abs(offset_right), 2) + Math.pow(Math.abs(offset_top), 2),
    );
    const angle = Math.round(
      (Math.atan(offset_right / offset_top) * 180) / Math.PI,
    );

    let _angle = Math.abs(angle);
    let _line_length = line_length;
    if (_angle > 45) {
      let length = (div_width / 2 / Math.abs(offset_right)) * line_length;
      _line_length = line_length - length;
    } else {
      let length = (div_height / 2 / Math.abs(offset_top)) * line_length;
      _line_length = line_length - length;
    }

    let el = document.createElement('div');
    el.className = 'txt_label_marker_style2';

    let con = document.createElement('div');
    con.className = 'txt_label_marker_content';
    con.id = this.featureKey;
    con.style.backgroundColor = _bg_color.toCssColorString();
    con.style.color = text_color_w;
    con.style.border = `2px solid ${_border_color.toCssColorString()}`;
    // con.style.padding = `4px`;
    con.style.fontSize = `${text_size}px`;
    con.style.width = `${div_width}px`;
    con.style.height = `${div_height}px`;

    if (bg_image) {
      con.style.backgroundImage = `url(${imageUrl}/${bg_image})`;
    }
    con.innerHTML = `<div class='content' >
      ${text_field}
      </div>`;

    let line = document.createElement('div');
    line.className = 'txt_line_marker_content';
    line.style.width = `2px`;
    line.style.height = `${Math.abs(_line_length)}px`;
    line.style.backgroundColor = _line_color.toCssColorString();

    con.style.left = `${offset_right - div_width / 2}px`;
    con.style.top = `${-offset_top - div_height / 2}px`;

    if (offset_top == 0) {
      line.style.transform = `rotateZ(${angle}deg) translateY(${
        -_line_length / 2
      }px) `;
    } else if (offset_top > 0) {
      line.style.transform = `rotateZ(${angle}deg) translateY(${
        -_line_length / 2
      }px) `;
    } else {
      line.style.transform = `rotateZ(${angle}deg) translateY(${
        _line_length / 2
      }px) `;
    }

    el.appendChild(con);
    el.appendChild(line);

    con.addEventListener('mousedown', this.onMouseDown);

    let marker = new QMapGl.Marker(el);
    return marker;
  }

  startDragNote() {
    this.isDragNote = true;
  }

  endDragNote() {
    this.isDragNote = false;
  }

  onMouseDown = (e: any) => {
    if (!this.map) return;
    if (!this.parent) return;
    if (this.isDragNote) {
      if (this.qStyles) {
        const layout_textObj: any = this.qStyles.getLayoutTextObj();
        const show = layout_textObj['visibility'] === 'visible';
        const text_type = layout_textObj['_text-type'];

        if (text_type === this.layerType && show) {
          this.map.dragPan.disable();
          this.downXY = {
            x: e.clientX,
            y: e.clientY,
          };

          const qStyles = this.parent.getQStyles();

          const layout_textObj: any = qStyles.getLayoutTextObj();
          const offset_right = layout_textObj['_text-offset-right'];
          const offset_top = layout_textObj['_text-offset-top'];
          this.downXY2 = {
            x: offset_right,
            y: offset_top,
          };

          document.addEventListener('mousemove', this.onMouseMove);
          document.addEventListener('mouseup', this.onMouseUp);
        }
      }
    }
  };
  onMouseUp = (e: any) => {
    if (!this.map) return;
    if (!this.parent) return;
    this.map.dragPan.enable();
    this.downXY = {
      x: 0,
      y: 0,
    };
    this.downXY2 = {
      x: 0,
      y: 0,
    };

    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);
  };
  onMouseMove = (e: any) => {
    if (!this.parent) return;

    let clientX = e.clientX - this.downXY.x;
    let clientY = e.clientY - this.downXY.y;

    let obj = {
      '_text-offset-right': this.downXY2.x + clientX,
      '_text-offset-top': this.downXY2.y - clientY,
    };

    this.parent.updateStyle('layout_text', obj);
    getQMap()?.Evented.fire('updateNum', {});
  };

  isComplete() {
    return true;
  }
}
export default DrawText;
