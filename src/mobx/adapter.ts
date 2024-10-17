// 适配器文件
import { message } from "antd";
import { makeAutoObservable } from "mobx";
import { history } from 'umi';

type MessageType = 'success' | 'error' | 'warning' | 'info'

class AdapterSpace {

  private static instance: AdapterSpace;
  public static getInstance() {
      if (!AdapterSpace.instance) {
        AdapterSpace.instance = new AdapterSpace();
      }
      return AdapterSpace.instance;
  }

  constructor() {
    makeAutoObservable(this)
  }

  // Message全局提示
  messageOpen(type: MessageType, content: string) {
    const [messageApi] = message.useMessage();
    messageApi.open({
      type: type,
      content: content,
    });
  };

  // history方法
  historyFun() {
    return history
  }

}
 
export default AdapterSpace