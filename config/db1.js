// const mysql = require("mysql2");

// const db = mysql.createConnection({
//   host: "localhost",
//   user: "root",
//   password: "",
//   database: "sistelpay"
// });

// // 🔹 Conectar y mostrar mensaje en consola
// db.connect((err) => {
//   if (err) {
//     console.error("❌ Error al conectar a MySQL:", err.message);
//   } else {
//     console.log("✅ Conectado a la base de datos MySQL 'sistelpay'");
//   }
// });

// module.exports = db;

// require("dotenv").config(); // 🔹 Cargar variables de .env
// const mysql = require("mysql2");

// const db = mysql.createConnection({
//   host: process.env.DB_HOST,        // Ej: "your-database-host.planetscale.com"
//   user: process.env.DB_USER,        // Ej: "username"
//   password: process.env.DB_PASSWORD,// Ej: "password"
//   database: process.env.DB_NAME,    // Ej: "sistelpay"
//   ssl: {
//     rejectUnauthorized: true
//   }
// });

// // 🔹 Conectar y mostrar mensaje en consola
// db.connect((err) => {
//   if (err) {
//     console.error("❌ Error al conectar a MySQL:", err.message);
//   } else {
//     console.log(`✅ Conectado a la base de datos MySQL '${process.env.DB_NAME}'`);
//   }
// });

// module.exports = db;

require("dotenv").config(); // 🔹 Cargar variables de .env
const mysql = require("mysql2");

const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "sistelpay",
  // 🔹 Para local, no se necesita SSL
});

// 🔹 Conectar y mostrar mensaje en consola
db.connect((err) => {
  if (err) {
    console.error("❌ Error al conectar a MySQL:", err.message);
  } else {
    console.log(`✅ Conectado a la base de datos MySQL '${process.env.DB_NAME || "sistelpay"}'`);
  }
});

module.exports = db;