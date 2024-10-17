import { Form, Input, Button } from 'antd';
import { history } from 'umi';

import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { message } from 'antd';

import {
  loginAxios,
  loginTokenAxios,
  goWebsite,
  getAppid,
} from './server/index';
import util from '@/scripts/util';
import userSpace from '@/mobx/userSpace'
import styles from './styles.less';
import AdapterSpace from '@/mobx/adapter';

const LoginFormView = (props: any) => {
  const { w, h } = props;
  let dtop = h / 5;
  let dright = w % 580;

  const onLogin = (obj: any) => {
    obj['password'] = util.encryptAES(obj['password'], '0123456789ABCDEF');
    loginAxios(obj).then((res: any) => {
      if (res.data.status === 200) {
        let userToken = res.data.data.userToken;
        message.success('登录成功！');
        userSpace.setToken(userToken);
        loginToken();
      } else {
        message.error(res.data.message);
      }
    });
  };
  const loginToken = () => {
    let id = getAppid();
    let params = {
      appId: id,
    };
    loginTokenAxios(params).then((res: any) => {
      if (res.data.status === 200) {
        // goWebsite();
        const localUrl = new URL(window.location.href);
        const pathname = localUrl.pathname;
        if (pathname.indexOf('mobile') > -1) {
          AdapterSpace.getInstance().historyFun().push('/mobile/index')
        } else {
          AdapterSpace.getInstance().historyFun().push('/index')
        }
      } else {
        message.error(res.data.message);
        userSpace.removeToken();
      }
    });
  };

  const onFinish = (value: any) => {
    onLogin(value);
  };

  const goRegister = () => {
    history.push('/register');
  };
  return (
    <div className={styles.login_con} style={{ top: dtop, left: dright }}>
      <div className={styles.login_wrapper}>
        <div className={styles.title}>
          <div>登录</div>
        </div>
        <Form
          layout="horizontal"
          onFinish={onFinish}
          className={styles.login_form}
        >
          <Form.Item
            name="userName"
            rules={[{ required: true, message: '请输入用户名!' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="用户名" allowClear />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码!' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              type="password"
              placeholder="密码"
            />
          </Form.Item>
          <div className={styles.reg_wrapper}>
            {/* <a onClick={goRegister}>注册</a> */}
          </div>
          <Form.Item style={{ border: 'none' }}>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              className={styles.btn}
            >
              登录
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};
export default LoginFormView;
