import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import fetch from "node-fetch";
import { getDB } from "./db.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(process.cwd(), "publik")));

// RUTE UTAMA: Mengarahkan halaman awal ke publik/pages/index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(process.cwd(), "publik", "pages", "index.html"));
});

/* =====================================================
   DATABASE SEEDER & SCHEMA FIXER
===================================================== */
// Tambahkan fungsi ini untuk memastikan tabel dan data ada
async function initializeDatabase() {
    const db = await getDB(); // Pastikan ambil instance db-nya
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS chatbot_memory (
                id INT AUTO_INCREMENT PRIMARY KEY,
                pertanyaan TEXT,
                jawaban TEXT,
                link VARCHAR(255) NULL
            );
        `);

        const [rows] = await db.query("SELECT COUNT(*) as count FROM chatbot_memory");
        
        if (rows[0].count === 0) {
            await db.query(`
                INSERT INTO chatbot_memory (pertanyaan, jawaban, link) 
                VALUES ('kasus narkoba', 'Untuk informasi kasus narkoba di wilayah hukum Polda Sumut, silakan hubungi layanan hotline 110 atau kunjungi website resmi kami.', 'https://sumut.polri.go.id');
            `);
            console.log("✅ Tabel dan data contoh berhasil disiapkan.");
        }
    } catch (error) {
        console.error("❌ Gagal inisialisasi database:", error.message);
    }
}
initializeDatabase()
/* =====================================================
   INTENT & NEWS DETECTOR
===================================================== */
function isNewsIntent(userMessage) {
  const newsKeywords = [
    "berita", "kasus", "narkoba", "sabu", "ganja", "ekstasi",
    "pelecehan", "pencurian", "curat", "curas", "curanmor",
    "begal", "perampokan", "pembunuhan", "korupsi", "kriminal",
    "penipuan", "penganiayaan", "pemerkosaan", "penangkapan",
    "tersangka", "terbaru", "update", "pengungkapan"
  ];
  return newsKeywords.some(keyword => userMessage.toLowerCase().includes(keyword));
}

/* =====================================================
   GEMINI SEARCH GROUNDING (BROWSER BERITA)
===================================================== */
async function dapatkanBeritaGemini(keyword) {
  try {
    const apiKey = process.env.API_KEY || process.env.API_KEY_2;
    if (!apiKey) {
      console.warn("API Key tidak ditemukan di environment variable.");
      return null;
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Temukan 1 berita paling hangat, valid, dan riil mengenai "${keyword} di Sumatera Utara atau Polda Sumut" yang terjadi baru-baru ini. 
            Tuliskan ringkasan berita tersebut maksimal 3 kalimat secara informatif sebagai VIRA, Chatbot Humas Polda Sumut. 
            Sertakan juga satu tautan/link berita asli yang valid dari media kredibel (seperti detik.com, kompas.com, atau tribunnews) di bagian paling bawah dengan format: "Sumber berita: [Nama Media](URL)"`
          }]
        }],
        tools: [{ googleSearch: {} }]
      })
    });

    const data = await response.json();
    if (data.candidates && data.candidates[0].content.parts[0].text) {
      return data.candidates[0].content.parts[0].text;
    }
    return null;
  } catch (error) {
    console.error("Gagal mendapatkan berita via Gemini Search:", error);
    return null;
  }
}

/* =====================================================
   GEMINI AI CHAT (FALLBACK)
===================================================== */
async function tanyaGemini(userMessage) {
  try {
    const apiKey = process.env.API_KEY || process.env.API_KEY_2;
    if (!apiKey) return "Halo! Mohon maaf, API Key AI VIRA belum dikonfigurasi dengan benar di Vercel.";

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const promptSystem = `Anda adalah VIRA, maskot Chatbot Humas Polda Sumut yang ramah, sopan, dan informatif. 
    Gunakan bahasa Indonesia yang santun. Jawab pesan user dengan informasi kamtibmas atau pelayanan polisi yang relevan.
    Pesan user: "${userMessage}"`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptSystem }] }]
      })
    });

    const data = await response.json();
    if (data.candidates && data.candidates[0].content.parts[0].text) {
      return data.candidates[0].content.parts[0].text;
    }
    return "Maaf, saat ini saya belum bisa memproses jawaban tersebut. Ada hal lain yang bisa VIRA bantu?";
  } catch (error) {
    console.error("Gagal menghubungi Gemini:", error);
    return "Halo! Mohon maaf, layanan AI VIRA sedang mengalami gangguan koneksi.";
  }
}

/* =====================================================
   ROUTE: UTAMA (CHAT HANDLER)
===================================================== */
app.post("/chat", async (req, res) => {
    const userQuery = req.body.message;
    const db = await getDB(); // Pastikan ambil instance db-nya

    // 1. Cek database dulu
    const [rows] = await db.query(
        "SELECT * FROM chatbot_memory WHERE pertanyaan LIKE ?", 
        [`%${userQuery}%`]
    );

    if (rows.length > 0) {
        res.json({ reply: rows[0].jawaban });
    } 
    // 2. Jika tidak ada di database, cek apakah itu pertanyaan berita (gunakan AI)
    else if (isNewsIntent(userQuery)) {
        const berita = await dapatkanBeritaGemini(userQuery);
        res.json({ reply: berita || "Maaf, saya tidak menemukan berita terbaru terkait hal tersebut." });
    } 
    // 3. Jika bukan berita, gunakan chat biasa (fallback)
    else {
        const jawabanAI = await tanyaGemini(userQuery);
        res.json({ reply: jawabanAI });
    }
});

// Start Lokal (hanya jalan jika bukan di Vercel)
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

export default app;