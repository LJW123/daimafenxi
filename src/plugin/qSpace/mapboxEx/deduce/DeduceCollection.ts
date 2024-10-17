import moment from 'moment';

import {
  getQMap,
  DeduceNodeType,
  DeduceCamera,
  DeduceDrawEntity,
  DeduceDataLayer,
  DeduceQPage,
  ViewingAngleModes,
  viewingAngleModesObj,
} from '../../core';

/**
 * 推演集合
 */

class DeduceCollection {
  // 时间单位  年月日时  year  month  day  hour
  timeUnit: string = 'day';
  timeTypes: any = {
    year: {
      ch: '年',
      en: 'years',
      timeStamp: 1000 * 60 * 60 * 24 * 365,
    },
    month: {
      ch: '月',
      en: 'months',
      timeStamp: 1000 * 60 * 60 * 24 * 30,
    },
    day: {
      ch: '日',
      en: 'days',
      timeStamp: 1000 * 60 * 60 * 24,
    },
    hour: {
      ch: '时',
      en: 'hours',
      timeStamp: 1000 * 60 * 60,
    },
  };

  //开始时间  时间戳
  startTime: number = 0;
  //结束时间  时间戳
  endTime: number = 0;
  // 时间列表
  timeAxis: any[] = [];
  timeAxis_arr: any[] = [];

  //推演开始时的时间  是现实时间  时间戳
  sTime: number = 0;
  //已运行时间  已运行多少毫秒  时间戳
  //运行结束时 runTime应该是startTime和endTime的差值
  runTime: number = 0;

  //速度 多少秒  大于零
  speed: number = 1;
  // 0 未开始  1 开始中  2 暂停
  status: number = 0;
  // 动画是否循环播放
  isLoop: boolean = false;
  // 视角模式
  viewingAngleMode: ViewingAngleModes = 'nothing';

  // 动画帧集合
  deduceNodelist: Array<DeduceNodeType> = [new DeduceCamera()];

  constructor() {
    let s = Number(moment('2023-1-01', 'YYYY-MM-DD').format('x'));
    let e = Number(moment('2023-4-01', 'YYYY-MM-DD').format('x')) - 1;
    this.setTimeSpan(s, e);
  }
  // 刷新
  update(time: any) {
    if (this.status === 0) {
      // 未开始
      // this.restore();
    } else if (this.status === 1) {
      // 播放中
      let speed = this.speed;
      let viewingObj: any = {};
      if (viewingAngleModesObj[this.viewingAngleMode]) {
        viewingObj = viewingAngleModesObj[this.viewingAngleMode];
        if (viewingObj?.speed) {
          speed = viewingObj.speed * speed;
        }
      }

      const unit_timeStamp = this.timeTypes[this.timeUnit].timeStamp;
      if (this.sTime === 0) this.sTime = time;
      const t = time - this.sTime;
      this.sTime = time;
      this.runTime = this.runTime + (t / 1000) * unit_timeStamp * speed;

      if (this.runTime > this.endTime - this.startTime) {
        if (this.isLoop) {
          this.restore();
        } else {
          this.setStatus(0);
        }
      } else {
        const r: number = this.runTime + this.startTime;
        this.deduceNodelist.forEach((it: DeduceNodeType) => {
          it.update(r, this.viewingAngleMode, unit_timeStamp, speed);
        });
      }
    } else if (this.status === 2) {
      // 暂停
      this.sTime = 0;
    }
  }
  // 修改 时间单位
  setTimeUnit(unit: string) {
    this.timeUnit = unit;
    this.getTimeAxisData();
  }
  // 修改动画总时间跨度
  setTimeSpan(s: number, e: number) {
    this.startTime = s;
    this.endTime = e;

    this.getTimeAxisData();
  }

