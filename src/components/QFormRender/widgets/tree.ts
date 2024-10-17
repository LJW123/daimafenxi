export default class ToTree {
  defaultConfig: any;
  config: any;
  constructor(config = {}) {
    this.defaultConfig = {
      id: 'id',
      children: 'children',
      pid: 'pid',
    };
    this.config = Object.assign(this.defaultConfig, config);
  }

  // list=>tree 列表转换成为树
  listToTree(list: any[]) {
    let info = list.reduce((map, node) => {
      if (!map[node[this.config.id]]) {
        map[node[this.config.id]] = node;
        node.children = [];
      }
      return map;
    }, {});
    return list.filter((v) => {
      if (info[v[this.config.pId]]) {
        info[v[this.config.pId]].children.push(v);
      }
      return !v[this.config.pId];
    });
  }
}
