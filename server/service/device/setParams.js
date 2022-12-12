const radarSocket = require('../../RadarServer/index');

const long32_2_uint8 = (num) => {
  const num1 = Math.round(num);
  const HH = Math.floor(num1 / 2 ** 24);
  const HL = Math.floor((num1 - HH * 2 ** 24) / 2 ** 16);
  const LH = Math.floor((num1 - HH * 2 ** 24 - HL * 2 ** 16) / 2 ** 8);
  const LL = Math.floor(num1 - HH * 2 ** 24 - HL * 2 ** 16 - LH * 2 ** 8);
  return new Uint8Array([HH, HL, LH, LL]);
};

module.exports = async (content, req, res) => {
  if (!radarSocket.isOpen()) return false;
  const {
    startFreq, // MHz
    stopFreq, // MHz
    channelGain,
    pulseWidth, // ms
    prf,
    sampleFreq, // MHz
    channelDelay,
  } = content;
  // 数据进一步处理，包括字符串转数字以及高低八位处理
  // 脉冲宽度以us表示
  const [pw_HH, pw_HL, pw_LH, pw_LL] = long32_2_uint8(Number(pulseWidth) * 1000);
  // prf高低八位表示
  const prf_H = Math.floor(Number(prf) / 256);
  const prf_L = Number(prf) - 256 * prf_H;
  // 开始频率KHz表示
  const [startFreq_HH, startFreq_HL, startFreq_LH, startFreq_LL] = long32_2_uint8(
    Number(startFreq) * 1000,
  );
  // 结束频率KHz表示
  const [stopFreq_HH, stopFreq_HL, stopFreq_LH, stopFreq_LL] = long32_2_uint8(
    Number(stopFreq) * 1000,
  );

  // 设置参数指令buffer
  const buf = [
    1, // 设置参数标志位
    Number(sampleFreq),
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
    Number(channelGain), // 通道增益
  ];

  await radarSocket.setWorkParams(new Uint8Array(buf));
  return true;
};
