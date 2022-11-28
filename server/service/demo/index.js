const db = require('../../app');

module.exports = async (content, req) => {
  const { test } = content;
  await db.collection('demo').insertOne({ test });
  return {
    success: true,
    message: test,
  };
};
