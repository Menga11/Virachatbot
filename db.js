import mysql from "mysql2/promise";

let pool = null;

// Fungsi untuk mendapatkan koneksi database yang selalu siap (Reusable Pool)
export function getDB() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "chatbot_polda",
      port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
      ssl: process.env.DB_HOST ? { rejectUnauthorized: false } : null,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    console.log("Database Connection Pool Initialized!");
    
    // Jalankan pembuatan tabel secara otomatis di background
    createTableIfNotExist(pool);
  }
  return pool;
}

// Fungsi internal membuat tabel + kolom link
async function createTableIfNotExist(dbPool) {
  try {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS chatbot_memory (
        id INT AUTO_INCREMENT PRIMARY KEY,
        pertanyaan TEXT,
        jawaban TEXT,
        link TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;
    await dbPool.query(createTableQuery);
    console.log("✅ Tabel 'chatbot_memory' (dengan kolom link) siap digunakan!");
  } catch (error) {
    console.error("❌ Gagal membuat tabel otomatis:", error.message);
  }
}

// Default export berupa pool agar kecocokan kode lama tetap terjaga
const db = getDB();
export default db;