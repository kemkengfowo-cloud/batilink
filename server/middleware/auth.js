const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  // Lire token depuis cookie httpOnly OU header Authorization
  const tokenFromCookie = req.cookies?.byh_token;
  const tokenFromHeader = req.headers.authorization?.split(" ")[1];
  const token = tokenFromCookie || tokenFromHeader;

  if (!token) {
    return res.status(401).json({ message: "Token manquant." });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: "Token invalide ou expiré." });
  }
};
