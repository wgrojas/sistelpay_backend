const express = require("express");
const cors = require("cors");
const db = require("./config/db");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const walletRoutes = require("./routes/walletRoutes");
const comprasRoutes = require("./routes/comprasRoutes");
const recibidoRoutes = require("./routes/recibidoRoutes");
const notificacionesRoutes = require("./routes/notificacionesRoutes");


const app = express();

app.use(cors());
app.use(express.json());

// 🟢 Ruta raíz para mensaje en navegador
app.get("/", (req, res) => {
  res.send("✅ Estás conectado a la API de SistelPay 🚀");
});

app.use("/api", authRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/compras", comprasRoutes);
app.use("/api/recibido", recibidoRoutes);
app.use("/api/notificaciones", notificacionesRoutes);

// Endpoint para traer todos los usuarios
app.get("/api/usuarios", async (req, res) => {
  console.log("📋 Consultando usuarios...");
  try {
    const [usuarios] = await db.query("SELECT * FROM usuarios ORDER BY user_id DESC");
    res.json(usuarios);
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
});

// Endpoint para buscar usuario por teléfono
app.get("/api/usuarios/:telefono", async (req, res) => {
  const { telefono } = req.params;
  try {
    const [usuario] = await db.query("SELECT * FROM usuarios WHERE telefono = ?", [telefono]);
    if (usuario.length === 0) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }
    res.json(usuario[0]);
  } catch (error) {
    console.error("Error al buscar usuario:", error);
    res.status(500).json({ error: "Error al buscar usuario" });
  }
});


// app.listen(4000, () => {
//   console.log("🚀 Servidor corriendo en puerto 4000");
// });

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));