import { DeduceEffectType } from "../../../core";

class DeduceBase {
  id: string = ''; //唯一值
  name: string = ''; //唯一值
  dtype: string = ''; //实体类型

  checked: boolean = true;

  // effects: Array<DeduceEffectType> = [];

  constructor() { }

  // 刷新
  update(runTime: number, a?: any, b?: any, c?: any, d?: any, e?: any, f?: any) { }
  // 还原
  restore() { }

  getId() {
    return this.id;
  }
  getName() {
    return this.name;
  }
  getChecked() {
    return this.checked;
  }
  setChecked(checked: boolean) {
    this.checked = checked;
  }
  // 导出对象
  toObject() { }
  // 载入对象
  loadObject(obj: any) { }
}

export default DeduceBase;
