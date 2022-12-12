import axios from 'axios';

export async function getDefoData() {
  return axios.post('/demo/test').catch((e: any) => {
    console.error('Get defo data failed:\n', e);
    return false;
  });
}
