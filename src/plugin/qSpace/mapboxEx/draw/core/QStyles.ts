import qStyles from '../../../qStyles.json';

class QStyles {
  [props: string]: any;

  type: string = '';

  // 实体样式
  layout: any = {};
  paint: any = {};
  // 标签 样式  分  注记  标注
  layout_text: any = {};
  paint_text: any = {};

  constructor(type: string = '', styles: object = {}) {
    this.type = type;

    this.setStyle(styles);
  }

  // 实体 布局样式
  getLayoutObj(): object {
    return this.getStyleObj(this.layout, this.layout, this.paint);
  }
  // 实体 绘制样式
  getPaintObj(): object {
    return this.getStyleObj(this.paint, this.layout, this.paint);
  }
  // 标签 布局样式
  getLayoutTextObj(): object {
    return this.getStyleObj(
      this.layout_text,
      this.layout_text,
      this.paint_text,
    );
  }
  // 标签 绘制样式
  getPaintTextObj(): object {
    return this.getStyleObj(this.paint_text, this.layout_text, this.paint_text);
  }

  private getStyleObj(sobj: any, layout: any, paint: any): object {
    let obj: any = {};
    for (let i in sobj) {
      const d = sobj[i];
      if (d.hasOwnProperty('requires')) {
        const requires: [] = d.requires;
        let h = true;
        for (let q = 0; q < requires.length; q++) {
          const r: any = requires[q];
          if (typeof r == 'string') {
            if (!layout.hasOwnProperty(r) && !paint.hasOwnProperty(r))
              h = false;
          } else if (typeof r == 'object') {
            for (let w in r) {
              if (typeof r[w] == 'string') {
                if (layout[w] && layout[w].value != r[w]) {
                  h = false;
                }
                if (paint[w] && paint[w].value != r[w]) {
                  h = false;
                }
              } else {
                if (layout[w] && !r[w].find((e: any) => layout[w].value == e)) {
                  h = false;
                }
                if (paint[w] && !r[w].find((e: any) => paint[w].value == e)) {
                  h = false;
                }
              }
            }
          }
        }
        if (h) obj[i] = d.value;
      } else {
        obj[i] = d.value;
      }
    }
    return obj;
  }

  // 改变样式
  setStyleValue(type: string, item: any) {
    for (let i in item) {
      this[type][i].value = item[i];
    }
  }

  // 转 对象
  toObjectData() {
    const layoutObj: any = this.getLayoutObj();
    const paintObj: any = this.getPaintObj();
    const layout_textObj: any = this.getLayoutTextObj();
    const paint_textObj: any = this.getPaintTextObj();
    return {
      layout: layoutObj,
      paint: paintObj,
      layout_text: layout_textObj,
      paint_text: paint_textObj,
    };
  }

  // 重置样式
  setStyle(styles: any = {}) {
    if (this.type) {
      const _qStyles: any = JSON.parse(JSON.stringify(qStyles));

      const layout: any = _qStyles['layout_' + this.type];
      const paint: any = _qStyles['paint_' + this.type];

      const layout_text: any = _qStyles['layout_text'];
      const paint_text: any = _qStyles['paint_text'];

      for (let i in layout) {
        // if (i === 'visibility') continue;
        this.layout[i] = layout[i];
        this.layout[i].value = layout[i].default;
        if (
          styles.hasOwnProperty('layout') &&
          styles.layout.hasOwnProperty(i)
        ) {
          this.layout[i].value = styles.layout[i];
        }
      }
      for (let i in paint) {
        this.paint[i] = paint[i];
        this.paint[i].value = paint[i].default;
        if (styles.hasOwnProperty('paint') && styles.paint.hasOwnProperty(i)) {
          this.paint[i].value = styles.paint[i];
        }
      }
      if (this.type !== 'symbol') {
        for (let i in layout_text) {
          this.layout_text[i] = layout_text[i];
          this.layout_text[i].value = layout_text[i].default;
          if (
            styles.hasOwnProperty('layout_text') &&
            styles.layout_text.hasOwnProperty(i)
          ) {
            this.layout_text[i].value = styles.layout_text[i];
          }
        }
        for (let i in paint_text) {
          this.paint_text[i] = paint_text[i];
          this.paint_text[i].value = paint_text[i].default;
          if (
            styles.hasOwnProperty('paint_text') &&
            styles.paint_text.hasOwnProperty(i)
          ) {
            this.paint_text[i].value = styles.paint_text[i];
          }
        }
      }
    }
  }
}
export default QStyles;
