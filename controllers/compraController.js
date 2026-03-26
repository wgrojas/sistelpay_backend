const db = require("../config/db");
const axios = require("axios");

// ===== 1️⃣ Notificar compra pendiente desde SistelCom =====
exports.notifyPurchase = (req, res) => {
  const { telefono_destino, producto_nombre, precio_producto } = req.body;

  if (!telefono_destino || !producto_nombre || !precio_producto) {
    return res.status(400).json({ error: "Faltan datos obligatorios" });
  }

  const mensaje = `Tienes una compra pendiente: ${producto_nombre} por $${precio_producto}`;

  const query = `
    INSERT INTO notificaciones (telefono_destino, mensaje, precio_producto, estado)
    VALUES (?, ?, ?, 'pendiente')
  `;

  db.query(query, [telefono_destino, mensaje, precio_producto], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Error creando notificación" });
    }

    res.json({ success: true, message: "Notificación de compra creada" });
  });
};

// ===== 2️⃣ Procesar compra pendiente =====
exports.procesarCompra = (req, res) => {
  const { telefono_destino, notif_id, aceptar } = req.body;

  if (!telefono_destino || !notif_id || typeof aceptar === "undefined") {
    return res.status(400).json({ error: "Faltan datos obligatorios" });
  }

  // Obtener la notificación pendiente
  db.query(
    "SELECT * FROM notificaciones WHERE notif_id = ? AND estado = 'pendiente'",
    [notif_id],
    (err, results) => {
      if (err) return res.status(500).json({ error: "Error buscando notificación" });
      if (!results.length) return res.status(404).json({ error: "Notificación no encontrada" });

      const notificacion = results[0];

      if (!aceptar) {
        // Marcar como leída/rechazada
        db.query(
          "UPDATE notificaciones SET estado = 'leida' WHERE notif_id = ?",
          [notif_id],
          (err) => {
            if (err) return res.status(500).json({ error: "Error actualizando notificación" });

            // Notificar a SistelCom
            axios.post("http://localhost:5000/api/payments/rechazada", {
              telefono_destino,
              producto: notificacion.mensaje,
              precio: notificacion.precio_producto,
            }).catch((e) => console.error(e.message));

            return res.json({ status: "rechazado", msg: "Compra rechazada" });
          }
        );
        return;
      }

      // Obtener saldo del usuario
      db.query(
        "SELECT saldo, nombre FROM usuarios WHERE telefono = ?",
        [telefono_destino],
        (err, resultsUser) => {
          if (err) return res.status(500).json({ error: "Error obteniendo usuario" });
          if (!resultsUser.length) return res.status(404).json({ error: "Usuario no encontrado" });

          const usuario = resultsUser[0];

          if (usuario.saldo < notificacion.precio_producto) {
            return res.status(400).json({ status: "rechazado", error: "Saldo insuficiente" });
          }

          // Descontar saldo
          db.query(
            "UPDATE usuarios SET saldo = saldo - ? WHERE telefono = ?",
            [notificacion.precio_producto, telefono_destino],
            (err) => {
              if (err) return res.status(500).json({ error: "Error descontando saldo" });

              // Registrar transacción
              db.query(
                "INSERT INTO transacciones (telefono_origen, telefono_destino, monto, estado, referencia, fecha) VALUES (?, ?, ?, 'completada', ?, NOW())",
                [telefono_destino, null, notificacion.precio_producto, notificacion.mensaje],
                (err) => {
                  if (err) return res.status(500).json({ error: "Error registrando transacción" });

                  // Actualizar notificación
                  db.query(
                    "UPDATE notificaciones SET estado = 'enviada' WHERE notif_id = ?",
                    [notif_id],
                    (err) => {
                      if (err) return res.status(500).json({ error: "Error actualizando notificación" });

                      // Notificar a SistelCom
                      axios.post("http://localhost:5000/api/payments/aceptada", {
                        telefono_destino,
                        producto: notificacion.mensaje,
                        precio: notificacion.precio_producto,
                      }).catch((e) => console.error(e.message));

                      return res.json({
                        status: "aprobado",
                        msg: `Compra aprobada. Se descontó $${notificacion.precio_producto} del saldo de ${usuario.nombre}`,
                        saldo_actual: usuario.saldo - notificacion.precio_producto,
                      });
                    }
                  );
                }
              );
            }
          );
        }
      );
    }
  );
};

// ===== 3️⃣ Obtener notificaciones pendientes de compras =====
exports.getPendingPurchases = (req, res) => {
  const { telefono_destino } = req.params;

  const query = `
    SELECT notif_id, mensaje, precio_producto, estado, fecha
    FROM notificaciones
    WHERE telefono_destino = ? AND estado = 'pendiente'
    ORDER BY fecha DESC
  `;

  db.query(query, [telefono_destino], (err, results) => {
    if (err) return res.status(500).json({ error: "Error obteniendo notificaciones" });
    res.json(results);
  });
};