const db = require("../config/db");

// =======================
// Obtener datos del usuario
// =======================
exports.getUsuario = (req, res) => {
  const { id } = req.params;

  db.query(
    "SELECT user_id, nombre, identidad, telefono, email, saldo, estado FROM usuarios WHERE user_id = ?",
    [id],
    (err, results) => {
      if (err)
        return res.status(500).json({
          msg: "Error del servidor",
        });
      if (results.length === 0)
        return res.status(404).json({
          msg: "Usuario no encontrado",
        });

      res.json(results[0]);
    },
  );
};

// =======================
// Editar datos del usuario
// =======================
exports.editarUsuario = (req, res) => {
  const { id } = req.params;
  const { nombre, identidad, telefono, email, estado } = req.body;

  db.query(
    "UPDATE usuarios SET nombre = ?, identidad = ?, telefono = ?, email = ?, estado = ? WHERE user_id = ?",
    [nombre, identidad, telefono, email, estado, id],
    (err) => {
      if (err)
        return res.status(500).json({
          msg: "Error al actualizar usuario",
        });
      res.json({
        msg: "Usuario actualizado correctamente",
      });
    },
  );
};

// =======================
// Obtener historial de transacciones del usuario
// =======================
exports.getMovimientos = (req, res) => {
  const { telefono } = req.params; // buscamos por teléfono

  db.query(
    `SELECT t.trans_id, t.telefono_origen, t.telefono_destino, t.monto, t.estado, t.referencia, t.fecha,
            u1.nombre AS emisor, u1.identidad AS identidad_emisor,
            u2.nombre AS receptor, u2.identidad AS identidad_receptor
     FROM transacciones t
     LEFT JOIN usuarios u1 ON t.telefono_origen = u1.telefono
     LEFT JOIN usuarios u2 ON t.telefono_destino = u2.telefono
     WHERE t.telefono_origen = ? OR t.telefono_destino = ?
     ORDER BY t.fecha DESC`,
    [telefono, telefono],
    (err, results) => {
      if (err)
        return res.status(500).json({
          msg: "Error al traer transacciones",
        });
      res.json(results);
    },
  );
};

// =======================
// Buscar usuario por celular
// =======================
exports.getUsuarioPorCelular = (req, res) => {
  const { telefono } = req.params;

  db.query(
    "SELECT user_id, nombre, identidad, telefono, email, saldo FROM usuarios WHERE telefono = ?",
    [telefono],
    (err, results) => {
      if (err)
        return res.status(500).json({
          msg: "Error del servidor",
        });
      if (results.length === 0)
        return res.status(404).json({
          msg: "Usuario no encontrado",
        });

      res.json(results[0]);
    },
  );
};

// =======================
// Hacer transferencia
// =======================
exports.transferencia = (req, res) => {
  const { telefono_origen, telefono_destino, monto } = req.body;

  // Verificar saldo del emisor
  db.query(
    "SELECT saldo FROM usuarios WHERE telefono = ?",
    [telefono_origen],
    (err, results) => {
      if (err)
        return res.status(500).json({
          msg: "Error del servidor",
        });
      if (results.length === 0)
        return res.status(404).json({
          msg: "Usuario emisor no encontrado",
        });
      if (results[0].saldo < monto)
        return res.status(400).json({
          msg: "Saldo insuficiente",
        });

      // Restar saldo al emisor
      db.query(
        "UPDATE usuarios SET saldo = saldo - ? WHERE telefono = ?",
        [monto, telefono_origen],
        (err) => {
          if (err)
            return res.status(500).json({
              msg: "Error al actualizar saldo emisor",
            });

          // Sumar saldo al receptor
          db.query(
            "UPDATE usuarios SET saldo = saldo + ? WHERE telefono = ?",
            [monto, telefono_destino],
            (err) => {
              if (err)
                return res.status(500).json({
                  msg: "Error al actualizar saldo receptor",
                });

              // Registrar la transacción
              db.query(
                "INSERT INTO transacciones (telefono_origen, telefono_destino, monto, estado, referencia, fecha) VALUES (?, ?, ?, 'completada', ?, NOW())",
                [
                  telefono_origen,
                  telefono_destino,
                  monto,
                  `Transferencia de ${telefono_origen} a ${telefono_destino}`,
                ],
                (err) => {
                  if (err)
                    return res.status(500).json({
                      msg: "Error al registrar transacción",
                    });

                  // 🔔 Crear notificación
                  db.query(
                    "INSERT INTO notificaciones (telefono_destino, mensaje, monto, estado) VALUES (?, ?, ?, 'pendiente')",
                    [
                      telefono_destino,
                      `💰 Has recibido $${monto} de ${telefono_origen}`,
                      monto,
                    ],
                    (err) => {
                      if (err) {
                        console.error("❌ Error real notificación:", err);
                        return res.status(500).json({
                          msg: "Error al crear notificación",
                        });
                      }

                      // ✅ SOLO UNA RESPUESTA
                      res.json({
                        msg: "Transferencia realizada correctamente",
                      });
                    },
                  );
                },
              );
            },
          );
        },
      );
    },
  );
};
