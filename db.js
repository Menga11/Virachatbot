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

    // 🔥 Buat tabel secara otomatis di Aiven Cloud jika belum ada
    if (process.env.DB_HOST) {
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS chatbot_memory (
          id INT AUTO_INCREMENT PRIMARY KEY,
          pertanyaan TEXT,
          jawaban TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `;
      await connection.query(createTableQuery);
      console.log("✅ Tabel 'chatbot_memory' otomatis terbuat di cloud!");
    }

    return connection;
  } catch (error) {
    console.error("Database connection failed:", error.message);
    // Return mock object biar gak crash null.query()
    return {
      query: async () => [[]],
      execute: async () => [[]],
      on: () => {}
    }; 
  }
}

const db = await connectDB();

export default db;