import mysql from "mysql2/promise";

// Buat objek database cadangan biar kodingan lain gak crash membaca null.query()
const mockDb = {
  query: async () => {
    console.warn("⚠️ Berjalan dalam mode cadangan tanpa database.");
    return [[]]; 
  },
  execute: async () => {
    console.warn("⚠️ Berjalan dalam mode cadangan tanpa database.");
    return [[]];
  },
  on: () => {}
};

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
    return connection;
  } catch (error) {
    console.error("Database connection failed:", error.message);
    // GANTI return null MENJADI return mockDb BIAR VERCEL GAK EROR 500
    return mockDb; 
  }
}

const db = await connectDB();

export default db;