const verifyRole = (req, res, next) => {
  const user = req.user;
  if (user?.role !== 'admin') {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Cannot verify admin role',
    });
  }
  next();
};

module.exports = verifyRole;
