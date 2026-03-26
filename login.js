// login.js
const axios = require("axios");
const readline = require("readline-sync");

async function main() {
  try {
    console.log("🔐 Iniciar sesión en SistelPay");

    // Pedir teléfono y contraseña en la terminal
    const telefono = readline.question("Teléfono: ");
    const password = readline.question("Contraseña: ", { hideEchoBack: true });

    if (!telefono || !password) {
      console.log("❌ Debes ingresar teléfono y contraseña");
      return;
    }

    // Llamada al backend
    const res = await axios.post("http://localhost:4000/api/login", {
      telefono,
      password,
    });

    if (!res.data || !res.data.token) {
      console.log("❌ Respuesta inválida del servidor");
      return;
    }

    console.log("✅ Login exitoso!");
    console.log("Nombre:", res.data.nombre);
    console.log("Teléfono:", res.data.telefono);
    console.log("Saldo:", res.data.saldo.toLocaleString());
    console.log("Token:", res.data.token);
  } catch (error) {
    if (error.response) {
      console.log("❌ Error:", error.response.data.msg || error.response.statusText);
    } else if (error.code === "ECONNREFUSED") {
      console.log("❌ No se pudo conectar al backend. ¿Está corriendo el servidor?");
    } else {
      console.log("❌ Error:", error.message);
    }
  }
}

main();