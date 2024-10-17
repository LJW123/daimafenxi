import axios from 'axios';
import { getDataUrl } from '../../core';

class Metainfo {
  static async createMetaInfo(metainfoObj: any, posId: any) {
    const newMetaObj = {
      ...metainfoObj,
      template: { code: '0101' },
      pos: {
        id: posId,
      },
    };
    return new Promise((resolve, reject) => {
      const param = newMetaObj;
      const datamg = `${getDataUrl()}/datamg`;
      const token = window.qSpaceToken;
      axios
        .create({
          headers: {
            token: token,
          },
        })
        .post(`${datamg}/metainfo/create`, param)
        .then((res) => {
          let data = res.data;
          resolve(data);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  static async deleteMetaInfo(metainfoId: any) {
    return new Promise((resolve, reject) => {
      const datamg = `${getDataUrl()}/datamg`;
      const token = window.qSpaceToken;
      axios
        .create({
          headers: {
            token: token,
          },
        })
        .delete(`${datamg}/metainfo/delete/${metainfoId}`)
        .then((res) => {
          let data = res.data;
          resolve(data);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
}

export default Metainfo;
