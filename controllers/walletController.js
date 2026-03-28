// walletController.js
const db = require("../config/db"); // Pool mysql2/promise

// =======================
// Obtener datos del usuario según JWT
// =======================
exports.getUsuario = async (req, res) => {
  try {
    const userId = req.user.user_id;

    const [results] = await db.execute(
      "SELECT user_id, nombre, identidad, telefono, email, saldo, estado FROM usuarios WHERE user_id = ?",
      [userId],
    );

    if (results.length === 0)
      return res.status(404).json({ msg: "Usuario no encontrado" });

    res.json(results[0]);
  } catch (err) {
    console.error("❌ ERROR GET USUARIO:", err);
    res.status(500).json({ msg: "Error del servidor" });
  }
};

// =======================
// Editar datos del usuario según JWT
// =======================
// exports.editarUsuario = async (req, res) => {
//   try {
//     const userId = req.user.user_id;
//     console.log(req.user.user_id)
//     // const { nombre, identidad, telefono, email, estado } = req.body;

//     await db.execute(
//       "UPDATE usuarios SET nombre = ?, identidad = ?, telefono = ?, email = ?, estado = ? WHERE user_id = ?",
//       [nombre, identidad, telefono, email, estado, userId]
//     );

//     res.json({ msg: "Usuario actualizado correctamente" });
//   } catch (err) {
//     console.error("❌ ERROR EDITAR USUARIO:", err);
//     res.status(500).json({ msg: "Error al actualizar usuario" });
//   }
// };

exports.editarUsuario = async (req, res) => {
  try {
    const userId = req.user.user_id;
    console.log("Usuario logueado:", userId);

    // Tomar los campos del body
    const { nombre, identidad, telefono, email } = req.body;

    // Validar que se haya enviado al menos un dato (opcional)
    if (!nombre && !identidad && !telefono && !email) {
      return res
        .status(400)
        .json({ msg: "No se enviaron datos para actualizar" });
    }

    await db.execute(
      "UPDATE usuarios SET nombre = ?, identidad = ?, telefono = ?, email = ? WHERE user_id = ?",
      [nombre, identidad, telefono, email, userId],
    );

    res.json({ msg: "Usuario actualizado correctamente" });
  } catch (err) {
    console.error("❌ ERROR EDITAR USUARIO:", err);
    res.status(500).json({ msg: "Error al actualizar usuario" });
  }
};

// exports.editarUsuario = async (req, res) => {
//   try {
//     const userId = req.user.user_id;
//     console.log("Usuario logueado:", userId);

//     // Tomar campos del body
//     let { nombre, identidad, telefono, email, estado } = req.body;

//     // Convertir undefined a null para MySQL
//     nombre = nombre ?? null;
//     identidad = identidad ?? null;
//     telefono = telefono ?? null;
//     email = email ?? null;
//     estado = estado ?? null;

//     await db.execute(
//       "UPDATE usuarios SET nombre = ?, identidad = ?, telefono = ?, email = ?, estado = ? WHERE user_id = ?",
//       [nombre, identidad, telefono, email, estado, userId]
//     );

//     res.json({ msg: "Usuario actualizado correctamente" });
//   } catch (err) {
//     console.error("❌ ERROR EDITAR USUARIO:", err);
//     res.status(500).json({ msg: "Error al actualizar usuario" });
//   }
// };
// =======================
// Obtener historial de transacciones del usuario
// =======================
exports.getMovimientos = async (req, res) => {
  try {
    console.log("telefono",req.user.telefono)
    const telefono = req.user.telefono;
    console.log("telefono",telefono)

    const [results] = await db.execute(
      `SELECT t.trans_id, t.telefono_origen, t.telefono_destino, t.monto, t.estado, t.referencia, t.fecha,
              u1.nombre AS emisor, u1.identidad AS identidad_emisor,
              u2.nombre AS receptor, u2.identidad AS identidad_receptor
       FROM transacciones t
       LEFT JOIN usuarios u1 ON t.telefono_origen = u1.telefono
       LEFT JOIN usuarios u2 ON t.telefono_destino = u2.telefono
       WHERE t.telefono_origen = ? OR t.telefono_destino = ?
       ORDER BY t.fecha DESC`,
      [telefono, telefono],
    );

    res.json(results);
  } catch (err) {
    console.error("❌ ERROR GET MOVIMIENTOS:", err);
    res.status(500).json({ msg: "Error al traer transacciones" });
  }
};

// =======================
// Buscar usuario por celular o nombre
// =======================
exports.buscarUsuarios = async (req, res) => {
  try {
    const { termino } = req.params;

    const query = `
      SELECT user_id, nombre, telefono 
      FROM usuarios
      WHERE telefono LIKE ? OR nombre LIKE ?
      LIMIT 5
    `;
    const params = [`%${termino}%`, `%${termino}%`];

    const [results] = await db.execute(query, params);

    res.json(results);
    console.log("Resultados:", results);
  } catch (err) {
    console.error("❌ ERROR BUSQUEDA:", err);
    res.status(500).json({ msg: "Error del servidor" });
  }
};

// =======================
// Hacer transferencia entre usuarios
// =======================
exports.transferencia = async (req, res) => {
  try {
    const telefono_origen = req.user.telefono;
    const { telefono_destino, monto } = req.body;
    const montoNum = parseFloat(monto);

    if (!telefono_destino || !montoNum || montoNum <= 0)
      return res.status(400).json({ msg: "Campos inválidos" });

    // Obtener saldo del emisor
    const [emisorRows] = await db.execute(
      "SELECT saldo FROM usuarios WHERE telefono = ?",
      [telefono_origen],
    );

    if (emisorRows.length === 0)
      return res.status(404).json({ msg: "Usuario emisor no encontrado" });

    if (emisorRows[0].saldo < montoNum)
      return res.status(400).json({ msg: "Saldo insuficiente" });

    // Actualizar saldo del emisor
    await db.execute(
      "UPDATE usuarios SET saldo = saldo - ? WHERE telefono = ?",
      [montoNum, telefono_origen],
    );

    // Actualizar saldo del receptor
    await db.execute(
      "UPDATE usuarios SET saldo = saldo + ? WHERE telefono = ?",
      [montoNum, telefono_destino],
    );

    // Insertar transacción
    await db.execute(
      "INSERT INTO transacciones (telefono_origen, telefono_destino, monto, estado, referencia, fecha) VALUES (?, ?, ?, 'completada', ?, NOW())",
      [
        telefono_origen,
        telefono_destino,
        montoNum,
        `Transferencia de ${telefono_origen} a ${telefono_destino}`,
      ],
    );

    res.json({ msg: "Transferencia realizada correctamente" });
  } catch (err) {
    console.error("❌ ERROR TRANSACCION:", err);
    res.status(500).json({ msg: "Error al procesar la transferencia" });
  }
};
