const radarSocket = require('../../RadarServer/index');

module.exports = async (content, req, res) => {
  if (radarSocket.isOpen()) {
    console.log('===雷达已存在连接，无需重新连接。');
    return true;
  }

  radarSocket.connectRadar();
  return await new Promise((resolve) => {
    radarSocket.socket.on('connect', () => {
      console.log('===雷达连接成功！');
      resolve(true);
    });
    setTimeout(() => {
      if (radarSocket.isOpen()) {
        resolve(true);
      } else {
        console.log('===雷达连接超时！');
        resolve(false);
      }
    }, 3000);
  });

  // let result;
  // radarSocket.connectRadar();
  // // 稍微的延迟判断是否连接成功，这部分连上公网时可能需要延长
  // await new Promise((resolve, reject) => {
  //   setTimeout(() => {
  //     if (radarSocket.isOpen()) {
  //       console.log('===雷达连接成功！');
  //       result = true;
  //     }
  //     resolve();
  //   }, 200);
  // });
  //
  // if (result) return true;
  //
  // // 若不成功则等待几秒，若超时仍不成功则响应连接失败
  // return await new Promise((resolve, reject) => {
  //   setTimeout(() => {
  //     if (radarSocket.isOpen()) {
  //       console.log('===雷达连接成功！');
  //       resolve(true);
  //     } else {
  //       radarSocket.socket.destroy();
  //       resolve(false);
  //     }
  //   }, 3000);
  // });
};
