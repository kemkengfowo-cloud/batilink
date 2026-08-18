const jwt = require('jsonwebtoken');
module.exports = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Accès refusé. Token manquant.' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || (() => { throw new Error('JWT_SECRET manquant'); })());
    next();
  } catch {
    res.status(401).json({ message: 'Token invalide.' });
  }
};
