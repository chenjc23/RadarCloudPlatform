import React from "react";
import { message } from "antd";
import {
  LoginForm,
  ProFormText,
} from "@ant-design/pro-components";
import { useModel, FormattedMessage, history } from "@umijs/max";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import Footer from '@/components/Footer';
import styles from "./index.less";

// 定义登陆参数类型
type LoginParams = {
  name: string,
  password: string
};

const Login: React.FC = () => {
  // 维护组件状态
  const { initialState, refresh, setInitialState } = useModel('@@initialState');

  const handleSubmit = async (values: LoginParams) => {
    await setInitialState((s) => ({
      ...s,
      currentUser: {name: "admin"},
    }));
    // await refresh();
    // 登陆成功跳转主页面
    message.success('登陆成功!');
    history.push('/');
  };


  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <LoginForm
          logo={<img alt="logo" src="/logo.svg" />}
          title="边坡稳定监测雷达"
          subTitle="空间信息感知技术团队设计"
          onFinish={async ( values ) => {
            await handleSubmit(values as LoginParams);
          }}
        >
          <ProFormText
            name="username"
            fieldProps={{
              size: 'large',
              prefix: <UserOutlined />
            }}
            placeholder="用户名：admin or user"
            rules={[
              {
                required: true,
                message: (
                  <FormattedMessage
                    id="pages.login.username.required"
                    defaultMessage="请输入用户名!"
                  />
                )
              }
            ]}
          />
          <ProFormText.Password
            name="password"
            fieldProps={{
              size: 'large',
              prefix: <LockOutlined />
            }}
            placeholder="密码"
            rules={[
              {
                required:true,
                message: (
                  <FormattedMessage
                    id="pages.login.password.required"
                    defaultMessage="请输入密码!"
                  />
                )
              }
            ]}
          />
        </LoginForm>
      </div>
      <Footer />
    </div>
  );
};

export default Login;
