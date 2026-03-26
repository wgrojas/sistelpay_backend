const db = require("../config/db");

// =======================
// Obtener datos del usuario según JWT
// =======================
exports.getUsuario = (req, res) => {
  const userId = req.user.user_id; // viene del token

  db.query(
    "SELECT user_id, nombre, identidad, telefono, email, saldo, estado FROM usuarios WHERE user_id = ?",
    [userId],
    (err, results) => {
      if (err) return res.status(500).json({ msg: "Error del servidor" });
      if (results.length === 0)
        return res.status(404).json({ msg: "Usuario no encontrado" });

      res.json(results[0]);
    }
  );
};

// =======================
// Editar datos del usuario según JWT
// =======================
exports.editarUsuario = (req, res) => {
  const userId = req.user.user_id; // viene del token
  const { nombre, identidad, telefono, email, estado } = req.body;

  db.query(
    "UPDATE usuarios SET nombre = ?, identidad = ?, telefono = ?, email = ?, estado = ? WHERE user_id = ?",
    [nombre, identidad, telefono, email, estado, userId],
    (err) => {
      if (err)
        return res.status(500).json({ msg: "Error al actualizar usuario" });
      res.json({ msg: "Usuario actualizado correctamente" });
    }
  );
};

// =======================
// Obtener historial de transacciones del usuario
// =======================
exports.getMovimientos = (req, res) => {
  const telefono = req.user.telefono; // viene del token

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
        return res.status(500).json({ msg: "Error al traer transacciones" });
      res.json(results);
    }
  );
};

// // =======================
// // Buscar usuario por celular o nombre
// // =======================
// exports.buscarUsuarios = (req, res) => {
//   const { termino } = req.params;

//   let query = "";
//   let params = [];

//   if (/^\d+$/.test(termino)) {
//     query = `
//       SELECT user_id, nombre, telefono 
//       FROM usuarios 
//       WHERE telefono LIKE ?
//       LIMIT 5
//     `;
//     params = [`${termino}%`];
//   } else {
//     query = `
//       SELECT user_id, nombre, telefono 
//       FROM usuarios 
//       WHERE nombre LIKE ?
//       LIMIT 5
//     `;
//     params = [`%${termino}%`];
//   }

//   db.query(query, params, (err, results) => {
//     if (err) {
//       console.error("❌ ERROR BUSQUEDA:", err);
//       return res.status(500).json({ msg: "Error del servidor" });
//     }

//     res.json(results);
//   });
// };
// =======================
// Buscar usuario por celular o nombre
// =======================
// exports.buscarUsuarios = (req, res) => {
//   const { termino } = req.params;
//   console.log("termino recibido:", termino); // para depuración

//   const query = `
//     SELECT user_id, nombre, telefono 
//     FROM usuarios
//     WHERE telefono LIKE ? OR nombre LIKE ?
//     LIMIT 5
//   `;
//   const params = [`%${termino}%`, `%${termino}%`];

//   db.query(query, params, (err, results) => {
//     if (err) {
//       console.error("❌ ERROR BUSQUEDA:", err);
//       return res.status(500).json({ msg: "Error del servidor" });
//     }

//     console.log("Resultados:", results); // aquí ves lo que devuelve la BD
//     res.json(results);
//   });
// };

// walletController.js


exports.buscarUsuarios = async (req, res) => {
  try {
    const { termino } = req.params;
    console.log("Término recibido:", termino);

    const query = `
      SELECT user_id, nombre, telefono 
      FROM usuarios
      WHERE telefono LIKE ? OR nombre LIKE ?
      LIMIT 5
    `;
    const params = [`%${termino}%`, `%${termino}%`];

    const [results] = await db.execute(query, params); // execute devuelve [rows, fields]

    console.log("Resultados:", results);
    res.json(results);
  } catch (err) {
    console.error("❌ ERROR BUSQUEDA:", err);
    res.status(500).json({ msg: "Error del servidor" });
  }
};
// =======================
// Hacer transferencia entre usuarios
// =======================
exports.transferencia = (req, res) => {
  const telefono_origen = req.user.telefono; // siempre usar el del token
  const { telefono_destino, monto } = req.body;
  const montoNum = parseFloat(monto);

  db.query(
    "SELECT saldo FROM usuarios WHERE telefono = ?",
    [telefono_origen],
    (err, results) => {
      if (err) return res.status(500).json({ msg: "Error del servidor" });

      if (results.length === 0)
        return res.status(404).json({ msg: "Usuario emisor no encontrado" });

      if (results[0].saldo < montoNum)
        return res.status(400).json({ msg: "Saldo insuficiente" });

      db.query(
        "UPDATE usuarios SET saldo = saldo - ? WHERE telefono = ?",
        [montoNum, telefono_origen],
        (err) => {
          if (err)
            return res.status(500).json({ msg: "Error al descontar saldo" });

          db.query(
            "UPDATE usuarios SET saldo = saldo + ? WHERE telefono = ?",
            [montoNum, telefono_destino],
            (err) => {
              if (err)
                return res.status(500).json({ msg: "Error al sumar saldo" });

              db.query(
                "INSERT INTO transacciones (telefono_origen, telefono_destino, monto, estado, referencia, fecha) VALUES (?, ?, ?, 'completada', ?, NOW())",
                [
                  telefono_origen,
                  telefono_destino,
                  montoNum,
                  `Transferencia de ${telefono_origen} a ${telefono_destino}`,
                ],
                (err) => {
                  if (err) {
                    console.error("❌ ERROR TRANSACCION:", err);
                    return res.status(500).json({
                      msg: "Error al registrar transacción",
                    });
                  }

                  console.log("✅ TRANSACCION INSERTADA:", req.body);

                  res.json({
                    msg: "Transferencia realizada correctamente",
                  });
                }
              );
            }
          );
        }
      );
    }
  );
};