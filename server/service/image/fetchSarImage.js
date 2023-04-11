const db = require('../../app').db;
const { ObjectId } = require('mongodb');

const fetchImgUrl = async (imageType, batchId) => {
  await db.collection('batch').insertOne({
    name: 'batch1',
    start_time: new Date().toLocaleString(),
    end_time: new Date().toLocaleString(),
    image: [{ intensity: 'test.png', defo: '1676969522359_raw.png' }],
    last_update: { intensity: 'test.png', defo: '1676969522359_raw.png' },
  });

  if (!batchId) {
    return await db
      .collection('batch')
      .find()
      .sort({ start_time: -1 })
      .limit(1)
      .toArray()
      .then((res) => {
        return res[0].last_update[imageType];
      });
  }
  return false;
};

module.exports = async (content, req, res) => {
  // 解析请求的image相关参数
  const { imageType, batchId } = content;
  // const imgUrl = await fetchImgUrl(imageType, batchId);
  // return imgUrl;
  return 'test.png';
};
