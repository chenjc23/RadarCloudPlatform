// 全局Axios配置 需在app.tsx中加载一次

import axios from 'axios';

// 根据环境设定请求后端url地址
axios.defaults.baseURL =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000/api'
    : 'http://localhost:3000/api'; // 此处设置生产环境的后端url地址

axios.defaults.withCredentials = true; // 跨域认证需求

// 添加全局请求拦截器
// axios.interceptors.request.use(
//   function (config) {
//     // 在发送请求之前的操作
//     return config;
//   },
//   function (error) {
//     // 对请求错误的操作
//     return Promise.reject(error);
//   },
// );

// 添加全局响应拦截器
axios.interceptors.response.use(
  function (response) {
    const serverResponse = response.data; // 透传后端返回数据
    console.log('serverResponse', serverResponse);
    return serverResponse;
  },
  // function (error) {
  //   // 对响应错误的操作
  //   return Promise.reject(error);
  // },
);
