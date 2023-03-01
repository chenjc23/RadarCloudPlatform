const net = require('net');
const {
  radarNetConfig: { host, port },
} = require('./config/config');

class RadarDataSocket {
  constructor() {
    this.socket = new net.Socket();
    this.dataBuf = new Uint8Array(0);
    this.readFinish = true;

    this.socket.on('error', (err) => {
      console.error('===socket err: ', err);
    });
  }

  // 向雷达发送连接请求
  connectRadar() {
    this.socket.connect(
      {
        // 设置雷达网络IP和端口
        host,
        port,
      },
      () => {
        console.log(`===与雷达-->${host}:${port} 的TCP连接已建立`);
      },
    );
  }

  // 设置雷达参数
  async setWorkParams(buf) {
    await new Promise((resolve, reject) => {
      this.socket.write(buf, () => {
        if (this.isOpen()) {
          console.log(`===已成功向雷达发送参数设置指令：${buf}`);
          resolve();
        } else reject('雷达参数设置失败');
      });
      setTimeout(() => reject('雷达参数设置失败'), 2000);
    });
  }

  // 发送采集指令
  async staticReadOrder(buf) {
    return await new Promise((resolve, reject) => {
      this.socket.write(buf, () => {
        if (this.isOpen()) {
          console.log(`===已成功向雷达发送静止采集指令：${buf}`);
          // 构造文件输出流
          // const fileName = `radarData${newFileId}.bin`;
          // const binOutputFlow = fs.createWriteStream(fileName, {flags: 'a'});
          // // 利用nodejs的pipe功能，直接将socket输入流与文件输出流对接（便捷至极）
          // this.socket.pipe(binOutputFlow);
          // console.log(`===采集数据保存的目标文件：${fileName}`);
          resolve(true);
        } else reject('雷达静止采集命令发送失败');
      });
      setTimeout(() => reject('雷达静止采集命令发送失败'), 2000);
    });
  }

  isOpen() {
    return !(this.socket.pending || this.socket.destroyed);
  }

  getByteLength() {
    return this.dataBuf.byteLength;
  }
}

module.exports.RadarDataSocket = RadarDataSocket;
