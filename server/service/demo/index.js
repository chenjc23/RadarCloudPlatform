const db = require('../../app');

module.exports = async (content, req) => {
  // const { test } = content;
  // await db.collection('demo').insertOne({ test });
  // return {
  //   success: true,
  //   message: test,
  // };
  return [
    {
      year: '1850',
      value: 10,
      category: 'Liquid fuel',
    },
    {
      year: '1850',
      value: 54,
      category: 'Solid fuel',
    },
    {
      year: '1850',
      value: 30,
      category: 'Gas fuel',
    },
    {
      year: '1850',
      value: 40,
      category: 'Cement production',
    },
    {
      year: '1850',
      value: 3,
      category: 'Gas flarinl',
    },
  ];
};
