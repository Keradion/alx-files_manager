const createClient = require('redis').createClient;
const { promisify } = require('util')


class RedisClient {
  constructor() {
    this.client = createClient();
    this.client.alive = false;

    this.client.on('error', (err) => {
      this.client.alive = false;
      console.error('Redis error:', err);
    });

    this.client.on('connect', () => {
      this.client.alive = true;
    });

    this.client.get = promisify(this.client.get).bind(this.client);
    this.client.set = promisify(this.client.set).bind(this.client);
    this.client.del = promisify(this.client.del).bind(this.client);
  }

  // Return true when the connection with Redis is successful
  isAlive() {
    return this.client.alive;
  }

  // Takes a string key and returns the value stored under it in Redis
  async get(redisKey) {
    return this.client.get(redisKey);
  }

  // Takes a string key, value, and duration (in seconds) to store in Redis
  async set(redisKey, redisValue, duration) {
    return this.client.set(redisKey, redisValue, 'EX', duration);
  }

  // Takes a string key and removes the value in Redis under that key
  async del(redisKey){
	  console.log(redisKey);
    return this.client.del(redisKey);
  }
}

const redisClient = new RedisClient();
module.exports = redisClient;
