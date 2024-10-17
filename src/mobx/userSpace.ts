import axios from 'axios';
import { dataUrl, authUrl, coreUrl, ssoLoginUrl, appId } from '@/common';
import { sso, systemName } from '@/config';
import { parse } from 'query-string';
import { makeAutoObservable } from 'mobx';
import AdapterSpace from './adapter';

class UserSpace {
  url = {
    register: authUrl + '/register', //注册
    login: authUrl + '/login', //登录
    logout: coreUrl + '/user/logout', //退出 注销
    checkToken: authUrl + '/checkToken', //验证
    loginToken: coreUrl + '/user/loginToken', //验证
    getUser: dataUrl + '/user/get',
    updateUser: dataUrl + '/user/updateUser',
  };

  userData: any;

  constructor() {
    makeAutoObservable(this)
  }

  setUserData(data: any) {
    this.userData = data;
  }

  verifyToken() {
    const { location } = window;
    const index = location.hash.indexOf('?');
    const searchParams = location.hash.slice(index + 1);
    const parsedHash = parse(searchParams);
    const urlToken: any = parsedHash?.token;
    const token = this.getToken();


    if (urlToken) {
      this.loginToken(urlToken)
    } else if (token) {
      this.checkToken()
    } else {
      this.removeToken();
      this.goToLogin()
    }
  }

  loginToken(token: string) {
    const url = this.url.loginToken;
    axios.create({
      headers: {
        token: token,
      }
    }).get(url)
      .then((res: any) => {
        if (res?.data.status === 200) {
          this.setToken(token);
          const localUrl = new URL(window.location.href);
          const pathname = localUrl.pathname;
          if (pathname.indexOf('mobile') > -1) {
            AdapterSpace.getInstance().historyFun().push('/mobile/index')
          } else {
            AdapterSpace.getInstance().historyFun().push('/index')
          }
          AdapterSpace.getInstance().historyFun().go(0)
        } else {
          this.removeToken();
          this.goToLogin()
        }
      })
  }
  //验证token
  checkToken() {
    const token = this.getToken();
    const url = this.url.checkToken;
    axios.create({
      headers: {
        token: token,
      }
    }).get(url)
      .then((res: any) => {
        if (res?.data.status === 200) {
          let data = res.data.data;
          let id = data.id || data.userId;
          window.qSpaceToken = token;
          this.currentUser(id)
        } else {
          this.removeToken();
          this.goToLogin()
        }
      })
  };
  // 获取当前的用户
  currentUser(id: number) {
    const url = `${this.url.getUser}/${id}`;
    const token = this.getToken();
    axios.create({
      headers: {
        token: token,
      },
    }).get(url)
      .then((res) => {
        if (res?.data.status == 200) {
          let data = res.data.data;
          this.setUserData(data);
          AdapterSpace.getInstance().historyFun().push('/index')
        } else {
          AdapterSpace.getInstance().messageOpen('error', res.data.message)
          this.removeToken();
          this.goToLogin()
        }
      })
      .catch((error) => {
        this.removeToken();
        this.goToLogin()
      });
  };

  //登录
  queryLogin(obj: any) {
    let form = this.paramsToFormData(obj);
    const res: any = axios.create().post(this.url.login, form);
    if (res.data.status === 200) {
      AdapterSpace.getInstance().messageOpen('success', '登录成功！')
      this.setToken(res.data.data.userToken);
    } else {
      AdapterSpace.getInstance().messageOpen('error', res.data.message)
    }
  };

  // 将键值对象转换为FormData对象。
  paramsToFormData(params: any) {
    let newFormData = new FormData();
    for (let name in params) {
      newFormData.append(name, params[name]);
    }
    return newFormData;
  };


  goToLogin() {
    if (sso) {
      this.goSso()
    } else {
      this.goLogin()
    }
  }

  // 跳转单点
  goSso() {
    const localUrl = new URL(window.location.href);
    let href = `${ssoLoginUrl}?appId=${appId}&url=${localUrl.origin + localUrl.pathname}#/`;
    window.location.href = href;
  };

  // 跳转登录页
  goLogin() {
    const localUrl = new URL(window.location.href);
    const pathname = localUrl.pathname;
    if (pathname.indexOf('mobile') > -1) {
      AdapterSpace.getInstance().historyFun().push('/mobile/login')
    } else {
      AdapterSpace.getInstance().historyFun().push('/login')
    }
  };

  // 获取token
  getToken() {
    return localStorage.getItem(`${systemName}-token`) || '';
  };

  // 设置token
  setToken(val: any) {
    return localStorage.setItem(`${systemName}-token`, val);
  };

  // 删除token
  removeToken() {
    return localStorage.removeItem(`${systemName}-token`);
  };
}



let userSpace = new UserSpace();

export default userSpace

