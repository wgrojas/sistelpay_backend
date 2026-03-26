const express = require("express");
const router = express.Router();
const walletController = require("../controllers/walletController");
const authMiddleware = require("../middlewares/authMiddleware");

// 🔒 Todas las rutas protegidas con JWT
router.use(authMiddleware);

// Obtener datos del usuario según token
router.get("/usuario/:id", walletController.getUsuario);

// Editar datos del usuario según token
router.put("/editar/:id", walletController.editarUsuario);

// Obtener historial de transacciones
router.get("/movimientos/:telefono", walletController.getMovimientos);

// Hacer transferencia entre usuarios
router.post("/transferencia", walletController.transferencia);

// Buscar receptor por celular 
router.get("/buscar/:termino", walletController.buscarUsuarios);

module.exports = router;