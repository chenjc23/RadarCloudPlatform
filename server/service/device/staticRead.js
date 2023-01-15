const db = require('../../app');
const radarSocket = require('../../RadarServer/index');
const fs = require('fs');

const fetchMaxFileId = async () => {
  const maxFileId = await db
    .collection('databin')
    .find()
    .sort({ file_ID: -1 })
    .limit(1)
    .toArray() // 这一步获取结果
    .then((res) => res[0]);
  return maxFileId ? maxFileId.file_ID : 0;
};

const addFileId = async (newFileId) => {
  await db
    .collection('databin')
    .insertOne({
      time: new Date().toLocaleString(),
      file_ID: newFileId,
    })
    .catch((err) => {
      console.error(`===数据库新增数据文件ID失败：${newFileId}`, err);
      throw err;
    });
};

module.exports = async (content, req, res) => {
  // 雷达是否已连接
  if (!radarSocket.isOpen()) return false;
  // 是否还有缓存未读完
  if (!radarSocket.readFinish) {
    const info = `雷达仍在采集！已存储字节数：${radarSocket.getByteLength()}`;
    console.log('===' + info);
    return { message: info };
  }

  let { startFreq, stopFreq, pulseWidth, prf, channelGain, sampleFreq, sampleTime } = content;
  startFreq = Number(startFreq);
  stopFreq = Number(stopFreq);
  pulseWidth = Number(pulseWidth);
  prf = Number(prf);
  channelGain = Number(channelGain);
  sampleFreq = Number(sampleFreq);
  sampleTime = Number(sampleTime);

  const Nr = Math.round((pulseWidth / 10 ** 3) * sampleFreq * 10 ** 6); // 距离线上的采样点数
  const Na = Math.round(sampleTime * prf); // 方位采样总点数
  const bytes_per_second = Math.floor(prf * Nr * 2); // 每秒需要接收的字节数
  const whole_bytes = Math.floor(sampleTime) * bytes_per_second;

  const rail_param = [0, 0, 0, 0, 0]; // 静止轨道参数
  const buf_ADC = [2, ...rail_param, sampleTime];

  // 清空原buffer数据，重置读标志位
  radarSocket.dataBuf = new Uint8Array(0);
  radarSocket.readFinish = false;

  // 构造10个文件头变量并写入buffer
  const va = 0.1; // 方位速度（占位？）
  const lamda = (3 * 10 ** 8) / ((startFreq * 10 ** 6) / 2 + (stopFreq * 10 ** 6) / 2);

  const var_all_bytes = 7 * 64 + 2 * 32 + 64; // 576 bytes
  const headBuf = Buffer.alloc(var_all_bytes);
  let offset = 0;
  offset = headBuf.writeDoubleLE(startFreq, offset);
  offset = headBuf.writeDoubleLE(stopFreq, offset);
  offset = headBuf.writeDoubleLE(pulseWidth, offset);
  offset = headBuf.writeDoubleLE(prf, offset);
  offset = headBuf.writeDoubleLE(Number(channelGain), offset);
  offset = headBuf.writeDoubleLE(sampleFreq, offset);
  offset = headBuf.writeDoubleLE(va, offset);
  offset = headBuf.writeInt32LE(Nr, offset);
  offset = headBuf.writeInt32LE(Na, offset);
  offset = headBuf.writeDoubleLE(lamda, offset);

  // 查询当前文件最大ID, 构建新文件名
  const maxFileId = await fetchMaxFileId();
  console.log(`===当前最大文件ID：${maxFileId}`);
  const fileName = `./radarData${maxFileId + 1}.dat`;
  // 创建文件输出流并存入头文件
  const binOutputFlow = fs.createWriteStream(fileName, { flags: 'a' });
  binOutputFlow.write(headBuf);

  try {
    // 发送静止采集指令
    await radarSocket.staticReadOrder(new Uint8Array(buf_ADC));
    // 监听雷达接口数据，边接收边写文件且写缓存（供前端轮询访问）
    let callback = (data) => {
      // 输出到文件流
      binOutputFlow.write(data);
      radarSocket.dataBuf = Buffer.concat([radarSocket.dataBuf, data]);

      if (radarSocket.getByteLength() >= whole_bytes) {
        // 移除该轮数据监听（防止影响下一次的数据监听）
        radarSocket.socket.removeListener('data', callback);
        radarSocket.readFinish = true;
      }
    };
    radarSocket.socket.on('data', callback);
  } catch (e) {
    // 若采集错误则删除文件
    fs.rm(fileName, (e) => console.error(`删除文件${fileName}错误：`, e));
    throw e;
  }
  // 无错误则-->数据库插入新文件ID
  await addFileId(maxFileId + 1);
  console.log(`===数据库新增文件ID：${maxFileId + 1}`);
  return true;
};
