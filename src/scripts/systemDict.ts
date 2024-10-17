
/**
 * 服务链输入输出对象转换辅助工具
 */
const array2Object = (arr: any[]) => {
  try {
    const obj: { [key: string]: any } = {};
    arr.forEach((item: any) => {
      if (13 === item.dType) {
        item.value = JSON.parse(item.value);
      }
      obj[item.key] =
        {
          value: item.value,
          name: item.key,
          title: item.key,
          type: {
            otid: 3520,
            name: '参数',
          },
          dType: item.dType || 4,
          props: item.props ? { featureAttrName: item.props } : null,
        } || null;
    });
    return obj;
  } catch (error) {
    return null;
  }
};
const object2Array = (obj: any) => {
  try {
    const keys = Object.keys(obj);
    const arr = keys.map((key: string) => {
      const value = obj[key];
      return { key, value: value.value, dType: value.dType };
    });
    return arr;
  } catch (error) {
    return null;
  }
};

// 功能节点input处理
const getFunctionInput = (obj: any) => {
  try {
    let res: any = {};
    const keys = Object.keys(obj);
    keys.forEach((key: any) => {
      if (obj[key]?.value?.name) {
        res[key] = obj[key]?.value?.name;
      } else {
        res[key] = obj[key]?.value;
      }
    });
    return res;
  } catch (error) {
    return null;
  }
};

/**
 * 任务状态字典
 */
const taskStatusName = [
  { key: 1, cname: '未发布', name: 'ready', color: '#FF5353' },
  { key: 2, cname: '未开始', name: 'paused', color: '#e44600' },
  { key: 3, cname: '处理中', name: 'running', color: '#1690FF' },
  { key: 4, cname: '暂停', name: 'paused', color: '#404963' },
  { key: 5, cname: '取消', name: 'cancel', color: '#959AA8 ' },
  { key: 6, cname: '已完成', name: 'success', color: '#32C65E' },
];
/**
 * 查询任务状态
 * @param key 状态值
 * @returns
 */
const queryStatusByKey = (key: number) => {
  return taskStatusName.find((r) => r.key === key);
};

/**
 * 分页查询初始化参数
 */
const initFilter = {
  pageNum: 1,
  pageSize: 20,
  sort: {
    sortBy: 'utime',
    asc: false,
  },
};
const DTYPE_DICT: any = {
  number: 4,
  boolean: 8,
  string: 9,
  object: 13,
};
export {
  array2Object,
  object2Array,
  queryStatusByKey,
  initFilter,
  DTYPE_DICT,
  getFunctionInput,
  taskStatusName,
};
