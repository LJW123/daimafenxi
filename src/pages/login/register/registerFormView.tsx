import React, { useState, useEffect, useRef, useCallback } from 'react';
import { history } from 'umi';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Form, Input, Button, message } from 'antd';
import { dataUrl } from '@/common';
import axiosFn from '@/server/axios';
import groupSpace from '@/mobx/groupSpace'
import styles from './styles.less';

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 6 },
  },
  wrapperCol: {
    xs: { span: 8 },
    sm: { span: 24 },
  },
};
const RegisterFormView = (props: any) => {
  const { w, h } = props;
  let dtop = h / 6;
  let dright = w % 580;

  useEffect(() => { }, []);
  const onRegister = (obj: any) => {
    const gid = groupSpace.getGroup() || 0
    // 注册用户并邀请进组
    let url = `${dataUrl}/user/registerMem/${gid}`;
    let parmas = { ...obj };

    axiosFn.commonPost(url, parmas).then((res: any) => {
      if (res.data.status === 200) {
        message.success('注册成功！');
        goLogin();
      } else {
        message.error(res.data.message);
      }
    });
  };
  const onFinish = (value: any) => {
    onRegister(value);
  };
  const goLogin = () => {
    history.push('/login');
  };
  return (
    <div className={styles.register_con} style={{ top: dtop, right: dright }}>
      <div className={styles.register_wrapper}>
        <div className={styles.title}>
          <div>注册</div>
        </div>
        <Form
          className={styles.register_form}
          {...formItemLayout}
          labelAlign="left"
          onFinish={onFinish}
        >
          <Form.Item
            name="userName"
            label="用户名:"
            rules={[
              {
                required: true,
                message: '请输入你的用户名!',
              },
            ]}
          >
            <Input
              prefix={<UserOutlined className="site-form-item-icon" />}
              placeholder="请输入您的用户名。"
            />
          </Form.Item>
          <Form.Item name="alias" label="用户昵称:">
            <Input
              prefix={<UserOutlined className="site-form-item-icon" />}
              placeholder="请输入您的用户昵称。"
            />
          </Form.Item>
          <Form.Item
            name="password"
            label="密码:"
            rules={[
              {
                whitespace: true,
                required: true,
                message: '请输入您的密码!',
              },
            ]}
          >
            <Input
              prefix={<LockOutlined className="site-form-item-icon" />}
              type="password"
              placeholder="请输入您的密码。"
            />
          </Form.Item>
          <Form.Item
            name="rePassword"
            label="确认密码:"
            dependencies={['password']}
            hasFeedback
            rules={[
              {
                whitespace: true,
                required: true,
                message: '请确认你的密码!',
              },
              ({ getFieldValue }: any) => ({
                validator(rule: any, value: any) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject('两次密码不一致!');
                },
              }),
            ]}
          >
            <Input
              prefix={<LockOutlined className="site-form-item-icon" />}
              type="password"
              placeholder="确认密码"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" className={styles.btn}>
              注册
            </Button>
          </Form.Item>
          <Form.Item>
            <Button type="primary" className={styles.btn} onClick={goLogin}>
              已有账号，前去登录
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};
export default RegisterFormView;
