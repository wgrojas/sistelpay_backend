const express = require("express");
const router = express.Router();
const recibidoController = require("../controllers/recibidoController");

// Crear notificación de dinero recibido
router.post("/", recibidoController.notifyReceived);

// Obtener notificaciones pendientes
router.get("/pendientes/:telefono", recibidoController.getPendingReceived);

// Marcar notificaciones como leídas
router.put("/marcar-leidas", recibidoController.markReceivedAsRead);

module.exports = router;