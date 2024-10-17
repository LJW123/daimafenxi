import axios from 'axios';
import { DrawCore, getDataUrl } from '../../core';

class STObject {
  constructor() {}

  static async querySTObject(params: any) {
    return new Promise((resolve, reject) => {
      const datamg = `${getDataUrl()}/datamg`;
      const token = window.qSpaceToken;
      axios
        .create({
          headers: {
            token: token,
          },
        })
        .post(`${datamg}/stobject/query`, params)
        .then((res) => {
          let items: any[] = res.data?.data.items || [];
          let newItems: any[] = [];
          for (let i = 0; i < items.length; i++) {
            let it = items[i];
            if (it.geom) {
              let geom = JSON.parse(it.geom);
              it.geometry = geom;
              newItems.push(it);
            }
          }
          resolve(newItems);
        })
        .catch((err) => {
          reject([]);
          console.error(err);
        });
    });
  }
  static async insertOrUpdate(tId: string, stobjectList: any) {
    let result: any = await STObject.destroyAllStobject(tId);
    if (result.status === 200) {
      //保存对象
      result = await STObject.saveStobject(stobjectList, tId);
      return true;
    }
  }
  static destroyAllStobject(tId: string) {
    return new Promise((resolve, reject) => {
      const datamg = `${getDataUrl()}/datamg`;
      const token = window.qSpaceToken;
      axios
        .create({
          headers: {
            token: token,
          },
        })
        .delete(`${datamg}/stobject/destroyAll/${tId}`)
        .then((res: any) => {
          resolve(res);
        })
        .catch((err: any) => {
          reject(err);
          //message.error('请求失败');
        });
    });
  }
  static saveStobject(stobjectList: any, tId: any) {
    return new Promise((resolve, reject) => {
      const param = [...stobjectList];
      const datamg = `${getDataUrl()}/datamg`;
      const token = window.qSpaceToken;
      axios
        .create({
          headers: {
            token: token,
          },
        })
        .post(`${datamg}/stobject/save?metaId=${tId}`, param)
        .then((res: { data: any }) => {
          let data = res.data;
          resolve(data);
        })
        .catch((err: any) => {
          reject(err);
        });
    });
  }
  static toStObjectList(drawEntitys: DrawCore[]) {
    let stobjectList: any = [];
    for (let i = 0; i < drawEntitys.length; i++) {
      let d: DrawCore = drawEntitys[i];

      // let geojson: any = d.qGeometry.toGeojson(d.featureKey);
      let geojson: any = d.qGeometry.getGeojson();
      let newStyle: any = d.qStyles.toObjectData();
      let attribute: any = d.getQAttributeToObjectData();

      let stobject = {
        operation: 1,
        obj: {
          name: attribute.name,
          from: '',
          attributes: {
            ...attribute,
          },
          geom: JSON.stringify(geojson?.geometry),
          style: JSON.stringify(newStyle),
        },
      };
      stobjectList.push(stobject);
    }
    return stobjectList;
  }
}

export default STObject;
