import axios from 'axios';

export async function fetchSarImage(params: any): Promise<string> {
  return axios
    .post('/image/fetch', params)
    .then((res: any) => {
      //console.log('获取最新sar图像：', res);
      return res;
    })
    .catch((e) => console.error(e));
}
