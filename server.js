import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import fetch from "node-fetch";
import db from "./db.js";

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
async function setupDatabase() {
  try {
    // 1. Pastikan kolom link ada dulu
    await db.query("ALTER TABLE chatbot_memory ADD COLUMN IF NOT EXISTS link VARCHAR(255) NULL;");
    console.log("✅ Struktur tabel siap.");

    // 2. Baru jalankan import data
    const filePath = path.resolve(process.cwd(), "publik", "data.json");
    if (!fs.existsSync(filePath)) return;
    
    const rawData = fs.readFileSync(filePath, "utf8");
    const data = JSON.parse(rawData);

    for (const item of data) {
      const keywords = item.keyword;
      const jawaban = item.jawaban;
      const link = item.link || null;

      for (const pertanyaan of keywords) {
        const [cek] = await db.query(`SELECT * FROM chatbot_memory WHERE pertanyaan = ?`, [pertanyaan.toLowerCase()]);
        if (cek.length === 0) {
          await db.query(`INSERT INTO chatbot_memory (pertanyaan, jawaban, link) VALUES (?, ?, ?)`, [pertanyaan.toLowerCase(), jawaban, link]);
        }
      }
    }
    console.log("✅ Import data JSON selesai");
  } catch (error) {
    console.log("❌ Gagal setup database:", error);
  }
}

// Jalankan saat startup
setupDatabase();
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
  const inputPesan = req.body.pesan || req.body.message || req.body.text;

  if (!inputPesan) {
    return res.status(400).json({ error: "Pesan tidak boleh kosong" });
  }

  const userMessage = inputPesan.trim().toLowerCase();

  // ⚡ PROTEKSI 1: Fitur Balasan Cepat Kata Sapaan (Bypass Instan)
  const salamLokal = ["halo", "hi", "p", "siang", "pagi", "sore", "malam", "test", "tes", "assalamualaikum", "halo vira"];
  if (salamLokal.includes(userMessage)) {
    const sapaanRes = "Halo! Saya VIRA, asisten virtual Humas Polda Sumut. Ada yang bisa saya bantu hari ini?";
    return res.json({ jawaban: sapaanRes, reply: sapaanRes });
  }

  try {
    // 1. CEK INTENT BERITA TERLEBIH DAHULU
    if (isNewsIntent(userMessage)) {
      console.log(`[News] Mendeteksi pencarian berita: "${userMessage}"`);
      const beritaTerbaru = await dapatkanBeritaGemini(userMessage);
      
      if (beritaTerbaru) {
        return res.json({ jawaban: beritaTerbaru, reply: beritaTerbaru });
      } else {
        // Fallback Teks Berita Lokal jika API Key Kosong/Gagal Grounding
        const beritaFallback = `Mengenai informasi "${inputPesan}", Anda dapat memantau rilis kasus resmi serta pembaruan kamtibmas terkini secara langsung melalui portal berita resmi Humas Polda Sumut di https://tribratanews.sumut.polri.go.id/`;
        return res.json({ jawaban: beritaFallback, reply: beritaFallback });
      }
    }

    // 2. CEK DATABASE (Aiven MySQL)
    try {
      if (db) {
        const queryDb = "SELECT jawaban, link FROM chatbot_memory WHERE pertanyaan LIKE ?";
        const [rows] = await db.query(queryDb, [`%${userMessage}%`]);

        if (rows && rows.length > 0) {
          const dataMatch = rows[0];
          let responsFinal = dataMatch.jawaban;
          if (dataMatch.link) {
            responsFinal += `\n\nUntuk informasi lebih lanjut, kunjungi: ${dataMatch.link}`;
          }
          return res.json({ jawaban: responsFinal, reply: responsFinal });
        }
      }
    } catch (dbError) {
      console.error("Database error bypass:", dbError.message);
    }

    // 3. FALLBACK KE GEMINI STANDAR
    console.log(`[Fallback] Menghubungi Gemini untuk: "${userMessage}"`);
    const jawabanAI = await tanyaGemini(userMessage);
    return res.json({ jawaban: jawabanAI, reply: jawabanAI });

  } catch (error) {
    console.error("ERROR TOTAL PADA UTAMA CHAT:", error); 
    const fallbackPesan = "Halo! Mohon maaf, sistem VIRA sedang disesuaikan. Silakan ulangi pertanyaan Anda beberapa saat lagi.";
    res.json({ jawaban: fallbackPesan, reply: fallbackPesan });
  }
});

/* =====================================================
   STARTUP & LISTEN
===================================================== */
const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log("=================================");
    console.log(`Server lokal berjalan di port: ${PORT}`);
    console.log("=================================");
  });
}

export default app;