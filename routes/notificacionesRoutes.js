const express = require("express");
const router = express.Router();
const notifCtrl = require("../controllers/notificacionesController");

// Crear notificación
router.post("/", notifCtrl.crearNotificacion);

// Obtener todas
router.get("/:telefono", notifCtrl.obtenerNotificaciones);

// Obtener pendientes
router.get("/pendientes/:telefono", notifCtrl.obtenerPendientes);

// Marcar enviada
router.put("/enviada/:notif_id", notifCtrl.marcarEnviada);

// Marcar leída
router.put("/leida/:notif_id", notifCtrl.marcarLeida);

// Eliminar
router.delete("/:notif_id", notifCtrl.eliminarNotificacion);

module.exports = router;