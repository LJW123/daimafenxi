import { ChartModel } from '../../core';

import QPagePosition from './QPagePosition';

class QPagePositionCollection {
  qPages: QPagePosition[] = [];

  show: boolean = true;

  leftW: number = 300;
  rightW: number = 300;
  padding: number = 8;
  qPagesTopHeightL: number = 64;
  qPagesTopHeightR: number = 64;
  zindex: number = 1;

  constructor() {}
  getShow(): boolean {
    return this.show;
  }
  setShow(boo: boolean) {
    this.show = boo;
  }

  setZIndex(id: string) {
    let item = this.getQPage(id);
    if (item) item.setZIndex(++this.zindex);
  }
  setAttr(obj: any) {
    this.leftW = obj.leftW;
    this.rightW = obj.rightW;
    this.padding = obj.padding;
    this.qPagesTopHeightL = obj.heightL;
    this.qPagesTopHeightR = obj.heightR;
    this.updateLayout();
  }

  updateLayout() {
    let height_l = this.qPagesTopHeightL;
    // let height_r = 50;
    let height_r = this.qPagesTopHeightR;
    let padding = this.padding;

    const leftPages = this.qPages.filter(
      (it: QPagePosition) => it.layout === 'left',
    );
    const rightPages = this.qPages.filter(
      (it: QPagePosition) => it.layout === 'right',
    );

    leftPages.sort((a: any, b: any) => a.top - b.top);
    rightPages.sort((a: any, b: any) => a.top - b.top);

    for (let i = 0; i < leftPages.length; i++) {
      const page: QPagePosition = leftPages[i];
      page.width = this.leftW;
      page.top = height_l + padding;
      page.left = padding;
      height_l += page.height + padding;
    }
    for (let i = 0; i < rightPages.length; i++) {
      const page: QPagePosition = rightPages[i];
      page.width = this.rightW;
      page.top = height_r + padding;
      page.right = padding;
      height_r += page.height + padding;
    }

    // for (let i = 0; i < this.qPages.length; i++) {
    //   const page: QPagePosition = this.qPages[i];
    //   if (page.layout === 'left') {
    //     page.width = this.leftW;
    //     page.top = height_l + padding;
    //     page.left = padding;
    //     height_l += page.height + padding;
    //   } else if (page.layout === 'right') {
    //     page.width = this.rightW;
    //     page.top = height_r + padding;
    //     page.right = padding;
    //     height_r += page.height + padding;
    //   }
    // }
  }

  updateHeight(height: number) {
    this.qPages.forEach((item: QPagePosition) => {
      item.setAttr({ height: height });
    });
    this.updateLayout();
  }

  addQPage(item: ChartModel) {
    const have = this.isHave(item.id);
    if (have) this.removeQPage(item.id);
    const qPagePosition = new QPagePosition(item);
    qPagePosition.setZIndex(this.zindex);
    this.qPages.push(qPagePosition);
    this.zindex++;
  }

  removeQPage(id: string) {
    const keyx = this.qPages.findIndex((item: QPagePosition) => item.id === id);
    if (keyx >= 0) {
      this.qPages.splice(keyx, 1);
    }
  }

  getQPage(id: string): QPagePosition | null {
    const have = this.qPages.find((item: QPagePosition) => item.id === id);
    if (have) return have;
    return null;
  }

  isHave(id: string): boolean {
    const have = this.qPages.find((item: QPagePosition) => item.id === id);
    if (have) return true;
    return false;
  }

  toObject() {
    let obj: any = {
      qPages: this.qPages.map((item: QPagePosition) => {
        return item.toObject();
      }),
      show: this.show,
      leftW: this.leftW,
      rightW: this.rightW,
      padding: this.padding,
      zindex: this.zindex,
      heightL: this.qPagesTopHeightL,
      heightR: this.qPagesTopHeightR,
    };
    return obj;
  }

  loadObject(chartsObj: any) {
    this.show = chartsObj.show;
    this.leftW = chartsObj.leftW;
    this.rightW = chartsObj.rightW;
    this.padding = chartsObj.padding;
    this.qPagesTopHeightL = chartsObj.heightL || 64;
    this.qPagesTopHeightR = chartsObj.heightR || 64;
    this.zindex = chartsObj.zindex;
    this.qPages = chartsObj.qPages.map((item: any) => {
      let obj: ChartModel = {
        id: item.id,
        name: item.name,
        icon: item.icon,
        chartType: item.chartType,
        oldData: item.oldData || item.data,
      };
      const qPagePosition = new QPagePosition(obj);
      qPagePosition.loadObject(item);
      return qPagePosition;
    });

    setTimeout(() => {
      this.updateLayout();
    }, 400);
  }
}

export default QPagePositionCollection;
