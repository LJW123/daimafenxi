import * as turf from '@turf/turf';
import { QMapGl, Color, DrawCore, Handlebars } from '../../../core';
import QStyles from '../core/QStyles';
import LabelLayer from './LabelLayer';
// import { Carousel } from 'antd';

/**
 * 部件层
 */
class AssemblyLayer extends LabelLayer {
  layerType: string = '部件';

  constructor(map: any, parent: DrawCore) {
    super(map, parent);
  }

  createLayer(qStyles: QStyles, featureKey: string) {
    const layout_textObj: any = qStyles.getLayoutTextObj();
    const paint_textObj: any = qStyles.getPaintTextObj();

    const text_field = layout_textObj['_text-field'];
    const _text_field = `${this.getElement(text_field)}`;

    const text_color_w = paint_textObj['text-color'];

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

    let htmlOutput = '';

    try {
      const parent = this.parent;
      const qAttribute = parent?.qAttribute;
      const objectData = qAttribute?.toObjectData() || {};
      const chartType = text_field?.chartType;
      if (chartType == 4) {
        if (objectData.data) {
          const data = JSON.parse(objectData.data);
          if (Array.isArray(data)) {
            let template = Handlebars.compile(_text_field);

            for (let index = 0; index < data.length; index++) {
              const url = data[index];

              const htmlOutput = template({
                data: url,
              });

              // let elc = document.createElement('Carousel');

              // {
              // "data": [
              //   "http://192.168.1.127/ds/datamg/qfile/preview/3.png?gpid=1480342683420224",
              //   "http://192.168.1.127/ds/datamg/qfile/preview/aa.png?gpid=1480342683420224",
              //   "http://192.168.1.127/ds/datamg/qfile/preview/1.jpg?gpid=1480342683420224"
              // ],
              //   "autoplay": true,
              //   "autoplaySpeed": 3000
              // }

              //     let a= (
              //       <Carousel autoplay={ autoplay } autoplaySpeed = { autoplaySpeed } >
              //       {
              //         htmlList.map((item: any, index: number) => {
              //           return (
              //             <div key= {`${containerId}_${index}`
              //         } dangerouslySetInnerHTML = {{ __html: item.html }} > </div>
              // )
              //     })
              //   }
              //   </Carousel>
              //     )
            }
          }
        }
      } else {
        // 注册并编译模板
        let template = Handlebars.compile(_text_field);
        htmlOutput = template(objectData);
      }
    } finally {
    }

    let el = document.createElement('div');
    el.className = 'txt_label_marker_style2';

    let con = document.createElement('div');
    con.className = 'txt_label_marker_content';
    con.id = featureKey;
    con.style.backgroundColor = _bg_color.toCssColorString();
    con.style.border = `2px solid ${_border_color.toCssColorString()}`;
    con.style.color = text_color_w;
    // con.style.width = `${div_width}px`;
    // con.style.height = `${div_height}px`;

    let content = document.createElement('div');
    content.className = 'content';
    con.appendChild(content);
    content.innerHTML = htmlOutput;

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

  getElement(value: any) {
    let element = '';

    try {
      let charConfig = JSON.parse(value.charConfig);
      element = charConfig.script;
    } catch (error) {}

    return element;
  }
}

export default AssemblyLayer;
