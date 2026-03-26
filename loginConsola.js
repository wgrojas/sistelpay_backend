const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");
require("dotenv").config();
const readline = require("readline");

// Crear interfaz de consola
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Función para preguntar en consola
function pregunta(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function login(telefono, password) {
  try {
    const url = new URL(process.env.DATABASE_URL);

    const db = mysql.createPool({
      host: url.hostname,
      user: url.username,
      password: url.password,
      database: url.pathname.replace("/", ""),
      port: url.port || 3306,
      waitForConnections: true,
      connectionLimit: 5,
      ssl: { rejectUnauthorized: true } // obligatorio PlanetScale
    });

    // Buscar usuario por teléfono
    const [rows] = await db.query(
      "SELECT * FROM usuarios WHERE telefono = ?",
      [telefono]
    );

    if (rows.length === 0) {
      console.log("❌ Usuario no encontrado");
      return false;
    }

    const usuario = rows[0];

    // Comparar contraseña
    const passwordValida = await bcrypt.compare(password, usuario.password);
    if (!passwordValida) {
      console.log("❌ Contraseña incorrecta");
      return false;
    }

    console.log(`✅ Login exitoso! Bienvenido, ${usuario.nombre}`);
    console.table(usuario); // Muestra en consola los campos útiles
    return true;

  } catch (error) {
    console.error("Error en login:", error);
    return false;
  } finally {
    rl.close();
  }
}

// --- Ejecutar login interactivo ---
(async () => {
  const telefono = await pregunta("Ingrese su teléfono: ");
  const password = await pregunta("Ingrese su contraseña: ");
  await login(telefono.trim(), password.trim());
})();