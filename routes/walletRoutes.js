// routes/walletRoutes.js
const express = require("express");
const router = express.Router();
const walletController = require("../controllers/walletController");

// Obtener datos del usuario
router.get("/usuario/:id", walletController.getUsuario);

// Editar datos del usuario
router.put("/editar/:id", walletController.editarUsuario);

// Obtener historial de transacciones
router.get("/movimientos/:telefono", walletController.getMovimientos);

// Hacer transferencia entre usuarios
router.post("/transferencia", walletController.transferencia);

// Buscar receptor por celular 
// router.get("/buscar/:telefono", walletController.getUsuarioPorCelular);

router.get("/buscar/:termino", walletController.buscarUsuarios);


module.exports = router;