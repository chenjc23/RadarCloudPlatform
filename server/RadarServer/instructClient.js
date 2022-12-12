const net = require('net');
const fs = require('fs');
// 导入雷达网络参数
const {
  radarNetConfig: { host, port },
} = require('./config/config');
const { connectInstruct, tempSetParams, tempSampleParams } = require('./constant/radarSpecific'); // 导入雷达连接的相关指令信息

const socket = net.connect(
  {
    // 设置雷达网络IP和端口
    host,
    port,
  },
  () => {
    console.log('TCP连接已建立。');
  },
);

socket.on('connect', async () => {
  // 向雷达发送连接请求
  socket.write(new Uint8Array(connectInstruct));

  // 发送连接指令后等待一段时间
  await setTimeout(() => {
    console.log('网络已连接，请设置雷达参数。');
    socket.write(new Uint8Array(tempSetParams));
  }, 3000);

  await setTimeout(() => {
    console.log('参数设置完毕，请发送采集指令。');
    socket.write(new Uint8Array(tempSampleParams));
    // 构造文件输出流
    const binOutputFlow = fs.createWriteStream('radarData.bin', { flags: 'a' });
    // 利用nodejs的pipe功能，直接将socket输入流与文件输出流对接（便捷至极）
    socket.pipe(binOutputFlow);
  }, 3000);
});

socket.on('data', (data) => {
  console.log(`服务器已接收字节数：${socket.bytesRead}`);
  if (socket.bytesRead === 4000000) {
    console.log('数据接收完成，TCP连接关闭');
    //socket.destroy();
  }
});

socket.on('error', (err) => {
  console.error('连接错误：', err);
});
