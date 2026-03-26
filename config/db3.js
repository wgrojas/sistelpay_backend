// db.js
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

// Crear conexión a PlanetScale usando DATABASE_URL del .env
const db = await mysql.createConnection(process.env.DATABASE_URL);

console.log("✅ Conexión a la base de datos establecida");

export default db;