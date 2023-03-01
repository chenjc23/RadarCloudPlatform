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
  async connectRadar() {
    // 监测socket是否已连接
    if (this.socket.readyState === 'open' || this.socket.readyState === 'writeOnly')
      return Promise.resolve();
    // 若未连接则发起连接
    return new Promise((resolve) => {
      this.socket.connect(
        // 设置雷达网络IP和端口
        { host, port },
        () => {
          console.log(`===与雷达-->${host}:${port} 的TCP连接已建立`);
          resolve();
        },
      );
    });
  }

  // 设置雷达参数
  async setWorkParams(buf) {
    return new Promise((resolve) => {
      this.socket.write(buf, () => {
        console.log(`===已成功向雷达发送参数设置指令：${buf}`);
        resolve();
      });
    });
  }

  // 设置雷达参数(待更新版本)
  // async setWorkParams2(buf) {
  // }

  // 发送采集指令
  async staticReadOrder(buf) {
    return new Promise((resolve, reject) => {
      this.socket.write(buf, () => {
        console.log(`===已成功向雷达发送静止采集指令：${buf}`);
        resolve();
        // 构造文件输出流
        // const fileName = `radarData${newFileId}.bin`;
        // const binOutputFlow = fs.createWriteStream(fileName, {flags: 'a'});
        // // 利用nodejs的pipe功能，直接将socket输入流与文件输出流对接（便捷至极）
        // this.socket.pipe(binOutputFlow);
        // console.log(`===采集数据保存的目标文件：${fileName}`);
      });
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
