import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

let pool = null;

export function getDB() {
  if (!pool) {
    console.log("Membuat koneksi database...");

    const config = {
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,

      waitForConnections: true,
      connectionLimit: 5,
      queueLimit: 0
    };

    // Aktifkan SSL hanya jika DB_SSL=true
    if (process.env.DB_SSL === "true") {
      config.ssl = {
        rejectUnauthorized: false
      };
    }

    pool = mysql.createPool(config);

    console.log("Database Pool Berhasil Dibuat");
  }

  return pool;
}

export async function testConnection() {
  try {
    const db = getDB();
    const conn = await db.getConnection();

    console.log("=================================");
    console.log("DATABASE BERHASIL TERHUBUNG");
    console.log("Host     :", process.env.DB_HOST);
    console.log("Database :", process.env.DB_NAME);
    console.log("User     :", process.env.DB_USER);
    console.log("SSL      :", process.env.DB_SSL);
    console.log("=================================");

    conn.release();
  } catch (err) {
    console.error("=================================");
    console.error("DATABASE GAGAL TERHUBUNG");
    console.error("Message :", err.message);
    console.error("Code    :", err.code);
    console.error(err);
    console.error("=================================");
  }
}