const redis = require('redis');

let client;

async function connectRedis() {
  try {
    client = redis.createClient({
      url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`,
      socket: {
        reconnectStrategy: (retries) => Math.min(retries * 50, 500)
      }
    });

    client.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    client.on('connect', () => {
      console.log('Redis Client Connected');
    });

    await client.connect();
    return client;
  } catch (error) {
    console.error('Redis connection failed:', error);
    throw error;
  }
}

// Session management helpers
async function setSession(key, value, expireInSeconds = 86400) {
  try {
    await client.setEx(key, expireInSeconds, JSON.stringify(value));
  } catch (error) {
    console.error('Redis set error:', error);
    throw error;
  }
}

async function getSession(key) {
  try {
    const value = await client.get(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error('Redis get error:', error);
    return null;
  }
}

async function deleteSession(key) {
  try {
    await client.del(key);
  } catch (error) {
    console.error('Redis delete error:', error);
    throw error;
  }
}

// Rate limiting helpers
async function incrementRateLimit(key, windowSeconds = 900) {
  try {
    const current = await client.incr(key);
    if (current === 1) {
      await client.expire(key, windowSeconds);
    }
    return current;
  } catch (error) {
    console.error('Redis rate limit error:', error);
    return 0;
  }
}

module.exports = {
  connectRedis,
  getClient: () => client,
  setSession,
  getSession,
  deleteSession,
  incrementRateLimit
};
