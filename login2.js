// login.js
const axios = require("axios");

// 🔹 Configuración del usuario de prueba
const TELEFONO = "3187621921"; // Cambia por tu teléfono de prueba
const PASSWORD = "12345";      // Cambia por tu contraseña de prueba

async function login() {
  try {
    console.log("⏳ Intentando login...");

    const res = await axios.post("http://localhost:4000/api/login", {
      telefono: TELEFONO,
      password: PASSWORD,
    }, {
      timeout: 5000, // evita que se quede colgado
    });

    if (!res.data) {
      console.log("❌ Respuesta vacía del servidor");
      return;
    }

    console.log("✅ Login exitoso!");
    console.log("Datos del usuario:");
    console.log(res.data);
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