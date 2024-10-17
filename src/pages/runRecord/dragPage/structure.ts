// import { qMap } from "@/qSpace/core";


const containerName: string = "dragPageStyles"; //容器名称

// 默认宽高
const defaultPosition: any = {
  of_view_1: { width: null, height: null },
  of_view_2: { width: null, height: null },
  of_view_3: { width: null, height: null },
  of_view_4: { width: null, height: null },
  of_view_5: { width: null, height: null },
  of_view_6: { width: null, height: null },
  of_view_7: { width: null, height: null },
  of_view_8: { width: null, height: null },
  of_view_9: { width: null, height: null },

}


interface ClientXY {
  x: number;
  y: number;
}
interface WH {
  w: number;
  h: number;
}



// 结构
class Structure {

  mouseXY: ClientXY = {
    x: 0,
    y: 0,
  }

  // 值为 w 或 h  意思为影响的值
  lineType: string = ''

  domId1: string = ''
  dom1WH: WH = {
    w: 0,
    h: 0,
  }


  domId2: string = ''
  dom2WH: WH = {
    w: 0,
    h: 0,
  }

  callBack: any

  constructor() { }

  setCallBack(callBack: any) {
    this.callBack = callBack
  }

  onMouseDown = (e: any, t: string, id1: string, id2: string) => {
    this.lineType = t
    this.domId1 = id1
    this.domId2 = id2

    const dom1sty = this.getRootStyle(this.domId1);
    const doc_width1: number = parseInt(dom1sty.width);
    const doc_height1: number = parseInt(dom1sty.height);
    this.dom1WH = {
      w: doc_width1,
      h: doc_height1
    }

    const dom2sty = this.getRootStyle(this.domId2);
    const doc_width2: number = parseInt(dom2sty.width);
    const doc_height2: number = parseInt(dom2sty.height);
    this.dom2WH = {
      w: doc_width2,
      h: doc_height2
    }

    const nativeEvent = e.nativeEvent;
    this.mouseXY = {
      x: nativeEvent.clientX,
      y: nativeEvent.clientY,
    };
    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseup', this.onMouseUp);


  };

  onMouseMove = (e: any) => {
    const clientX = e.clientX - this.mouseXY.x;
    const clientY = e.clientY - this.mouseXY.y;

    const offsetXY: ClientXY = {
      x: clientX,
      y: clientY,
    }

    const lineType = this.lineType
    const dom1 = document.getElementById(this.domId1)
    const dom2 = document.getElementById(this.domId2)
    if (lineType == 'w') {
      if (dom1) dom1.style.width = `${this.dom1WH.w + offsetXY.x}px`
      if (dom2) dom2.style.width = `${this.dom2WH.w - offsetXY.x}px`
    } else if (lineType == 'h') {
      if (dom1) dom1.style.height = `${this.dom1WH.h + offsetXY.y}px`
      if (dom2) dom2.style.height = `${this.dom2WH.h - offsetXY.y}px`
    }
  };

  onMouseUp = (e: any) => {
    this.mouseXY = {
      x: 0,
      y: 0,
    };
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);
    this.lineType = ''

    this.getPosition();

    // qMap?.map.resize();

  };

  getRootStyle(id: string) {
    let doc: any = document.getElementById(id);
    let sty = getComputedStyle(doc, null);
    return sty;
  }

  // 第一个ID值为0
  setPosition(domId1: string, domId2: string, t: string, val?: number) {
    let dom1Sty = this.getRootStyle(domId1);
    let dom2Sty = this.getRootStyle(domId2);

    let stylesStr = localStorage.getItem(containerName);
    let obj: any = {}

    if (stylesStr) {
      let stylesObj = JSON.parse(stylesStr);
      obj = stylesObj;
    }

    obj[domId1] = {
      width: dom1Sty.width,
      height: dom1Sty.height,
    }
    obj[domId2] = {
      width: dom2Sty.width,
      height: dom2Sty.height,
    }

    if (val) {
      obj[domId2][t] = `${parseFloat(obj[domId2][t]) + parseFloat(obj[domId1][t]) - val}px`
      obj[domId1][t] = `${val}px`
    } else {
      obj[domId2][t] = `${parseFloat(obj[domId2][t]) + parseFloat(obj[domId1][t]) - 0}px`
      obj[domId1][t] = `0px`
    }

    let str = JSON.stringify(obj);
    localStorage.setItem(containerName, str)
    if (this.callBack) {
      this.callBack()
    }
  }


  // 记录当前dom1,dom2的位置信息
  getPosition() {
    let dom1Sty = this.getRootStyle(this.domId1);
    let dom2Sty = this.getRootStyle(this.domId2);

    let stylesStr = localStorage.getItem(containerName);
    let obj: any = {}

    if (stylesStr) {
      let stylesObj = JSON.parse(stylesStr);
      obj = stylesObj;
    }

    obj[this.domId1] = {
      width: dom1Sty.width,
      height: dom1Sty.height,
    }
    obj[this.domId2] = {
      width: dom2Sty.width,
      height: dom2Sty.height,
    }

    let str = JSON.stringify(obj);
    localStorage.setItem(containerName, str)

    if (this.callBack) {
      this.callBack()
    }
  };

  // 初始化位置
  initPosition(domId: any) {
    let styles = {
      width: defaultPosition[domId]?.width,
      height: defaultPosition[domId]?.height,
    }

    let stylesStr = localStorage.getItem(containerName);
    if (stylesStr) {
      let stylesObj = JSON.parse(stylesStr);
      for (let key in stylesObj) {
        if (key === domId) {
          styles = {
            width: stylesObj[key].width,
            height: stylesObj[key].height,
          }
        }
      }
    }

    return styles
  };

  initPosition1() {
    let stylesStr = localStorage.getItem(containerName);
    if (stylesStr) {
      let stylesObj = JSON.parse(stylesStr);
      for (let key in stylesObj) {
        let dom = document.getElementById(key);
        if (dom) {
          dom.style.width = stylesObj[key].width;
          dom.style.height = stylesObj[key].height;
        }
      }
    }
  };

}


let structure = new Structure()

export default structure