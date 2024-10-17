import { history } from 'umi';
import axiosFn from '@/server/axios';
import groupSpace from '@/mobx/groupSpace'
const qConf = window.qConf;
export const datamg = qConf.dataUrl + '/datamg';
export const authUrl = qConf.dataUrl + '/auth';
export const coreUrl = qConf.dataUrl + '/core';
export const imgUrl = qConf.dataUrl + '/image';


const url = {
  register: authUrl + '/register', //注册
  login: authUrl + '/login/encryption', //登录
  logout: authUrl + '/logout', //退出 注销

  checkToken: authUrl + '/checkToken', //验证
  loginToken: authUrl + '/loginToken', //验证

  getUser: qConf.dataUrl + '/user/get',
  updateUser: qConf.dataUrl + '/user/updateUser',

  getExchageAppSites: authUrl + '/getExchageAppSites', //获取应用站点信息
};
//用户登录
export const loginAxios = (params: any) => {
  let form = axiosFn.paramsToFormData(params);
  return axiosFn.commonPost(url.login, form);
};

//退出登录
export const logoutAxios = () => {
  return axiosFn.commonPost(url.logout);
};

//注册
export const registerAxios = (params: any) => {
  return axiosFn.commonPost(url.register, params);
};

//请求用户信息
export const getUserAxios = (id: string) => {
  return axiosFn.commonGet(`${url.getUser}/${id}`);
};

//验证token
export const checkTokenAxios = () => {
  return axiosFn.commonGet(url.checkToken);
};

//验证token
export const loginTokenAxios = (params: any) => {
  return axiosFn.commonGet(url.loginToken, params);
};

//获取应用站点信息
export const getExchageAppSitesAxios = () => {
  return axiosFn.commonGet(url.getExchageAppSites);
};
export const getAppid = () => {
  const location: any = history.location;
  let appId = location.query?.appId || 0;
  return appId;
};
export const getCallUrl = () => {
  const location: any = history.location;
  let url = location.query?.url || '';
  return url;
};
export const goWebsite = (exchage?: any) => {
  if (exchage && exchage.clientToken) {
    let url = `${getCallUrl()}#/?token=${exchage.clientToken}`;
    window.location.href = url;
  } else {
    //跳转到用户中心
    const gid = groupSpace.getGroup();
    history.push(`/app/${gid}`);
  }
};

export const goSso = (exchage?: any) => {
  const location = history.location;
  if (location.pathname.indexOf('login') < 0) {
    history.push('/login');
  }
};
