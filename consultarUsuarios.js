// consultarUsuarios.js
const mysql = require("mysql2/promise");
require("dotenv").config();

async function main() {
  try {
    // Parsear DATABASE_URL
    const url = new URL(process.env.DATABASE_URL);

    // Crear conexión pool
    const db = mysql.createPool({
      host: url.hostname,
      user: url.username,
      password: url.password,
      database: url.pathname.replace("/", ""),
      port: url.port || 3306,
      waitForConnections: true,
      connectionLimit: 5,
      ssl: {
       rejectUnauthorized: true, // asegura que el certificado sea válido
      },
    });

    // Consulta de todos los usuarios
    const [usuarios] = await db.query("SELECT * FROM usuarios ORDER BY user_id ASC");

    console.log("Usuarios en la base de datos:");
    console.table(usuarios); // Muestra en formato tabla en consola

    // Cerrar conexión
    await db.end();
  } catch (error) {
    console.error("Error al consultar usuarios:", error);
  }
}

// Ejecutar función
main();

// consultarUsuarios.js
// const mysql = require("mysql2/promise");
// require("dotenv").config();
// const fs = require("fs");
// const path = require("path");

// async function main() {
//   try {
//     const url = new URL(process.env.DATABASE_URL);

//     // Pool con SSL
//     const db = mysql.createPool({
//       host: url.hostname,
//       user: url.username,
//       password: url.password,
//       database: url.pathname.replace("/", ""),
//       port: url.port || 3306,
//       waitForConnections: true,
//       connectionLimit: 5,
//       ssl: {
//         rejectUnauthorized: true, // asegura que el certificado sea válido
//       },
//     });

//     const [usuarios] = await db.query("SELECT * FROM usuarios ORDER BY user_id ASC");

//     console.log("Usuarios en la base de datos:");
//     console.table(usuarios);

//     await db.end();
//   } catch (error) {
//     console.error("Error al consultar usuarios:", error);
//   }
// }

// main();
