const express = require('express');
const bodyParser = require('body-parser'); // 解析请求所需模块
const expressSession = require('express-session');
const redis = require('redis');
const {
  redisConfig: { url },
} = require('./config/config.js');
const RedisStore = require('connect-redis')(expressSession);

// 创建redis连接配置
const redisClient = redis.createClient({ url, legacyMode: true }); // legacyMode设置是关键，否则配置失效
redisClient
  .connect()
  .then(() => console.log('Redis client connected successfully'))
  .catch((err) => console.error('Redis client connection failed', err));

// 创建server类
class PlatformServer {
  constructor() {
    this.server = express();
    // 注册解析请求的中间件
    this.server.use(bodyParser.urlencoded({ extended: false }));
    this.server.use(bodyParser.json());
    // 避免server默认加上代理信息
    this.server.set('x-powered-by', false);
    // 响应前设置首部字段(中间件)
    this.server.all('*', (req, res, next) => {
      // 当请求的浏览器的credentials设置为true时，是否能读取响应体
      // google浏览器需要设置该首部
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      // 若为CORS预检请求，设置跨域相关首部字段
      if (req.method === 'OPTIONS') {
        console.log('!Accept a preflight!');

        res.setHeader('Access-Control-Allow-Origin', req.get('Origin'));
        res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, DELETE, PUT');
        res.setHeader('Access-Control-Allow-Headers', req.get('Access-Control-Request-Headers'));
        res.end();
        return;
      }
      // 传递至下一中间件处理
      next();
    });
    // 设置session中间件
    this.server.use(
      expressSession({
        store: new RedisStore({ client: redisClient }),
        name: 'session_id',
        secret: 'jc',
        resave: false, // 强制保存，如果session没有被修改也要重新保存,默认true(推荐false)
        saveUninitialized: true, // 如果原先没有session那么就设置，否则不设置(推荐true)
        rolling: true, // 每次请求更新有效时长
        cookie: {
          domain: '.radarPlatform',
          // 全局设置cookie,就是访问随便api就会设置cookie，也可以在登录的路由下单独设置
          maxAge: 1000 * 60 * 60 * 24 * 15, // 15 天后过期
          httpOnly: true, // 是否允许客户端修改cookie,(默认true 不能被修改)
        },
      }),
    );
  }
  // 配置路由
  setRoute(path, targetFunction) {
    // 全局的路由处理函数
    const globeHandler = async (req, res) => {
      const requestClientIp = req.ip;
      const content = req.body;
      const params = JSON.stringify(content);
      let result = false;
      // 捕捉嵌套传递外部的异常
      try {
        const startTime = new Date().getTime();
        console.log(
          `req start path = ${req.path}, clientIp = ${requestClientIp}, params = ${params}`,
        );
        result = await targetFunction(content, req, res);
        console.log(
          `req end path = ${
            req.path
          }, clientIp = ${requestClientIp}, params = ${params}, costTime = ${
            new Date().getTime() - startTime
          }`,
        );
      } catch (e) {
        console.error(
          `req error path = ${req.path}, clientIp = ${requestClientIp}, params = ${params}`,
          e,
        );
      }
      res.send(result);
    };
    this.server.post('/api' + path, globeHandler);
  }

  // server监听函数
  listen(port, ...args) {
    this.server.listen(port, ...args);
    console.log(`==== server start at ${port}, env = ${process.env.NODE_ENV} ====`);
  }
}

module.exports.PlatformServer = PlatformServer;
