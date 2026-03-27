const db = require("../config/db"); // Pool mysql2/promise
const jwt = require("jsonwebtoken");

// =======================
// 🔐 Función para obtener usuario desde token
// =======================
const getUserFromToken = (req) => {
  const token = req.header("Authorization");

  if (!token) {
    throw new Error("No hay token");
  }

  return jwt.verify(
    token.replace("Bearer ", ""),
    process.env.JWT_SECRET
  );
};

// =======================
// Obtener datos del usuario
// =======================
exports.getUsuario = async (req, res) => {
  try {
    const decoded = getUserFromToken(req);
    const userId = decoded.user_id;

    const [results] = await db.execute(
      "SELECT user_id, nombre, identidad, telefono, email, saldo, estado FROM usuarios WHERE user_id = ?",
      [userId]
    );

    if (results.length === 0)
      return res.status(404).json({ msg: "Usuario no encontrado" });

    res.json(results[0]);
  } catch (err) {
    console.error("❌ ERROR GET USUARIO:", err.message);
    res.status(401).json({ msg: "Token inválido o error del servidor" });
  }
};

// =======================
// Editar usuario
// =======================
exports.editarUsuario = async (req, res) => {
  try {
    const decoded = getUserFromToken(req);
    const userId = decoded.user_id;

    const { nombre, identidad, telefono, email } = req.body;

    if (!nombre && !identidad && !telefono && !email) {
      return res.status(400).json({
        msg: "No se enviaron datos para actualizar",
      });
    }

    await db.execute(
      "UPDATE usuarios SET nombre = ?, identidad = ?, telefono = ?, email = ? WHERE user_id = ?",
      [
        nombre ?? null,
        identidad ?? null,
        telefono ?? null,
        email ?? null,
        userId,
      ]
    );

    res.json({ msg: "Usuario actualizado correctamente" });
  } catch (err) {
    console.error("❌ ERROR EDITAR USUARIO:", err.message);
    res.status(401).json({ msg: "Token inválido o error del servidor" });
  }
};

// =======================
// Obtener movimientos
// =======================
exports.getMovimientos = async (req, res) => {
  try {
    const decoded = getUserFromToken(req);
    const telefono = decoded.telefono;

    const [results] = await db.execute(
      `SELECT t.trans_id, t.telefono_origen, t.telefono_destino, t.monto, t.estado, t.referencia, t.fecha,
              u1.nombre AS emisor, u1.identidad AS identidad_emisor,
              u2.nombre AS receptor, u2.identidad AS identidad_receptor
       FROM transacciones t
       LEFT JOIN usuarios u1 ON t.telefono_origen = u1.telefono
       LEFT JOIN usuarios u2 ON t.telefono_destino = u2.telefono
       WHERE t.telefono_origen = ? OR t.telefono_destino = ?
       ORDER BY t.fecha DESC`,
      [telefono, telefono]
    );

    res.json(results);
  } catch (err) {
    console.error("❌ ERROR GET MOVIMIENTOS:", err.message);
    res.status(401).json({ msg: "Token inválido o error del servidor" });
  }
};

// =======================
// Buscar usuarios
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
  } catch (err) {
    console.error("❌ ERROR BUSQUEDA:", err);
    res.status(500).json({ msg: "Error del servidor" });
  }
};

// =======================
// Transferencia
// =======================
exports.transferencia = async (req, res) => {
  try {
    const decoded = getUserFromToken(req);
    const telefono_origen = decoded.telefono;

    const { telefono_destino, monto } = req.body;
    const montoNum = parseFloat(monto);

    if (!telefono_destino || !montoNum || montoNum <= 0) {
      return res.status(400).json({ msg: "Campos inválidos" });
    }

    // 🔹 Obtener saldo del emisor
    const [emisorRows] = await db.execute(
      "SELECT saldo FROM usuarios WHERE telefono = ?",
      [telefono_origen]
    );

    if (emisorRows.length === 0) {
      return res.status(404).json({ msg: "Usuario emisor no encontrado" });
    }

    if (emisorRows[0].saldo < montoNum) {
      return res.status(400).json({ msg: "Saldo insuficiente" });
    }

    // 🔹 Actualizar saldo
    await db.execute(
      "UPDATE usuarios SET saldo = saldo - ? WHERE telefono = ?",
      [montoNum, telefono_origen]
    );

    await db.execute(
      "UPDATE usuarios SET saldo = saldo + ? WHERE telefono = ?",
      [montoNum, telefono_destino]
    );

    // 🔹 Registrar transacción
    await db.execute(
      `INSERT INTO transacciones 
       (telefono_origen, telefono_destino, monto, estado, referencia, fecha) 
       VALUES (?, ?, ?, 'completada', ?, NOW())`,
      [
        telefono_origen,
        telefono_destino,
        montoNum,
        `Transferencia de ${telefono_origen} a ${telefono_destino}`,
      ]
    );

    res.json({ msg: "Transferencia realizada correctamente" });
  } catch (err) {
    console.error("❌ ERROR TRANSACCION:", err.message);
    res.status(401).json({ msg: "Token inválido o error del servidor" });
  }
};