export interface EventFrame {
  name: string;
  func: Function;
  time?: number; //毫秒 刷新时间
  lastTime?: number; //记录每次动画执行结束的时间
}

// 定时器id
let rafId: number = 0;

let eventslist: any = {};

export const renderFunction = (timestamp?: number) => {
  //记录当前时间
  const nowTime = Date.now();
  // 当前时间-上次执行时间如果大于diffTime，那么执行动画，并更新上次执行时间
  // diffTime 可以理解为控制刷新帧率  每多少毫秒刷新一次  60fps  是16
  for (const key in eventslist) {
    const eventFrame = eventslist[key];
    let lastTime = eventFrame.lastTime;
    let time = eventFrame.time;
    if (nowTime - lastTime > time) {
      eventFrame.lastTime = nowTime;
      eventFrame.func(timestamp);
    }
  }
  rafId = requestAnimationFrame(renderFunction);
};

export const addEventFrame = (obj: EventFrame) => {
  if (eventslist[obj.name]) {
    delete eventslist[obj.name];
  }
  eventslist[obj.name] = {
    name: obj.name,
    func: obj.func,
    time: obj.time || 16,
    lastTime: Date.now(),
  };
};

export const clearEventFrame = (name: string) => {
  if (eventslist[name]) {
    delete eventslist[name];
  }
};

export const emptyEventFrame = () => {
  for (const key in eventslist) {
    delete eventslist[key];
  }
};

export const getEventFrame = (name: string) => {
  if (eventslist[name]) {
    return eventslist[name];
  }
  return null;
};
