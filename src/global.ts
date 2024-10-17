import Events from "./plugin/Evented/Events";
import * as G2 from '@antv/g2';
import * as antd from 'antd';

declare global {
  interface Window {
    Evented: any;
 
  }
}

// 添加全局事件
window.Evented = new Events();

declare global {
  interface Window {
    Handlebars: any;
  }
}
export const Handlebars: any = window.Handlebars;

declare global {
  interface Window {
    G2: any;
  }
  interface Window {
    antd: any;
  }
}
window.G2 = G2;
window.antd = antd;


declare global {
  interface Window {
    queryParams: any;
  }
}

 
