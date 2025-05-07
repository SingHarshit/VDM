const {createClient} =require('redis');

const redisClient=createClient({
    url: 'http://localhost:6379'
});

redisClient.connect()
  .then(() => console.log('✅ Connected to Redis successfully.'))
  .catch((err) => console.error('❌ Failed to connect to Redis:', err));

module.exports = redisClient;