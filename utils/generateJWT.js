const jwt = require('jsonwebtoken');
const generateAccessToken = (user) => {
  return jwt.sign(
    {
      user: {
        id: user._id,
        role: user.role,
      },
    },
    process.env.ACCESS_TOKEN,
    { expiresIn: '1h' }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      user: {
        id: user._id,
      },
    },
    process.env.REFRESH_TOKEN,
    { expiresIn: '7d' }
  );
};

module.exports = { generateAccessToken, generateRefreshToken };
