const { externConfig } = require('../config/config');
const { exec } = require('child_process');

module.exports = async (dataPath, imgPath) => {
  const { exec } = require('child_process');
  const { imagingAlgorithmCall } = externConfig;
  const sysCall = imagingAlgorithmCall + ' ' + dataPath + ' ' + imgPath;
  return await new Promise((resolve, reject) => {
    exec(sysCall, (error, stdout, stderr) => {
      // 系统执行错误
      if (error) {
        console.error(`执行错误: ${error}`);
        reject(error);
      }
      // 程序输出错误
      if (stderr) {
        console.error(`stderr: ${stderr}`);
        reject(stderr);
      }
      // 程序执行成功
      console.log(stdout);
      resolve(true);
    });
  });
};
