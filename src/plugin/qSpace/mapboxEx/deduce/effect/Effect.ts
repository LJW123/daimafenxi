
class Effect {
  // 顺序  序号
  indexNumber: number = 0;
  // 动画名称
  name: string = '';

  //开始时间  时间戳
  startTime: number = 0;
  //结束时间  时间戳
  endTime: number = 0;

  constructor() { }
  update(runTime: number, a?: any, b?: any, c?: any, d?: any) { }
  updateData(runTime: number) { }
  restore() { }
  getIndexNumber() {
    return this.indexNumber;
  }
  setIndexNumber(num: number) {
    this.indexNumber = num;
  }
  getName(): string {
    return this.name;
  }
  setName(val: string) {
    this.name = val;
  }
  setStartTime(time: number) {
    this.startTime = Number(time);
  }
  setEndTime(time: number) {
    this.endTime = Number(time);
  }

  moveStartTime(time: number) {
    this.startTime = Number(this.startTime + time);
  }
  moveEndTime(time: number) {
    this.endTime = Number(this.endTime + time);
  }

  toObject() {
    let obj: any = {};
    return obj;
  }
  loadObject(obj: any) { }
}

export default Effect;
