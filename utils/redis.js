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


// From the first to the second version of the RedisClient implementation, 
// several key improvements and structural changes were made to make the code
//  more configurable, maintainable, and production-ready. The second version introduces 
// environment-based configuration, allowing the Redis host, port, and optional password to be 
// dynamically read from environment variables instead of being hardcoded. It switches from the 
// 'connect' event to the 'ready' event for more reliable connection confirmation, ensuring that 
// Redis is fully initialized before commands are executed. It also adds a connection success log 
// message with the server address for visibility. Instead of overwriting the native Redis client 
// methods (get, set, del) with promisified versions — which can be risky and confusing — the second 
// version defines separate asynchronous wrappers (getAsync, setAsync, delAsync), preserving the 
// integrity of the underlying client. Error handling and status tracking remain similar, but the code 
// now follows a cleaner naming convention and avoids direct mutation of core methods. Overall, the 
// second version focuses on safer promisification, better environment portability, improved readiness 
// handling, and cleaner maintainability, while staying compatible with Redis v3.