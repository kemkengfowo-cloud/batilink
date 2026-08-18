const jwt = require("jsonwebtoken");
module.exports = (req, res, next) => {
  const token = req.headers.authorization && req.headers.authorization.split(" ")[1];
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || "byh_secret_2024");
    next();
  } catch {
    res.status(401).json({ message: "Token invalide." });
  }
};
