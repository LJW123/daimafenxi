import { ChartModel } from '../../core';

class QPagePosition {
  [props: string]: any;
  // =====控件数据=========
  id: string = '';
  // key: string = '';
  name: string = '';
  icon: string = '';
  chartType: any = '';
  oldData: any;

  // ----宽高--------
  width: number = 300;
  height: number = 300;

  // -----样式 类型-------

  templates: string = '1';

  // -----布局-------
  layout: string = 'p'; //p 空位绝对布局  left 和 right 为相对布局 分左右

  top: number = 100;
  left: number = 100;
  right: number = 100;
  // bottom: number = 0
  zindex: number = 1;

  constructor(item: ChartModel) {

    this.id = item.id;
    this.name = item.name;
    this.icon = item.icon;
    this.chartType = item.chartType;
    this.oldData = item.oldData;
  }

  getLayoutData() {
    let obj: any = {
      layout: this.layout,
      width: this.width,
      height: this.height,
      top: this.top,
      zindex: this.zindex,
    };
    if (this.layout === 'right') {
      obj.right = this.right;
    } else {
      obj.left = this.left;
    }
    return obj;
  }

  setZIndex(num: number) {
    this.zindex = num;
  }
  setAttr(obj: any) {
    for (let i in obj) {
      this[i] = obj[i];
    }
  }

  toObject() {
    let obj: any = {
      id: this.id,
      name: this.name,
      icon: this.icon,
      chartType: this.chartType,
      oldData: this.oldData,

      width: this.width,
      height: this.height,
      templates: this.templates,
      layout: this.layout,
      top: this.top,
      left: this.left,
      right: this.right,
      zindex: this.zindex,
    };
    return obj;
  }

  loadObject(chartsObj: any) {
    this.width = chartsObj.width;
    this.height = chartsObj.height;
    this.templates = chartsObj.templates;
    this.layout = chartsObj.layout;
    this.top = chartsObj.top;
    this.left = chartsObj.left;
    this.right = chartsObj.right;
    this.zindex = chartsObj.zindex;
  }
}

export default QPagePosition;
