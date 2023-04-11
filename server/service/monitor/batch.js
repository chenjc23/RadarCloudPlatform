const db = require('../../app').db;
const dbClient = require('../../app').client;

const { UUID } = require('bson');

module.exports.addBatch = async (content, req, res) => {
  const { batchName } = content;
  // 创建批次实体
  const batchEntity = {
    batchName,
    create_time: new Date(),
  };
  return await db.collection('batch').insertOne(batchEntity);
};

module.exports.getBatch = async (content, req, res) => {
  const { flag, batchId } = content;

  // 依据flag参数设置查询条件
  let partialCondition = [];
  switch (flag) {
    // 查找指定批次
    case 'specific': {
      partialCondition = [{ $match: { _id: batchId } }];
      break;
    }
    // 查找所有批次
    case 'all': {
      partialCondition = [{ $match: {} }];
      break;
    }
    // 查找最近未开始工作的批次
    default: {
      partialCondition = [
        { $match: { start_time: { $exists: false } } },
        { $sort: { create_time: -1 } },
        { $limit: 1 },
      ];
      break;
    }
  }

  // 左连接监测点表，lookup合并监测点数组信息
  return await db
    .collection('batch')
    .aggregate([
      ...partialCondition,
      {
        $lookup: {
          from: 'target',
          as: 'tgPoints',
          localField: '_id',
          foreignField: 'batchId',
          pipeline: [
            { $addFields: { tgId: '$_id' } },
            { $project: { _id: 0, batchId: 0, measurements: 0 } },
          ],
        },
      },
      { $addFields: { batchId: '$_id' } },
    ])
    .toArray()
    .then((res) => {
      return flag === 'all' ? res : res[0];
    });
};
