const jwt = require('jsonwebtoken');

const verifyJWT = (req, res, next) => {
  const authHeader =
    req.headers['authorization'] || req.headers['Authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized',
    });
  }

  // Extract the token
  const token = authHeader.split(' ')[1];

  // Verify the JWT
  jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Forbidden' }); // Invalid token
    }

    // Attach the decoded user ID to the request for authorization
    req.user = decoded.user;

    next(); // Proceed to the next middleware or route handler
  });
};

module.exports = verifyJWT;
