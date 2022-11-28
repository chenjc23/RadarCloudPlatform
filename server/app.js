// app.js进行数据库的连接配置

const {
  mongodbConfig: { url, dbName },
} = require('./config/config');
const { MongoClient } = require('mongodb');

// 连接MongoDB server
const client = new MongoClient(url);
client
  .connect()
  .then(() => console.log('Mongodb client connected successfully'))
  .catch((err) => console.error('Mongodb client connection failed', err));
// console.log('Mongodb client connected successfully');
const db = client.db(dbName);

module.exports = db;
