const agentOrAdmin = (req, res, next) => {
  if (!['admin', 'agent'].includes(req.user?.role)) {
    return res.status(403).json({ message: 'Accès réservé aux agents et admins B.Y.H.' });
  }
  next();
};

const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Accès réservé aux admins B.Y.H.' });
  }
  next();
};

module.exports = { agentOrAdmin, adminOnly };
