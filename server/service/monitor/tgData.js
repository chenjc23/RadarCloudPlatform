const { db, client: dbClient } = require('../../app');

module.exports.addTgPoint = async (content, req, res) => {
  const { batchId, tgName, tgScale } = content;
  // 创建监测点实体
  const tgEntity = {
    batchId,
    tgName,
    tgScale,
    measurements: [],
    create_time: new Date(),
  };

  // 开启事务，需要对不同表进行操作，需保证原子性
  const session = dbClient.startSession();
  try {
    await session.withTransaction(async () => {
      // 插入监测点数据
      await db.collection('target').insertOne(tgEntity);
      // 更新对应batch的last_modified
      await db
        .collection('batch')
        .updateOne({ _id: batchId }, { $currentDate: { last_modified: true } });
    });
  } finally {
    await session.endSession();
  }
  return true;
};

module.exports.getTgData = async (content, req, res) => {
  const { tgId } = content;
  return await db
    .collection('target')
    .findOne({ _id: tgId }, { projection: { _id: 0, measurements: 1 } });
};
