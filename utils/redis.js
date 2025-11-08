const { createClient } = require('redis');
const { promisify } = require('util');

class RedisClient {
  constructor() {
    const host = process.env.REDIS_HOST || '127.0.0.1';
    const port = parseInt(process.env.REDIS_PORT || '6379', 10);
    const password = process.env.REDIS_PASSWORD;

    const options = { host, port };
    if (password) options.password = password;

    this.client = createClient(options);
    this.client.alive = false;

    this.client.on('error', (err) => {
      this.client.alive = false;
      console.error('Redis error:', err);
    });

    this.client.on('ready', () => {
      this.client.alive = true;
      console.log(`✅ Connected to Redis at ${host}:${port}`);
    });

    // v3 client doesn’t need .connect()
    this.getAsync = promisify(this.client.get).bind(this.client);
    this.setAsync = promisify(this.client.set).bind(this.client);
    this.delAsync = promisify(this.client.del).bind(this.client);
  }

  isAlive() {
    return this.client.alive;
  }

  async get(redisKey) {
    return this.getAsync(redisKey);
  }

  async set(redisKey, redisValue, duration) {
    return this.setAsync(redisKey, redisValue, 'EX', duration);
  }

  async del(redisKey) {
    console.log(`Deleting key: ${redisKey}`);
    return this.delAsync(redisKey);
  }
}

const redisClient = new RedisClient();
module.exports = redisClient;
