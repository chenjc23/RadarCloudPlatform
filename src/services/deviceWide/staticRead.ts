import axios from 'axios';
import { message } from 'antd';

type GeneralResult = boolean | { message: string };

export type JsonDataType = { x: string; val: number };

type ReadBinaryResult = false | { data: JsonDataType[] };

export async function staticRead(params: any): Promise<GeneralResult> {
  return axios
    .post('/device/staticRead', params)
    .then((res: any) => {
      console.log('静止采集命令传输结果:', res);
      return res;
    })
    .catch((err) => {
      message.error(err.toString());
      return false;
    });
}

export async function readBinaryPerSecond(params: any): Promise<ReadBinaryResult> {
  return axios.post('/device/readBinaryPerSecond', params).catch((err) => {
    message.error(err.toString());
    return false;
  });
}
