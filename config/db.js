const mysql = require("mysql2/promise");
require("dotenv").config();

// Parsear DATABASE_URL de PlanetScale
const url = new URL(process.env.DATABASE_URL);

const db = mysql.createPool({
  host: url.hostname,
  user: url.username,
  password: url.password,
  database: url.pathname.replace("/", ""),
  port: url.port || 3306,
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
  ssl: {
    rejectUnauthorized: true,
  },
  // connectTimeout: 20000,
});

// Verificar conexión
(async () => {
  try {
    const connection = await db.getConnection();
    console.log("✅ Conectado a PlanetScale correctamente");
    connection.release();
  } catch (err) {
    console.error("❌ Error conectando a PlanetScale:", err);
  }
})();

module.exports = db;