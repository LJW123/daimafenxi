import { getQMap, DrawCore, QToolModel } from '../../core';

class BaseTool implements QToolModel {
  handler: any;

  drawType: any;
  opts: any = {};

  leftDownEventBind: any;
  mouseMoveEventBind: any;
  leftUpEventBind: any;
  leftClickEventtBind: any;
  rightClickEventBind: any;

  constructor() {}
  leftDownEvent(eve: any): void {}
  leftUpEvent(eve: any): void {}
  leftClickEvent(eve: any): void {}
  leftDoubleClickEvent(eve: any): void {}
  rightClickEvent(eve: any): void {}
  mouseMoveEvent(eve: any): void {}

  activate(opts: any) {
    if (!this.handler) {
      this.bindEvent();
    }
    this.opts = opts;
    if (opts.drawType) {
      this.drawType = opts.drawType;
    }
  }
  disable() {
    this.unBindEvent();
  }

  createDrawbase(style: any = {}, drawType?: any): DrawCore | any | null {
    let dtype = this.drawType;
    if (drawType) {
      dtype = drawType;
    }

    return getQMap()?.drawEntityFactory.createDrawEntity(
      dtype,
      style,
      this.opts,
    );
  }
  selectEntityFn(entity: any) {}
  addDrawEntity(obj: any) {}
  deleteEntityFn(sel?: any) {}

  /**
   * 下面是基础方法
   */
  bindEvent() {
    //鼠标移动防抖
    // let dMouseMoveEvent = debounce((eve: any) => {
    //   this.mouseMoveEvent(eve);
    // });

    this.leftDownEventBind = this.leftDownEvent.bind(this);
    // this.mouseMoveEventBind = dMouseMoveEvent.bind(this);
    this.mouseMoveEventBind = this.mouseMoveEvent.bind(this);
    this.leftUpEventBind = this.leftUpEvent.bind(this);
    this.leftClickEventtBind = this.leftClickEvent.bind(this);
    this.rightClickEventBind = this.rightClickEvent.bind(this);

    let map = getQMap()?.getMap();
    map.on('mousedown', this.leftDownEventBind);
    map.on('mousemove', this.mouseMoveEventBind);
    map.on('mouseup', this.leftUpEventBind);
    map.on('click', this.leftClickEventtBind);
    map.on('contextmenu', this.rightClickEventBind);
  }
  unBindEvent() {
    let map = getQMap()?.getMap();
    map.off('mousedown', this.leftDownEventBind);
    map.off('mousemove', this.mouseMoveEventBind);
    map.off('mouseup', this.leftUpEventBind);
    map.off('click', this.leftClickEventtBind);
    map.off('contextmenu', this.rightClickEventBind);
  }
}

export default BaseTool;
