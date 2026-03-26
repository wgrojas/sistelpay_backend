const bcrypt = require("bcryptjs");
const db = require("../config/db");

// ================= LOGIN =================
exports.login = (req, res) => {
  const { telefono, password } = req.body;

  if (!telefono || !password) {
    return res.status(400).json({ msg: "Faltan datos" });
  }

  db.query(
    "SELECT * FROM usuarios WHERE telefono = ?",
    [telefono],
    async (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ msg: "Error del servidor" });
      }

      if (results.length === 0) {
        return res.status(400).json({ msg: "Usuario no existe" });
      }

      const user = results[0];

      try {
        const valid = await bcrypt.compare(password, user.password);

        if (!valid) {
          return res.status(400).json({ msg: "Contraseña incorrecta" });
        }

        res.json({
          user_id: user.user_id,
          nombre: user.nombre,
          identidad: user.identidad,
          telefono: user.telefono,
          saldo: user.saldo,
        });
      } catch (error) {
        return res.status(500).json({ msg: "Error al validar contraseña" });
      }
    }
  );
};

// ================= REGISTER =================
exports.register = (req, res) => {
  const { nombre, identidad, telefono, email, password } = req.body;

  if (!nombre || !identidad || !telefono || !email || !password) {
    return res.status(400).json({ msg: "Faltan datos" });
  }

  // Validar duplicados
  db.query(
    "SELECT * FROM usuarios WHERE telefono = ? OR email = ? OR identidad = ?",
    [telefono, email, identidad],
    async (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ msg: "Error del servidor" });
      }

      if (results.length > 0) {
        return res.status(400).json({ msg: "El usuario ya existe" });
      }

      try {
        const hash = await bcrypt.hash(password, 10);
        const saldoInicial = 100000;

        db.query(
          "INSERT INTO usuarios (nombre, identidad, telefono, email, password, saldo) VALUES (?, ?, ?, ?, ?, ?)",
          [nombre, identidad, telefono, email, hash, saldoInicial],
          (err, result) => {
            if (err) {
              console.error(err);
              return res.status(500).json({ msg: "Error al registrar" });
            }

            res.json({
              user_id: result.insertId,
              nombre,
              identidad,
              telefono,
              saldo: saldoInicial,
            });
          }
        );
      } catch (error) {
        res.status(500).json({ msg: "Error en el servidor" });
      }
    }
  );
};

// // ================= BUSCAR USUARIO POR TELÉFONO =================
// exports.buscarPorTelefono = (req, res) => {
//   const { telefono } = req.params;

//   if (!telefono) {
//     return res.status(400).json({ msg: "Falta el teléfono" });
//   }

//   db.query(
//     "SELECT user_id, nombre, telefono, saldo FROM usuarios WHERE telefono = ?",
//     [telefono],
//     (err, results) => {
//       if (err) {
//         console.error(err);
//         return res.status(500).json({ msg: "Error del servidor" });
//       }

//       if (results.length === 0) {
//         return res.status(404).json({ msg: "Usuario no encontrado" });
//       }

//       const user = results[0];
//       res.json(user);
//     }
//   );
// };