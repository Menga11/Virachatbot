import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

let pool = null;

export function getDB() {
  if (!pool) {
    console.log("Membuat koneksi database...");

    pool = mysql.createPool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,

      waitForConnections: true,
      connectionLimit: 5,
      queueLimit: 0,

      ssl: {
        rejectUnauthorized: false
      }
    });

    console.log("Database Pool Berhasil Dibuat");
  }

  return pool;
}

// Untuk mengecek koneksi database
export async function testConnection() {
  try {
    const db = getDB();

    const conn = await db.getConnection();

    console.log("=================================");
    console.log("DATABASE BERHASIL TERHUBUNG");
    console.log("Host :", process.env.DB_HOST);
    console.log("Database :", process.env.DB_NAME);
    console.log("User :", process.env.DB_USER);
    console.log("=================================");

    conn.release();
  } catch (err) {
    console.error("=================================");
    console.error("DATABASE GAGAL TERHUBUNG");
    console.error(err);
    console.error("=================================");
  }
}