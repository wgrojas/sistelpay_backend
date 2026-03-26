const express = require("express");
const cors = require("cors");

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




app.listen(4000, () => {
  console.log("🚀 Servidor corriendo en puerto 4000");
});