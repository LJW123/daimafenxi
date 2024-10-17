import userSpace from '@/mobx/userSpace';
import axios from 'axios';
const axiosFn = {
  commonPost(url: any, params?: any, PosOid?: any) {
    return new Promise((resolve, reject) => {
      this.createTokenAxios(PosOid)
        .post(url, params)
        .then((res) => {
          resolve(res);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },
  commonGet(url: any, params?: any, PosOid?: any) {
    return new Promise((resolve, reject) => {
      this.createTokenAxios(PosOid)
        .get(url, { params: params })
        .then((res) => {
          resolve(res);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },
  commonGetId(url: any, params?: any, PosOid?: any) {
    return new Promise((resolve, reject) => {
      this.createTokenAxios(PosOid)
        .get(`${url}/${params}`)
        .then((res) => {
          resolve(res);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },
  commonDelete(url: any, params?: any, PosOid?: any) {
    return new Promise((resolve, reject) => {
      this.createTokenAxios(PosOid)
        .delete(`${url}/${params}`)
        .then((res) => {
          resolve(res);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },
  /**
   * 将键值对象转换为FormData对象。
   * @param {*} params 键值对象
   */
  paramsToFormData(params: any) {
    let newFormData = new FormData();
    for (let name in params) {
      newFormData.append(name, params[name]);
    }
    return newFormData;
  },
  /**
   * 创建ajax请求对象
   */
  createAxios(token: any, PosOid?: any) {
    const timeout = 60 * 1000 * 5;
    if (token) {
      if (PosOid) {
        return axios.create({
          headers: {
            token: token,
            'GxUser-PosOid': PosOid,
            'GxUser-PosOtype': '2',
          },
          timeout: timeout,
        });
      } else {
        return axios.create({
          headers: {
            token: token,
          },
          timeout: timeout,
        });
      }
    } else {
      return axios.create({
        timeout: timeout,
      });
    }
  },

  createTokenAxios(PosOid?: any) {
    return this.createAxios(userSpace.getToken(), PosOid);
  },



};

export default axiosFn;
