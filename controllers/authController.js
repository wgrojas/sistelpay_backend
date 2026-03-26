// const bcrypt = require("bcryptjs");
// const db = require("../config/db");

// // ================= LOGIN =================
// exports.login = async (req, res) => {
//   const { telefono, password } = req.body;
//   console.log("📩 Body:",req.body);
  
  
//   if (!telefono || !password) {
//     return res.status(400).json({ msg: "Faltan datos" });
//   }
//   await db.query(
//     "SELECT * FROM usuarios WHERE telefono = ?",
//     [telefono],
//     async (err, results) => {
//       if (err) {
//         console.error(err);
//         return res.status(500).json({ msg: "Error del servidor" });
//       }

       

//       if (results.length === 0) {
//         return res.status(400).json({ msg: "Usuario no existe" });
//       }

//       const user = results[0];
      
    

//       try {
//         const valid = await bcrypt.compare(password, user.password);

//         if (!valid) {
//           return res.status(400).json({ msg: "Contraseña incorrecta" });
//         }

//         res.json({
//           user_id: user.user_id,
//           nombre: user.nombre,
//           identidad: user.identidad,
//           telefono: user.telefono,
//           saldo: user.saldo,
//         });
//          console.log("📩 Login:",res);
         
//       } catch (error) {
//         return res.status(500).json({ msg: "Error al validar contraseña" });
//       }
       

//     }
//   );
// };

// const bcrypt = require("bcryptjs");
// const db = require("../config/db");
// const jwt = require("jsonwebtoken");
// const JWT_SECRET = process.env.JWT_SECRET || "mi_secreto_super_seguro";

// exports.login = async (req, res) => {
//   const { telefono, password } = req.body;
//   console.log("📩 Body:",req.body);

//   if (!telefono || !password) {
//     return res.status(400).json({ msg: "Faltan datos" });
//   }

//   await db.query(
//     "SELECT * FROM usuarios WHERE telefono = ?",
//     [telefono],
//     async (err, results) => {
//       if (err) return res.status(500).json({ msg: "Error del servidor" });

//       if (results.length === 0) return res.status(400).json({ msg: "Usuario no existe" });

//       const user = results[0];

//       try {
//         const valid = await bcrypt.compare(password, user.password);
//         if (!valid) return res.status(400).json({ msg: "Contraseña incorrecta" });

//         // 🔑 Generar token
//         const token = jwt.sign(
//           { user_id: user.user_id, telefono: user.telefono },
//           JWT_SECRET,
//           { expiresIn: "12h" }
//         );

//         res.json({
//           token,
//           user: {
//             user_id: user.user_id,
//             nombre: user.nombre,
//             identidad: user.identidad,
//             telefono: user.telefono,
//             saldo: user.saldo,
//           },
//         });

//         console.log("📩 Usuario:",res.data);

//       } catch (error) {
//         return res.status(500).json({ msg: "Error al validar contraseña" });
//       }
//     }
//   );
// };

// 

const bcrypt = require("bcryptjs");
const db = require("../config/db");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "mi_secreto_super_seguro";

exports.login = async (req, res) => {
  const { telefono, password } = req.body;
  console.log("📩 Body recibido:", req.body);

  if (!telefono || !password) {
    return res.status(400).json({ msg: "Faltan datos" });
  }

  try {
    // 🔹 Consultar usuario
    const [results] = await db.query("SELECT * FROM usuarios WHERE telefono = ?", [telefono]);
    if (results.length === 0) return res.status(400).json({ msg: "Usuario no existe" });

    const user = results[0];

    // 🔹 Validar contraseña
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ msg: "Contraseña incorrecta" });

    // 🔹 Generar token
    const token = jwt.sign(
      { user_id: user.user_id, telefono: user.telefono },
      JWT_SECRET,
      { expiresIn: "12h" }
    );

    // 🔹 Enviar respuesta
    res.json({
      token,
      user: {
        user_id: user.user_id,
        nombre: user.nombre,
        identidad: user.identidad,
        telefono: user.telefono,
        email:user.email,
        saldo: user.saldo,
      },
    });

    console.log("✅ Usuario logueado:", user);

  } catch (error) {
    console.error("❌ Error login:", error);
    res.status(500).json({ msg: "Error del servidor" });
  }
};
// ================= REGISTER =================
exports.register = async (req, res) => {
  const { nombre, identidad, telefono, email, password } = req.body;
 console.log("📩 BODY:", req.body);


  if (!nombre || !identidad || !telefono || !email || !password) {
    return res.status(400).json({ msg: "Faltan datos" });
  }

  // Validar duplicados
  await db.query(
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

        await db.query(
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