const redis = require('redis');

const redisClient = async () => {
    const client = redis.createClient();
    client.on('error', err => console.log('Redis error', err));
    const connect = await client.connect();
    return connect;
}

module.exports = redisClient;