  // 根据时间单位和时间跨度处理时间轴数据
  getTimeAxisData() {
    const s = this.startTime;
    const e = this.endTime;
    const s_moment = moment(s);
    const e_moment = moment(e);

    const unit_time = this.getTimeUnit_timeStamp();
    const unit_en = this.getTimeUnit_en();
    const time_unit_cha = e_moment.diff(s_moment, unit_en, true);
    const grid = Math.ceil(Math.abs(time_unit_cha));

    let arr: any[] = [];
    for (let i = 1; i < grid - 1; i++) {
      const timeStamp = Number(
        s_moment
          .clone()
          .add(i * unit_time)
          .format('x'),
      );
      const o: any = this.getTimeClass(timeStamp);
      arr.push({
        time: timeStamp,
        label: `${o[this.timeUnit]}${this.timeTypes[this.timeUnit].ch}`,
        obj: o,
      });
    }
    let so: any = this.getTimeClass(s);
    let eo: any = this.getTimeClass(e);

    arr.unshift({
      time: s,
      label: `${so[this.timeUnit]}${this.timeTypes[this.timeUnit].ch}`,
      obj: so,
    });
    arr.push({
      time: e,
      label: `${eo[this.timeUnit]}${this.timeTypes[this.timeUnit].ch}`,
      obj: eo,
    });

    // year  month  day  hour
    let obj: any = {};
    for (let i = 0; i < arr.length; i++) {
      let ar = arr[i];
      let k = '';
      if (this.timeUnit === 'hour')
        k = `${ar.obj.year}年${ar.obj.month}月${ar.obj.day}日`;
      if (this.timeUnit === 'day') k = `${ar.obj.year}年${ar.obj.month}月`;
      if (this.timeUnit === 'month') k = `${ar.obj.year}年`;
      if (this.timeUnit === 'year') k = `y`;
      if (!obj[k]) obj[k] = [];
      obj[k].push(ar);
    }
    let newArr: any[] = [];
    for (let i in obj) {
      newArr.push({
        key: i,
        val: obj[i],
      });
    }

    this.timeAxis_arr = arr;
    this.timeAxis = newArr;
  }
  // 获取时间戳的年月日时
  getTimeClass(t: number): any {
    let time = moment(t);
    const hour = time.get('hour');
    const day = time.get('date');
    const month = time.get('month');
    const year = time.get('year');
    return {
      year: year,
      month: month + 1,
      day: day,
      hour: hour,
    };
  }
  // 获取动画 是否在运行中
  getStart(): boolean {
    return this.status == 0 ? false : true;
  }
  // 获取动画状态
  getStatus(): number {
    return this.status;
  }
  // 修改动画状态
  setStatus(num: number) {
    this.status = num;
    if (num === 0) {
      this.restore();
    } else if (num === 1) {
    } else if (num === 2) {
      this.deduceNodelist.forEach((it: DeduceNodeType) => {
        if (it instanceof DeduceCamera) it.stopAnimate();
      });
    }
  }
  // 还原 无动画状态
  restore() {
    this.sTime = 0;
    this.runTime = 0;

    this.deduceNodelist.forEach((it: DeduceNodeType) => {
      it.restore();
    });
  }
  // 获取倍速
  getSpeed(): number {
    return this.speed;
  }
  // 修改倍速
  setSpeed(num: number) {
    this.speed = num;
  }
  // 获取动画是否循环播放
  getIsLoop(): boolean {
    return this.isLoop;
  }
  // 修改动画是否循环播放
  setIsLoop(boo: boolean) {
    this.isLoop = boo;
  }
  // 修改 播放时间
  setRunTime(num: number): boolean {
    if (num < this.endTime - this.startTime) {
      this.runTime = num;
      return true;
    } else {
      return false;
    }
  }
  // 获取 时间单位 中文
  getTimeUnit_ch(): string {
    return this.timeTypes[this.timeUnit].ch;
  }
  // 获取 时间单位 英文
  getTimeUnit_en(): string {
    return this.timeTypes[this.timeUnit].en;
  }
  // 获取 时间单位下的 毫秒数
  getTimeUnit_timeStamp(): number {
    return this.timeTypes[this.timeUnit].timeStamp;
  }
  // 获取 时间单位
  getTimeUnit(): string {
    return this.timeUnit;
  }
  // 视角模式
  getViewingAngleMode(): ViewingAngleModes {
    return this.viewingAngleMode;
  }
  // 修改视角模式
  setViewingAngleMode(val: ViewingAngleModes) {
    this.viewingAngleMode = val;
  }

