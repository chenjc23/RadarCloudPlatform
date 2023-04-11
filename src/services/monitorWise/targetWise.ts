import axios from 'axios';

export async function addTgPoint(params: any) {
  return axios.post('/monitor/addTgPoint', params).catch((e) => console.log(e));
}

export async function getTgData(params: any) {
  return axios.post('/monitor/getTgPoint', params).catch((e) => console.log(e));
}
