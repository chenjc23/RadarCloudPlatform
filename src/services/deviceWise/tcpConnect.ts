import axios from 'axios';
import { message } from 'antd';

export async function tcpConnect(params: any) {
  return axios
    .post('/device/tcpConnect', params)
    .then((res) => {
      console.log('connectResult:', res);
      return res;
    })
    .catch((err) => {
      message.error(err.toString());
      return false;
    });
}
