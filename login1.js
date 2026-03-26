// login.js
const axios = require("axios");
const readline = require("readline");

// Crear interfaz de lectura en terminal
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Función para preguntar algo en terminal y esperar respuesta
const pregunta = (query) => new Promise((resolve) => rl.question(query, resolve));

async function login() {
  try {
    console.log("🔹 SISTELPAY LOGIN 🔹");

    // Pedir teléfono
    let telefono = await pregunta("Ingresa tu teléfono: ");
    while (!/^\d+$/.test(telefono)) {
      telefono = await pregunta("Número inválido. Ingresa solo dígitos: ");
    }

    // Pedir contraseña
    let password = await pregunta("Ingresa tu contraseña: ");
    while (!password) {
      password = await pregunta("La contraseña no puede estar vacía. Ingresa tu contraseña: ");
    }

    rl.close();

    console.log("\n⏳ Intentando login...");

    const res = await axios.post(
      "http://localhost:4000/api/login",
      { telefono, password },
      { timeout: 5000 }
    );

    if (!res.data) {
      console.log("❌ Respuesta vacía del servidor");
      return;
    }

    console.log("✅ Login exitoso!");
    console.log("Datos del usuario:");
    console.log(res.data);

    // Guardar token si existe
    if (res.data.token) {
      console.log("🔑 Token recibido:", res.data.token);
    } else {
      console.log("⚠️ No se recibió token en la respuesta");
    }

  } catch (error) {
    if (error.response) {
      console.log("❌ Error del servidor:", error.response.data);
    } else if (error.request) {
      console.log("❌ No hay respuesta del servidor. ¿Está corriendo la API?");
    } else {
      console.log("❌ Error:", error.message);
    }
  }
}

// Ejecutar login
login();