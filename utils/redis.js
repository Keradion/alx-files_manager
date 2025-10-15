import { createClient } from 'redis';
import { promisify } from 'util';

// RedisClient instance has a property called client
// its a redis client. allow us to perform redis operations.

class RedisClient{

        constructor() {
                this.client = createClient();
		this.client.alive = true;
		this.client.on('error', function(error) {
		});
		this.client.on('connect', function() {
		});
		this.client.get = promisify(this.client.get).bind(this.client);
                this.client.set = promisify(this.client.set).bind(this.client);
                this.client.del = promisify(this.client.del).bind(this.client)
        }

        // Return True when the connection with redis is success otherwise False.
        isAlive(){
		return this.client.alive;
        };

        // Takes a string key as an argument and return a value that stored under it in redis.
        async get(redisKey){
		return await this.client.get(redisKey);
        };

        // Takes a string key, a value and duration to store in redis.
        async set(redisKey, redisValue, duration){
		await this.client.set(redisKey, redisValue, 'EX', duration);
        };

        // Takes a string key as argument and remove the value in redis under that key
        async del(redisKey){
		await this.client.del(redisKey);
        };

};

const redisClient = new RedisClient();
export default redisClient;
