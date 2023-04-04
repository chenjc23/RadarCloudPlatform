import axios from 'axios';

export async function addMonitorArea(params: any) {
  return true;
  return axios
    .post('/monitor/addArea', params)
    .then((res) => {
      console.log('保存监测点：', res);
      return res;
    })
    .catch((e) => console.error(e));
}
