import mysql from "mysql2/promise";

async function connectDB() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "chatbot_polda",
      port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
      ssl: process.env.DB_HOST ? { rejectUnauthorized: false } : null 
    });

    console.log("Database connected successfully!");

    // 🔥 TRIK SAKTI: Otomatis bikin tabel chatbot_memory kalau belum ada di Aiven
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS chatbot_memory (
        id INT AUTO_INCREMENT PRIMARY KEY,
        pertanyaan TEXT NOT EXISTS,
        jawaban TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;
    
    // Eksekusi pembuatan tabel langsung saat koneksi berhasil dibangun
    await connection.query(createTableQuery);
    console.log("✅ Tabel 'chatbot_memory' siap digunakan di cloud!");

    return connection;
  } catch (error) {
    console.error("Database connection failed:", error.message);
    
    // Buat objek database cadangan agar Vercel tidak error 500 saat DB down
    return {
      query: async () => [[]],
      execute: async () => [[]],
      on: () => {}
    }; 
  }
}

const db = await connectDB();

export default db;