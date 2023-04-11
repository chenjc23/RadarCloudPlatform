const db = require('../../app').db;
const radarSocket = require('../../RadarServer/index');
const fs = require('fs');
const {
  externConfig: { rawDataPrefix, sarImagePrefix },
} = require('../../config/config');

const async = require('async');
const subApertureImaging = require('../../extern/subApertureImaging');

const long32_2_uint8 = (num) => {
  const num1 = Math.round(num);
  const HH = Math.floor(num1 / 2 ** 24);
  const HL = Math.floor((num1 - HH * 2 ** 24) / 2 ** 16);
  const LH = Math.floor((num1 - HH * 2 ** 24 - HL * 2 ** 16) / 2 ** 8);
  const LL = Math.floor(num1 - HH * 2 ** 24 - HL * 2 ** 16 - LH * 2 ** 8);
  return new Uint8Array([HH, HL, LH, LL]);
};

module.exports = async (content, req, res) => {
  let { startFreq, stopFreq, pulseWidth, prf, channelGain, sampleFreq, sampleTime } = content;
  startFreq = Number(startFreq);
  stopFreq = Number(stopFreq);
  pulseWidth = Number(pulseWidth);
  prf = Number(prf);
  channelGain = Number(channelGain);
  sampleFreq = Number(sampleFreq);
  sampleTime = Number(sampleTime);

  /* ----------------------- 雷达参数解析 ------------------------ */
  const [pw_HH, pw_HL, pw_LH, pw_LL] = long32_2_uint8(pulseWidth * 1000);
  // prf高低八位表示
  const prf_H = Math.floor(prf / 256);
  const prf_L = prf - 256 * prf_H;
  // 开始频率KHz表示
  const [startFreq_HH, startFreq_HL, startFreq_LH, startFreq_LL] = long32_2_uint8(startFreq * 1000);
  // 结束频率KHz表示
  const [stopFreq_HH, stopFreq_HL, stopFreq_LH, stopFreq_LL] = long32_2_uint8(stopFreq * 1000);

  // 设置参数指令buffer
  const paramsBuf = [
    1, // 设置参数标志位
    sampleFreq,
    pw_LH,
    pw_LL, // 脉冲宽度
    prf_H,
    prf_L, // PRF
    startFreq_HH,
    startFreq_HL,
    startFreq_LH,
    startFreq_LL, // 开始频率
    stopFreq_HH,
    stopFreq_HL,
    stopFreq_LH,
    stopFreq_LL, // 结束频率
    channelGain, // 通道增益
  ];

  /* ----------------------- 回波数据文件头解析并存储 ------------------------ */
  const Nr = Math.round((pulseWidth / 10 ** 3) * sampleFreq * 10 ** 6); // 距离线上的采样点数
  const Na = Math.round(sampleTime * prf); // 方位采样总点数
  const va = 0.1; // 方位速度（占位？）
  const lamda = (3 * 10 ** 8) / ((startFreq * 10 ** 6) / 2 + (stopFreq * 10 ** 6) / 2);
  const bytes_per_second = Math.floor(prf * Nr * 2); // 每秒需要接收的字节数
  const whole_bytes = Math.floor(sampleTime) * bytes_per_second;

  // 将10个文件头变量并写入buffer
  const var_all_bytes = 7 * 64 + 2 * 32 + 64; // 576 bytes
  const headBuf = Buffer.alloc(var_all_bytes);
  let offset = 0;
  offset = headBuf.writeDoubleLE(startFreq, offset);
  offset = headBuf.writeDoubleLE(stopFreq, offset);
  offset = headBuf.writeDoubleLE(pulseWidth, offset);
  offset = headBuf.writeDoubleLE(prf, offset);
  offset = headBuf.writeDoubleLE(channelGain, offset);
  offset = headBuf.writeDoubleLE(sampleFreq, offset);
  offset = headBuf.writeDoubleLE(va, offset);
  offset = headBuf.writeInt32LE(Nr, offset);
  offset = headBuf.writeInt32LE(Na, offset);
  offset = headBuf.writeDoubleLE(lamda, offset);

  /* ----------------------- 采集JOB ------------------------ */
  const railParams = [0, 0, 0, 0, 0]; // 静止轨道参数
  const orderBuf = [2, ...railParams, sampleTime];

  // 根据时间戳构建新文件名
  const nowId = Date.now(); // 以时间戳作为文件ID
  const fileName = rawDataPrefix + nowId + '_rawData.dat';
  // 创建文件输出流并存入头文件
  const binOutputFlow = fs.createWriteStream(fileName, { flags: 'a' });
  // 同步写文件头
  await new Promise((resolve) => {
    binOutputFlow.write(headBuf, () => resolve());
  });

  // 定义回波数据处理回调函数 （每秒回波求平均去直流）
  const dataProcess = async (callback) => {
    for (let i = 0; i < Math.floor(sampleTime); i++) {
      let result = [];
      let meanVal = 0;
      for (let j = 0; j < bytes_per_second; j += 2) {
        let val =
          radarSocket.dataBuf[i * bytes_per_second + j] +
          256 * radarSocket.dataBuf[i * bytes_per_second + j + 1];
        result.push(val);
        meanVal += val;
      }
      meanVal = meanVal / result.length;
      result = result.map((val) => val - meanVal);
      binOutputFlow.write(Buffer.from(new Int16Array(result).buffer), () => {
        if (i === Math.floor(sampleTime) - 1) console.log('===原始数据预处理完成（滤除直流）');
        callback(null);
      });
    }
  };

  // 串联异步任务（连接--参数设置--采集命令）
  async.waterfall([
    function (callback) {
      radarSocket.connectRadar(callback);
    },
    function (callback) {
      radarSocket.setWorkParams(new Uint8Array(paramsBuf), callback);
    },
    function (callback) {
      radarSocket.orderSingleScanning(new Uint8Array(orderBuf), whole_bytes, callback);
    },
    dataProcess,
  ]);

  const subApertureImaging = require('../../extern/subApertureImaging');
  const imgName = nowId + '_raw.png';
  await subApertureImaging(fileName, sarImagePrefix + imgName);
  console.log('===原始数据成像处理完成！');
  await addDataRecord(imgName, nowId);
  console.log(`===数据库新增图片记录：${imgName}`);
};
