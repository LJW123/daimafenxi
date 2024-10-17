import axios from 'axios';
import { datamg, groupId } from '@/common';
import { makeAutoObservable } from 'mobx';
import userSpace from './userSpace';
import AdapterSpace from './adapter';

class GroupSpace {
  groupData: any;
  constructor() {
    makeAutoObservable(this)
  }

  setGroupData(data: any) {
    this.groupData = data;
  }

  // 查询组信息
  queryGroupById(gid: string = '0') {
    const url = `${datamg}/datagroup/query`;
    const param: any = {
      bMine: false,
      id: gid,
    };
    const token = userSpace.getToken();
    axios.create({
      headers: {
        token: token,
      },
    }).post(url, param).then((res: any) => {
      if (res.data.status == 200) {
        let data = res.data.data;
        let items = data.items;
        let group = items[0];
        if (group) {
          this.setGroup(group.id);
          this.setGroupData(group)
        }
      } else {
        AdapterSpace.getInstance().messageOpen('error', res.data.message)
      }
    })
  };

  // 处理组
  getGroupFun(urlGroupId?: any) {
    // 1.判断 地址栏 中是否有组id
    // 2.判断 qConf 中是否有组id
    // 3.判断 localStorage 中是否有组id
    // 4.如果都没有，从组列表中取第一个组
    const gpid_1 = urlGroupId || null;
    const gpid_2 = groupId || null;
    const gpid_3 = this.getGroup() || null;

    let _gid: any = '0';
    if (gpid_1) {
      _gid = gpid_1;
    } else if (gpid_2) {
      _gid = gpid_2;
    } else if (gpid_3) {
      _gid = gpid_3;
    }
    this.queryGroupById(_gid);
  };


  // 获取组数据
  getGroup() {
    if (userSpace.userData) {
      return localStorage.getItem(`${userSpace.userData.id}-dataGroup`);
    } else {
      return null
    }
  }

  // 改变组数据
  setGroup(groupId: string) {
    if (userSpace.userData) {
      localStorage.setItem(`${userSpace.userData.id}-dataGroup`, groupId);
    }
  }

  // 删除组id
  removeGroup() {
    if (userSpace.userData) {
      localStorage.removeItem(`${userSpace.userData.id}-dataGroup`);
    }
  }

}

let groupSpace = new GroupSpace();

export default groupSpace
