const radarSocket = require('../../RadarServer/index');

module.exports = async (content, req) => {
  // 雷达是否已连接
  if (!radarSocket.isOpen()) return false;
  // 检查是否已无缓存
  if (radarSocket.getByteLength() === 0) {
    const info = '雷达dataBuf已无缓存数据';
    console.log('===' + info);
    // return {message: info};
    return false;
  }

  let { pulseWidth, sampleFreq, prf, offset } = content;
  offset = Number(offset); // 偏移的距离线个数
  pulseWidth = Number(pulseWidth) / 10 ** 3;
  sampleFreq = Number(sampleFreq) * 10 ** 6;
  prf = Number(prf);
  const Nr = Math.round(pulseWidth * sampleFreq); // 距离线上的采样点数
  const bytes_per_second = Math.floor(prf * Nr * 2); // 每秒需要接收的字节数

  const startByte = offset * bytes_per_second;
  const bytesBehind = radarSocket.getByteLength() - startByte;

  // 客户端的访问速度大于服务端的存储速度（或服务端无数据），返回空数据
  if (bytesBehind <= 0) {
    return { data: [] };
  }

  // 读取缓存
  const readLength = Math.min(Nr * 2, bytesBehind);
  let result = [];
  let meanVal = 0;
  for (let i = 0; i < readLength; i = i + 2) {
    let val = radarSocket.dataBuf[i + startByte] + 256 * radarSocket.dataBuf[i + 1 + startByte];
    result.push(val);
    meanVal += val;
  }
  meanVal = meanVal / result.length;
  result = result.map((val, index) => {
    return {
      x: index.toString(),
      val: val - meanVal,
    };
  });

  console.log(`===已成功向前端发送：${readLength} bytes 数据`);
  return { data: result };
};
