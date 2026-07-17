import mysql from "mysql2/promise";

let pool = null;

export function getDB() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: Number(process.env.DB_PORT) || 3306,
      ssl: { rejectUnauthorized: false }, // Penting untuk Aiven/Cloud DB
      waitForConnections: true,
      connectionLimit: 5, // Kecilkan limit untuk lingkungan Serverless
      queueLimit: 0
    });
    console.log("Database Connection Pool Initialized!");
  }
  return pool;
}