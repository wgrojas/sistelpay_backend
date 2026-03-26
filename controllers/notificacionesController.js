const db = require("../config/db");

// 1️⃣ Crear notificación (ej: envío de dinero)
exports.crearNotificacion = (req, res) => {
  const { telefono_destino, mensaje, monto } = req.body;
  console.log("📩 BODY:", req.body);

  if (!telefono_destino || !mensaje) {
    return res.status(400).json({ msg: "Faltan datos obligatorios" });
  }

  const query = `
    INSERT INTO notificaciones (telefono_destino, mensaje, monto)
    VALUES (?, ?, ?)
  `;

  db.query(query, [telefono_destino, mensaje, monto || 0], (err, result) => {
    if (err) {
      console.error("Error al crear notificación:", err);
      return res.status(500).json({ msg: "Error del servidor" });
    }

    res.json({
      msg: "Notificación creada",
      notif_id: result.insertId,
    });
  });
};

// 2️⃣ Obtener notificaciones de un usuario (tipo bandeja Nequi)
exports.obtenerNotificaciones = (req, res) => {
  const { telefono } = req.params;

  const query = `
    SELECT *
    FROM notificaciones
    WHERE telefono_destino = ?
    ORDER BY fecha DESC
  `;

  db.query(query, [telefono], (err, results) => {
    if (err) {
      console.error("Error al obtener notificaciones:", err);
      return res.status(500).json({ msg: "Error del servidor" });
    }

    res.json(results);
  });
};

// 3️⃣ Obtener solo notificaciones pendientes
exports.obtenerPendientes = (req, res) => {
  const { telefono } = req.params;

  const query = `
    SELECT *
    FROM notificaciones
    WHERE telefono_destino = ?
    AND estado = 'pendiente'
    ORDER BY fecha DESC
  `;

  db.query(query, [telefono], (err, results) => {
    if (err) {
      console.error("Error:", err);
      return res.status(500).json({ msg: "Error del servidor" });
    }

    res.json(results);
  });
};

// 4️⃣ Marcar notificación como enviada
exports.marcarEnviada = (req, res) => {
  const { notif_id } = req.params;

  const query = `
    UPDATE notificaciones
    SET estado = 'enviada'
    WHERE notif_id = ?
  `;

  db.query(query, [notif_id], (err) => {
    if (err) {
      console.error("Error:", err);
      return res.status(500).json({ msg: "Error del servidor" });
    }

    res.json({ msg: "Notificación marcada como enviada" });
  });
};

// 5️⃣ Marcar como leída (tipo abrir notificación en Nequi)
exports.marcarLeida = (req, res) => {
  const { notif_id } = req.params;

  const query = `
    UPDATE notificaciones
    SET estado = 'leida'
    WHERE notif_id = ?
  `;

  db.query(query, [notif_id], (err) => {
    if (err) {
      console.error("Error:", err);
      return res.status(500).json({ msg: "Error del servidor" });
    }

    res.json({ msg: "Notificación leída" });
  });
};

// 6️⃣ Eliminar notificación (opcional)
exports.eliminarNotificacion = (req, res) => {
  const { notif_id } = req.params;

  const query = `
    DELETE FROM notificaciones
    WHERE notif_id = ?
  `;

  db.query(query, [notif_id], (err) => {
    if (err) {
      console.error("Error:", err);
      return res.status(500).json({ msg: "Error del servidor" });
    }

    res.json({ msg: "Notificación eliminada" });
  });
};