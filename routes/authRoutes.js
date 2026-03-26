const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// 🔐 LOGIN
router.post("/login", authController.login);

// 🆕 REGISTER 
router.post("/register", authController.register);

// // Buscar usuario por teléfono (para transferencias)
// router.get("/buscar/:telefono", authController.buscarPorTelefono);

module.exports = router;