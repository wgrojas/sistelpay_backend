// src/controllers/notificacionesController.js
const db = require("../config/db"); // tu pool mysql2/promise

// 1️⃣ Crear notificación (ej: envío de dinero)
exports.crearNotificacion = async (req, res) => {
  try {
    const { telefono_destino, mensaje, monto } = req.body;
    console.log("📩 BODY:", req.body);

    if (!telefono_destino || !mensaje) {
      return res.status(400).json({ msg: "Faltan datos obligatorios" });
    }

    const query = `
      INSERT INTO notificaciones (telefono_destino, mensaje, monto)
      VALUES (?, ?, ?)
    `;

    const [result] = await db.execute(query, [
      telefono_destino,
      mensaje,
      monto || 0,
    ]);

    res.json({
      msg: "Notificación creada",
      notif_id: result.insertId,
    });
  } catch (err) {
    console.error("Error al crear notificación:", err);
    res.status(500).json({ msg: "Error del servidor" });
  }
};

// 2️⃣ Obtener todas las notificaciones de un usuario
exports.obtenerNotificaciones = async (req, res) => {
  try {
    const { telefono } = req.params;

    const query = `
      SELECT *
      FROM notificaciones
      WHERE telefono_destino = ?
      ORDER BY fecha DESC
    `;

    const [results] = await db.execute(query, [telefono]);
    res.json(results);
  } catch (err) {
    console.error("Error al obtener notificaciones:", err);
    res.status(500).json({ msg: "Error del servidor" });
  }
};

// 3️⃣ Obtener solo notificaciones pendientes
exports.obtenerPendientes = async (req, res) => {
  try {
    const { telefono } = req.params;

    const query = `
      SELECT *
      FROM notificaciones
      WHERE telefono_destino = ?
        AND estado = 'pendiente'
      ORDER BY fecha DESC
    `;

    const [results] = await db.execute(query, [telefono]);
    res.json(results);
  } catch (err) {
    console.error("Error al obtener notificaciones pendientes:", err);
    res.status(500).json({ msg: "Error del servidor" });
  }
};

// 4️⃣ Marcar notificación como enviada
exports.marcarEnviada = async (req, res) => {
  try {
    const { notif_id } = req.params;

    const query = `
      UPDATE notificaciones
      SET estado = 'enviada'
      WHERE notif_id = ?
    `;

    await db.execute(query, [notif_id]);
    res.json({ msg: "Notificación marcada como enviada" });
  } catch (err) {
    console.error("Error al marcar enviada:", err);
    res.status(500).json({ msg: "Error del servidor" });
  }
};

// 5️⃣ Marcar notificación como leída
exports.marcarLeida = async (req, res) => {
  try {
    const { notif_id } = req.params;

    const query = `
      UPDATE notificaciones
      SET estado = 'leida'
      WHERE notif_id = ?
    `;

    await db.execute(query, [notif_id]);
    res.json({ msg: "Notificación leída" });
  } catch (err) {
    console.error("Error al marcar leída:", err);
    res.status(500).json({ msg: "Error del servidor" });
  }
};

// 6️⃣ Eliminar notificación (opcional)
exports.eliminarNotificacion = async (req, res) => {
  try {
    const { notif_id } = req.params;

    const query = `
      DELETE FROM notificaciones
      WHERE notif_id = ?
    `;

    await db.execute(query, [notif_id]);
    res.json({ msg: "Notificación eliminada" });
  } catch (err) {
    console.error("Error al eliminar notificación:", err);
    res.status(500).json({ msg: "Error del servidor" });
  }
};