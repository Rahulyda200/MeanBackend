const jwt = require('jsonwebtoken');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1]; // Bearer token
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const verified = jwt.verify(token, process.env.SECRET_KEY);
    req.user = verified;

    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or missing token' });
  }
};

module.exports = authMiddleware;
