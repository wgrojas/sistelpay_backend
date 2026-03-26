const express = require("express");
const router = express.Router();
const compraController = require("../controllers/compraController");

// Crear notificación de compra pendiente
router.post("/notify", compraController.notifyPurchase);

// Procesar compra pendiente (aceptar/rechazar)
router.post("/procesar", compraController.procesarCompra);

// Obtener compras pendientes
router.get("/pendientes/:telefono", compraController.getPendingPurchases);

module.exports = router;