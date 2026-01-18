const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  // Check for the token in the Authorization header
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    // 401: Unauthorized (As required by spec: { "msg": "No token, authorization denied"})
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    // Verify the token using the secret key from the .env file
    const decoded = jwt.verify(token, process.env.SECRET);
    
    // Attach the decoded payload (user data) to the request object
    // The payload structure is { user: { id: 1, email: '...' } }
    req.user = decoded; 
    
    next(); // Move to the next middleware or route handler
  } catch (err) {
    // 401: Unauthorized (As required by spec: { "msg": "Token is not valid"})
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

module.exports = auth;