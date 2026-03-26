const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ msg: "No autorizado" });

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ msg: "Token no proporcionado" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Puedes acceder con req.user.user_id, req.user.telefono
    next();
  } catch (error) {
    return res.status(401).json({ msg: "Token inválido" });
  }
};

module.exports = authMiddleware;