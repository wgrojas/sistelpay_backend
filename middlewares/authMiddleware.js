// const jwt = require("jsonwebtoken");

// const authMiddleware = (req, res, next) => {
//   const authHeader = req.headers.authorization;
//   if (!authHeader) return res.status(401).json({ msg: "No autorizado" });

//   const token = authHeader.split(" ")[1];
//   if (!token) return res.status(401).json({ msg: "Token no proporcionado" });

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded; // Puedes acceder con req.user.user_id, req.user.telefono
//     next();
//   } catch (error) {
//     return res.status(401).json({ msg: "Token inválido" });
//   }
// };

// module.exports = authMiddleware;

const jwt = require("jsonwebtoken");
require("dotenv").config(); // 🔥 IMPORTANTE

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ msg: "No autorizado" });
    }

    // 🔹 Formato: "Bearer TOKEN"
    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ msg: "Token no proporcionado" });
    }

    // 🔹 Verificar token usando .env
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();
  } catch (error) {
    console.error("❌ ERROR AUTH:", error.message);
    return res.status(401).json({ msg: "Token inválido" });
  }
};

module.exports = authMiddleware;