import mysql from "mysql2/promise";

// Fungsi untuk membuat koneksi secara dinamis
async function connectDB() {
  try {
    const connection = await mysql.createConnection({
      // Membaca dari Environment Variables Vercel, kalau tidak ada baru pakai lokal laptop
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "chatbot_polda",
      port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
      ssl: process.env.DB_HOST ? { rejectUnauthorized: false } : null // Hanya pakai SSL kalau di cloud
    });

    console.log("Database connected successfully!");
    return connection;
  } catch (error) {
    console.error("Database connection failed:", error.message);
    // Supaya Vercel gak crash total (error 500), kita return null kalau gagal terhubung
    return null; 
  }
}

// Buat instance koneksi
const db = await connectDB();

export default db;