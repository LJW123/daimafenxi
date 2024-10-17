// 关系
import axios from 'axios';
import { getDataUrl } from '../../core';
// import Project from './project';

class Relation {
  constructor() {}

  // 创建关系
  static async createRelation(
    srcObjId: string,
    targetObjIds: string[],
    relationType: string,
  ) {
    return new Promise((resolve, reject) => {
      const datamg = `${getDataUrl()}/datamg`;
      const token = window.qSpaceToken;
      let ajaxlist = [];

      for (let i = 0; i < targetObjIds.length; i++) {
        let params = {
          srcObj: {
            id: srcObjId,
            type: { otid: 4099, name: '工程' },
          },
          targetObj: {
            id: targetObjIds[i],
            type: { otid: 3041, name: '场景' },
          },
          relationType,
        };

        let ajax = axios
          .create({
            headers: {
              token: token,
            },
          })
          .post(`${datamg}/relation/create`, params);
        ajaxlist.push(ajax);
      }

      axios.all(ajaxlist).then((reslist: any[]) => {
        let isSuccess = true;
        for (let i = 0; i < reslist.length; i++) {
          let res = reslist[i];
          if (res.data.status !== 200) {
            isSuccess = false;
          }
        }
        if (isSuccess) {
          resolve(reslist);
        } else {
          reject(reslist);
        }
      });
    });
  }

  // 查询关系
  static async queryRelation(srcObjId: any, relationType: string) {
    return new Promise((resolve, reject) => {
      const datamg = `${getDataUrl()}/datamg`;
      const token = window.qSpaceToken;
      let params = {
        srcObj: {
          id: srcObjId,
          type: { otid: 4099, name: '工程' },
        },
        relationType,
      };
      axios
        .create({
          headers: {
            token: token,
          },
        })
        .post(`${datamg}/relation/query`, params)
        .then((res) => {
          if (res.status == 200) {
            const data = res.data.data;
            resolve(data);
          } else {
            reject({ message: '查询失败' });
          }
        })
        .catch((err) => {
          reject();
          console.error(err);
        });
    });
  }

  // 删除关系
  static async deleteRelation(relationId: string) {
    return new Promise((resolve, reject) => {
      const datamg = `${getDataUrl()}/datamg`;
      const token = window.qSpaceToken;
      axios
        .create({
          headers: {
            token: token,
          },
        })
        .delete(`${datamg}/relation/delete/${relationId}`)
        .then((res) => {
          if (res.status == 200) {
            resolve(true);
          }
        })
        .catch((err) => {
          reject(false);
          console.error(err);
        });
    });
  }

  // 删除关系
  static async deleteBySrcRelation(srcId: string) {
    return new Promise((resolve, reject) => {
      const datamg = `${getDataUrl()}/datamg`;
      const token = window.qSpaceToken;

      let param = {
        oid: srcId,
        otid: 4099,
      };

      axios
        .create({
          headers: {
            token: token,
          },
        })
        .delete(`${datamg}/relation/deleteBySrc`, { params: param })
        .then((res) => {
          if (res.status == 200) {
            resolve(true);
          }
        })
        .catch((err) => {
          reject(false);
          console.error(err);
        });
    });
  }
}

export default Relation;
