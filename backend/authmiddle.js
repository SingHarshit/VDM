const jwt = require('jsonwebtoken');
const redisClient = require('./redisClient');

const authenticateSocket = (redisClient) => async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication error'));

    const payload = jwt.verify(token, 'yoursecretkey');
    const session = await redisClient.get(payload.userId);

    if (!session) return next(new Error('Session expired'));

    socket.data.userId = payload.userId;
    next();
  } catch (error) {
    next(new Error('Authentication error'));
  }
};

module.exports = { authenticateSocket };
