import express from "express";
import { getDB } from "./db.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

const app = express();
app.use(express.json());

// Inisialisasi AI dengan instruksi yang ketat
const ai = new GoogleGenerativeAI(process.env.API_KEY).getGenerativeModel({ 
  model: "gemini-1.5-flash",
  systemInstruction: `Anda adalah VIRA, asisten virtual Humas Polda Sumut.
  TUGAS: Menjawab pertanyaan terkait kasus kriminal atau berita.
  ATURAN LINK: 
  1. HANYA boleh memberikan link berikut: 
     - https://humas.polri.go.id/
     - https://tribratanews.polri.go.id/
     - https://www.detik.com/
  2. DILARANG membuat atau menebak URL berita yang spesifik (misal: .../kasus-pembunuhan-x). 
  3. Gunakan link di atas sesuai kategori berita yang paling relevan.
  4. Jika tidak ada informasi spesifik, arahkan user ke salah satu link tersebut.`
});

app.post("/chat", async (req, res) => {
  const query = req.body.message || "";
  
  try {
    // 1. Cek database dulu (Prioritas jawaban akurat dari admin)
    const [rows] = await getDB().query(
      "SELECT jawaban FROM chatbot_memory WHERE ? LIKE CONCAT('%', pertanyaan, '%')", 
      [query.toLowerCase()]
    );

    if (rows.length > 0) {
      return res.json({ reply: rows[0].jawaban });
    }

    // 2. Jika tidak ada di DB, gunakan AI dengan instruksi ketat tadi
    const result = await ai.generateContent(query);
    res.json({ reply: result.response.text() });

  } catch (err) {
    console.error("Error:", err);
    res.json({ reply: "Mohon maaf, silakan kunjungi https://humas.polri.go.id/ untuk informasi resmi." });
  }
});

app.listen(3000, () => console.log("Server running"));