  getDeduceNodelist() {
    return this.deduceNodelist;
  }

  // 根据id获取推演实体节点
  getDeduceNode(id: string): DeduceNodeType | null {
    let node = this.deduceNodelist.find((node) => {
      return node.id == id;
    });
    if (node) return node;
    return null;
  }

  addDeduceNode(ent: DeduceNodeType) {
    const id = ent.getId();
    const node = this.getDeduceNode(id);
    if (!node) this.deduceNodelist.push(ent);

    // if (ent instanceof DeduceCamera) {
    // } else if (ent instanceof DeduceDrawEntity) {
    // } else if (ent instanceof DeduceDataLayer) {
    // } else if (ent instanceof DeduceQPage) {
    // }
  }
  //删除
  removeDeduceNode(id: string) {
    let idx = this.deduceNodelist.findIndex((node) => node.id == id);
    if (idx >= 0) this.deduceNodelist.splice(idx, 1);
  }

  // ========导入 导出========================================
  toObject() {
    let obj: any = {
      speed: this.speed,
      isLoop: this.isLoop,
      timeUnit: this.timeUnit,
      startTime: this.startTime,
      endTime: this.endTime,
      deduceNodelist: this.deduceNodelist.map((item: DeduceNodeType) => {
        return item.toObject();
      }),
    };
    return obj;
  }
  loadObject(deduceObj: any) {
    setTimeout(() => {
      if (deduceObj.speed) this.speed = deduceObj.speed;
      if (deduceObj.isLoop) this.isLoop = deduceObj.isLoop;
      if (deduceObj.timeUnit) this.timeUnit = deduceObj.timeUnit;
      if (deduceObj.startTime) this.startTime = deduceObj.startTime;
      if (deduceObj.endTime) this.endTime = deduceObj.endTime;
      this.getTimeAxisData();

      const deduceNodelist = deduceObj.deduceNodelist || [];
      if (deduceObj.hasOwnProperty('deduceNodelist')) {
        const qMap = getQMap();
        if (qMap) {
          const drawCollection = qMap.getDrawCollection();
          deduceNodelist.forEach((it: any = {}) => {
            const dtype = it.dtype;
            const id = it.id;
            const name = it.name;
            if (dtype == 'camera') {
              const camera = this.getDeduceNode('camera_entity');
              camera?.loadObject(it);
            } else if (dtype == 'draw') {
              const entity = drawCollection?.getEntity(id);
              if (entity) {
                const deduceEntity = new DeduceDrawEntity(entity);
                deduceEntity.loadObject(it);
                this.deduceNodelist.push(deduceEntity);
              }
            } else if (dtype == 'data') {
              const layerData = it.cloneDataLayer;
              const datalayer = new DeduceDataLayer(id, layerData);
              datalayer.loadObject(it);
              this.deduceNodelist.push(datalayer);
            } else if (dtype == 'page') {
              const qPagePosition = new DeduceQPage(it);
              qPagePosition.loadObject(it);
              this.deduceNodelist.push(qPagePosition);
            }
          });
        }
      } else {
        this.loadObject_old(deduceObj);
      }
    }, 100);
  }

