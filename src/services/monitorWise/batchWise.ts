import axios from 'axios';

export async function addBatch(params: any) {
  return axios.post('/monitor/addBatch', params).catch((e) => console.log(e));
}

export async function getBatch(params: any): Promise<any> {
  return axios.post('/monitor/getBatch', params).catch((e) => console.log(e));
}
