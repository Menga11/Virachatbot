import mysql from "mysql2/promise";
import fs from "fs";

async function main() {
  console.log("⏳ Menghubungkan ke cloud Aiven...");
  
  const connection = await mysql.createConnection({
    host: "mysql-virachatbot-virachatbot.l.aivencloud.com",
    user: "avnadmin",
    password: "SUDAH_SUKSES_IMPORT_COK", 
    database: "defaultdb",
    port: 24495,
    ssl: { rejectUnauthorized: false },
    multipleStatements: true 
  });

  try {
    console.log("🧹 Membersihkan tabel kosong lama...");
    await connection.query("DROP TABLE IF EXISTS chatbot_memory;");

    const sqlFileContent = fs.readFileSync("chatbot_memory.sql", "utf8"); 
    
    console.log("🚀 Sedang menembak data chatbot ke cloud Aiven...");
    await connection.query(sqlFileContent);
    
    console.log("🎉 BERHASIL COK! Semua data beneran udah mendarat aman di cloud!");
  } catch (error) {
    console.error("❌ Terjadi eror:", error.message);
  } finally {
    await connection.end();
  }
}

main();