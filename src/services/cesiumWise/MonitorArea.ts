import axios from 'axios';
import { TgPointType } from '@/pages/DataAnalyse';

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

export async function getMonitorArea(params: any): Promise<TgPointType[]> {
  return axios
    .post('/monitor/getArea', params)
    .then((res: any) => {
      return res;
    })
    .catch((e) => console.error(e));
}