  loadObject_old(deduceObj: any) {
    const qMap = getQMap();
    if (qMap) {
      const drawCollection = qMap.getDrawCollection();
      const startTime = this.startTime;
      const startTime_moment = moment(startTime);
      const unit_time = this.getTimeUnit_timeStamp();

      // 相机动画
      const deduceCamera = deduceObj.deduceCamera;
      const deduceEntitys = deduceObj.deduceEntitys || [];
      const deduceDataLayer = deduceObj.deduceDataLayer || [];
      const qPageCollection = deduceObj.qPageCollection || [];

      if (deduceCamera) {
        let checked = deduceCamera.checked;
        let effects = deduceCamera.effects;

        let _effects = effects.map((item: any) => {
          const s = item.startValue;
          const e = item.endValue;
          const _s = Number(
            startTime_moment
              .clone()
              .add(s * unit_time)
              .format('x'),
          );
          const _e = Number(
            startTime_moment
              .clone()
              .add(e * unit_time)
              .format('x'),
          );
          return {
            ...item,
            startTime: _s,
            endTime: _e,
          };
        });

        const camera = this.getDeduceNode('camera_entity');
        camera?.loadObject({
          checked: checked,
          effects: _effects,
        });
      }

      // 标会动画
      if (deduceEntitys.length > 0) {
        deduceEntitys.forEach((item: any) => {
          let checked = item.checked;
          let featureKey = item.featureKey;
          let effects = item.effects;

          let _effects = effects.map((eff: any) => {
            const s = eff.startValue;
            const e = eff.endValue;
            const _s = Number(
              startTime_moment
                .clone()
                .add(s * unit_time)
                .format('x'),
            );
            const _e = Number(
              startTime_moment
                .clone()
                .add(e * unit_time)
                .format('x'),
            );
            return {
              ...eff,
              startTime: _s,
              endTime: _e,
            };
          });

          const entity = drawCollection?.getEntity(featureKey);
          if (entity) {
            const deduceEntity = new DeduceDrawEntity(entity);
            deduceEntity.loadObject({
              checked: checked,
              effects: _effects,
            });
            this.deduceNodelist.push(deduceEntity);
          }
        });
      }

      // 图层动画
      if (deduceDataLayer.length > 0) {
        deduceDataLayer.forEach((item: any) => {
          const name = item.name;
          const layerData = item.cloneDataLayer;
          let checked = item.checked;
          let effects = item.effects;

          let _effects = effects.map((eff: any) => {
            const s = eff.startValue;
            const e = eff.endValue;
            const _s = Number(
              startTime_moment
                .clone()
                .add(s * unit_time)
                .format('x'),
            );
            const _e = Number(
              startTime_moment
                .clone()
                .add(e * unit_time)
                .format('x'),
            );
            return {
              ...eff,
              startTime: _s,
              endTime: _e,
            };
          });
          const datalayer = new DeduceDataLayer(name, layerData);
          datalayer.loadObject({
            checked: checked,
            effects: _effects,
          });
          this.deduceNodelist.push(datalayer);
        });
      }

      // 布局动画
      if (qPageCollection.length > 0) {
        qPageCollection.forEach((item: any) => {
          let checked = item.checked;
          let effects = item.effects;
          let id = item.id;
          let oldData = {};
          let _effects = effects.map((eff: any) => {
            oldData = eff.changeStyle.data;

            const s = eff.startValue;
            const e = eff.endValue;
            const _s = Number(
              startTime_moment
                .clone()
                .add(s * unit_time)
                .format('x'),
            );
            const _e = Number(
              startTime_moment
                .clone()
                .add(e * unit_time)
                .format('x'),
            );
            return {
              ...eff,
              startTime: _s,
              endTime: _e,
            };
          });

          let obj: any = {
            id: id,
            name: item.name || '',
            oldData: oldData,
          };

          const qPagePosition = new DeduceQPage(obj);
          qPagePosition.loadObject({
            checked: checked,
            effects: _effects,
          });
          this.deduceNodelist.push(qPagePosition);
        });
      }
    }
  }
}

export default DeduceCollection;
