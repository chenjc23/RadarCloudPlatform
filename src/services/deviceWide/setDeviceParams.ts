import axios from 'axios';

export async function setDeviceParams(params: any) {
  return axios
    .post('/device/setParams', params)
    .then((res) => {
      console.log('设置雷达参数：', res);
      return res;
    })
    .catch((e) => console.error(e));
}
