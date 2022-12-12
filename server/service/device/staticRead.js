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

  let { pulseWidth, sampleFreq, sampleTime, prf } = content;
  pulseWidth = Number(pulseWidth) / 10 ** 3;
  sampleFreq = Number(sampleFreq) * 10 ** 6;
  sampleTime = Number(sampleTime);
  prf = Number(prf);
  const Nr = Math.round(pulseWidth * sampleFreq); // 距离线上的采样点数
  const bytes_per_second = Math.floor(prf * Nr * 2); // 每秒需要接收的字节数
  const whole_bytes = Math.floor(sampleTime) * bytes_per_second;

  const rail_param = [0, 0, 0, 0, 0]; // 静止轨道参数
  const buf_ADC = [2, ...rail_param, sampleTime];

  // 清空原buffer数据，重置读标志位
  radarSocket.dataBuf = new Uint8Array(0);
  radarSocket.readFinish = false;

  // 发送静止采集指令
  await radarSocket.staticReadOrder(new Uint8Array(buf_ADC));

  // 查询当前文件最大ID
  const maxFileId = await fetchMaxFileId();
  console.log(`===当前最大文件ID：${maxFileId}`);
  // 创建文件输出流
  const fileName = `radarData${maxFileId + 1}.bin`;
  const binOutputFlow = fs.createWriteStream(fileName, { flags: 'a' });

  // 监听雷达接口数据，边接收边写文件且写缓存（供前端轮询访问）
  radarSocket.socket.on('data', (data) => {
    radarSocket.dataBuf = Buffer.concat([radarSocket.dataBuf, data]);
    binOutputFlow.write(data);
    if (radarSocket.getByteLength() >= whole_bytes) {
      radarSocket.readFinish = true;
    }
  });
  // 数据库插入新文件ID
  await addFileId(maxFileId + 1);
  console.log(`===数据库新增文件ID：${maxFileId + 1}`);

  // 利用nodejs的pipe功能，直接将socket输入流与文件输出流对接（便捷至极）
  // console.log(await radarSocket.readTargetSize(bytes_per_second));
  // radarSocket.socket.pipe(binOutputFlow);
  // console.log(`===采集数据保存的目标文件：${fileName}`);
  return true;
};
