const radarSocket = require('../../RadarServer/index');

module.exports = async (content, req, res) => {
  if (radarSocket.isOpen()) {
    console.log('===雷达已存在连接，无需重新连接。');
    return true;
  }

  radarSocket.connectRadar();
  return await new Promise((resolve, reject) => {
    radarSocket.socket.on('connect', () => {
      console.log('===雷达连接成功！');
      resolve(true);
    });
    setTimeout(() => {
      if (radarSocket.isOpen()) {
        resolve(true);
      } else {
        console.log('===雷达连接超时！');
        reject('雷达未工作');
      }
    }, 3000);
  });
};
