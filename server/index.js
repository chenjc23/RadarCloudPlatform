// index页面进行路由配置以及server启动
const { PlatformServer } = require('./server');

// 创建云平台server实例
const server = new PlatformServer();

// 数据库连接(导入一次连接，后面其他模块导入不再重复连接)
const db = require('./app');

// 路由注册
// demo
server.setRoute('/demo/test', require('./service/demo'));

// device
server.setRoute('/device/setParams', require('./service/device/setParams'));
server.setRoute('/device/tcpConnect', require('./service/device/tcpConnect'));
server.setRoute('/device/staticRead', require('./service/device/staticRead'));
server.setRoute('/device/readBinaryPerSecond', require('./service/device/readBinaryPerSecond'));

// image
server.setRoute('/image/fetch', require('./service/image/fetchSarImage'));

// monitor
server.setRoute('/monitor/addBatch', require('./service/monitor/batch').addBatch);
server.setRoute('/monitor/getBatch', require('./service/monitor/batch').getBatch);

// targetPoints
server.setRoute('/monitor/addTgPoint', require('./service/monitor/tgData').addTgPoint);
server.setRoute('/monitor/getTgData', require('./service/monitor/tgData').getTgData);

// server启动
server.listen(3000);
