const db = require("../config/db");

// ===== Crear notificación de dinero recibido =====
exports.notifyReceived = (req, res) => {
  const { telefono_destino, telefono_origen, monto } = req.body;

  if (!telefono_destino || !telefono_origen || !monto) {
    return res.status(400).json({ error: "Faltan datos obligatorios" });
  }

  const mensaje = `Has recibido $${monto} de ${telefono_origen}`;

  const query = `
    INSERT INTO notificaciones (telefono_destino, mensaje, precio_producto, estado)
    VALUES (?, ?, ?, 'pendiente')
  `;

  db.query(query, [telefono_destino, mensaje, monto], (err) => {
    if (err) return res.status(500).json({ error: "Error creando notificación" });
    res.json({ success: true, message: "Notificación de dinero recibido creada" });
  });
};

// ===== Obtener notificaciones de dinero recibido pendientes =====

exports.getPendingReceived = (req, res) => {
  const { telefono_destino } = req.params;
  const query = `
    SELECT notif_id, telefono_destino, telefono_origen, monto, mensaje, estado, fecha
    FROM notificaciones
    WHERE telefono_destino = ? AND estado = 'pendiente'
    ORDER BY fecha DESC
  `;
  db.query(query, [telefono_destino], (err, results) => {
    if (err) return res.status(500).json({ error: "Error obteniendo notificaciones" });
    res.json(results);
  });
};

// ===== Marcar como leídas =====
exports.markReceivedAsRead = (req, res) => {
  const { telefono } = req.body;

  const query = `
    UPDATE notificaciones SET estado = 'enviada'
    WHERE telefono_destino = ? AND estado = 'pendiente'
  `;

  db.query(query, [telefono], (err) => {
    if (err) return res.status(500).json({ error: "Error actualizando notificaciones" });
    res.json({ success: true, message: "Notificaciones marcadas como leídas" });
  });
};

// controllers/recibidoController.js
exports.markAsRead = (req, res) => {
  const { notif_id } = req.body;
  db.query(
    "UPDATE notificaciones SET estado = 'enviada' WHERE notif_id = ?",
    [notif_id],
    (err) => {
      if (err) return res.status(500).json({ error: "Error marcando notificación" });
      res.json({ success: true });
    }
  );
};