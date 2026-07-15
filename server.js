import express from "express";
import path from "path";
import dotenv from "dotenv";
import fs from "fs";
import fetch from "node-fetch";
import db from "./db.js";
import levenshtein from "fast-levenshtein";

dotenv.config();

const app = express();

console.log("Express berhasil jalan");

/* =====================================================
   MIDDLEWARE
===================================================== */
app.use(express.json());
app.use(express.static(path.join(process.cwd(), "publik")));

/* =====================================================
   API KEYS (GEMINI)
===================================================== */
const API_KEYS = [
  process.env.API_KEY,
  process.env.API_KEY_2
].filter(Boolean);

/* =====================================================
   GEMINI API WORKER
===================================================== */
async function askGemini(body) {
  for (const apiKey of API_KEYS) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(body)
        }
      );

      const data = await response.json();

      if (response.ok) {
        return data;
      }

      if (response.status === 429 || data?.error?.message?.toLowerCase()?.includes("quota")) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue;
      }

      if (response.status === 503) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        continue;
      }
    } catch (error) {
      console.log("GEMINI FETCH ERROR:", error);
    }
  }
  return null;
}

/* =====================================================
   PREPROCESS TEXT & SYNONYMS
===================================================== */
function preprocess(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-zA-Z0-9\s]/g, "") // Pastikan ada \s di sini agar spasi TIDAK dihapus
    .replace(/\s+/g, " ")           // Menyatukan spasi ganda menjadi satu
    .trim();
}

function replaceSynonyms(text) {
  const synonyms = {
    "surat kelakuan baik": "skck",
    "buat skck": "skck",
    "bikin skck": "skck",
    "cara buat skck": "skck",
    "sim mati": "perpanjang sim",
    "kehilangan sim": "sim hilang",
    "buat sim": "sim",
    "jam buka": "jam pelayanan",
    "jam operasional": "jam pelayanan",
    "kontak humas": "kontak humas polda",
    "cara minta informasi": "permintaan informasi online"
  };

  for (const key in synonyms) {
    if (text.includes(key)) {
      text = text.replace(key, synonyms[key]);
    }
  }
  return text;
}

function naturalResponse(jawaban) {
  if (jawaban.toLowerCase().includes("ada yang bisa saya bantu")) return jawaban;
  const templates = [
    `Baik, berikut informasinya:\n${jawaban}`,
    `Berikut informasi yang dapat kami sampaikan:\n${jawaban}`,
    `${jawaban}`
  ];
  return templates[Math.floor(Math.random() * templates.length)];
}

/* =====================================================
   ROUTE PAGES
===================================================== */
app.get("/", (req, res) => res.sendFile(path.join(process.cwd(), "publik", "pages", "index.html")));
app.get("/multimedia", (req, res) => res.sendFile(path.join(process.cwd(), "publik", "pages", "multimedia.html")));
app.get("/pid", (req, res) => res.sendFile(path.join(process.cwd(), "publik", "pages", "pid.html")));
app.get("/pemnas", (req, res) => res.sendFile(path.join(process.cwd(), "publik", "pages", "pemnas.html")));
app.get("/kontak", (req, res) => res.sendFile(path.join(process.cwd(), "publik", "pages", "kontak.html")));

/* =====================================================
   TYPO DATABASE (LEVENSHTEIN)
===================================================== */
async function findBestMatch(userMessage) {
  const [rows] = await db.execute("SELECT * FROM chatbot_memory");
  const userWords = userMessage.split(" ");
  let bestMatch = null;
  let smallestDistance = 999;

  for (const row of rows) {
    const dbWords = row.pertanyaan.toLowerCase().split(" ");
    for (const word of userWords) {
      for (const dbWord of dbWords) {
        const distance = levenshtein.get(word, dbWord);
        if (distance < smallestDistance) {
          smallestDistance = distance;
          bestMatch = row;
        }
      }
    }
  }
  if (smallestDistance <= 2) return { match: bestMatch, distance: smallestDistance };
  return null;
}

/* =====================================================
   GOOGLE SEARCH API WORKER
===================================================== */
async function searchGoogleNews(keyword) {
  try {
    const apiKey = process.env.GOOGLE_API_KEY;
    const cx = process.env.GOOGLE_CX;

    if (!apiKey || !cx) return [];

    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(keyword)}&num=5`;
    const response = await fetch(url);
    if (!response.ok) return [];

    const data = await response.json();
    if (!data.items || !Array.isArray(data.items)) return [];

    return data.items.map(item => ({
      source: item.displayLink || "Google Search",
      title: item.title,
      link: item.link
    }));
  } catch (error) {
    return [];
  }
}

async function searchAllNews(keyword) {
  const hasilGoogle = await searchGoogleNews(keyword);
  const uniqueResults = [];
  const seenTitles = new Set();

  for (const item of hasilGoogle) {
    const key = item.title.toLowerCase().replace(/\s+/g, " ").trim();
    if (!seenTitles.has(key)) {
      seenTitles.add(key);
      uniqueResults.push(item);
    }
  }
  return uniqueResults.slice(0, 3);
}

function formatNewsResults(results) {
  if (!results || results.length === 0) return null;
  let reply = "🔎 Sumber berita terdeteksi dari pencarian Google:\n";
  results.forEach((item, index) => {
    reply += `\n${index + 1}. 📰 ${item.source}\n${item.title}\n🔗 ${item.link}\n`;
  });
  return reply.trim();
}

/* =====================================================
   INTENT MATCHING
===================================================== */
function isNewsIntent(userMessage) {
  const newsKeywords = [
    "berita", "narkoba", "penangkapan", "kasus", "begal",
    "curat", "curas", "sabu", "ganja", "curanmor",
    "pelecehan", "seksual", "judi", "cabul", "pembunuhan",
    "maling", "rampok", "pemerkosaan", "korupsi", "kriminal"
  ];
  return newsKeywords.some(keyword => userMessage.includes(keyword));
}

function getNewsKeyword(userMessage) {
  let cleanKeyword = userMessage
    .replace(/\b(berita|kasus|tentang|hari ini|di|polda|sumut)\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return cleanKeyword ? `${cleanKeyword} polda sumut` : "kriminal polda sumut";
}

/* =====================================================
   CHATBOT MAIN ENDPOINT
===================================================== */
app.post("/chat", async (req, res) => {
  try {
    if (!req.body || typeof req.body.message !== "string" || !req.body.message.trim()) {
      return res.status(400).json({ reply: "Pesan tidak boleh kosong." });
    }

    let userMessage = req.body.message;
    const originalMessage = userMessage; 
    userMessage = preprocess(userMessage);
    userMessage = replaceSynonyms(userMessage);

    if (userMessage === "halo" || userMessage === "hai" || userMessage === "hi") {
      return res.json({ reply: "Halo, saya VIRA 👋\nAda yang bisa saya bantu?" });
    }

    // 1. JALUR BERITA (Google Search API dengan Otomatis Fallback ke Gemini)
    if (isNewsIntent(userMessage)) {
      const keyword = getNewsKeyword(userMessage);
      const hasilBerita = await searchAllNews(keyword);
      const formatted = formatNewsResults(hasilBerita);

      if (formatted) {
        return res.json({ reply: formatted });
      }
      
      // JIKA GOOGLE API KOSONG/LIMIT -> Langsung minta bantuan Gemini AI mencari berita terbaru
      console.log("Pencarian Google kosong/limit, mengalihkan pencarian berita langsung ke Gemini AI...");
      
      const bodyBerita = {
        systemInstruction: {
          parts: [{
            text: `Kamu adalah VIRA, Chatbot resmi Humas Polda Sumut. User menanyakan berita kriminal terbaru yang tidak terindeks di sistem lokal. Gunakan basis pengetahuan umum real-time kamu untuk menjabarkan rincian atau info umum terkait kasus/topik "${originalMessage}" di wilayah Sumatera Utara secara profesional, singkat, dan berikan edukasi atau imbauan kamtibmas di akhir jawaban.`
          }]
        },
        contents: [{ role: "user", parts: [{ text: originalMessage }] }]
      };

      const dataBerita = await askGemini(bodyBerita);
      if (dataBerita) {
        const replyBerita = dataBerita?.candidates?.[0]?.content?.parts?.[0]?.text || "Informasi saat ini belum tersedia.";
        return res.json({ reply: replyBerita });
      }
    }

    /* ================= DATABASE SEARCH ================= */
    const [allRows] = await db.execute("SELECT * FROM chatbot_memory");
    let bestMatch = null;
    let highestScore = 0;
    const userWords = userMessage.split(" ");

    for (const row of allRows) {
      const dbQuestion = row.pertanyaan.toLowerCase();
      let score = 0;
      for (const word of userWords) {
        if (dbQuestion.split(" ").includes(word)) score++;
      }
      if (userMessage.includes(dbQuestion)) score += 2;
      if (score > highestScore) {
        highestScore = score;
        bestMatch = row;
      }
    }

    if (bestMatch && highestScore > 4) {
      let finalReply = naturalResponse(bestMatch.jawaban);
      if (bestMatch.link) finalReply += `\n\nDokumen terkait:\n${bestMatch.link}`;
      return res.json({ reply: finalReply });
    }

    const typoResult = await findBestMatch(userMessage);
    if (typoResult && userWords.length === 1 && typoResult.distance <= 1) {
      let finalReply = naturalResponse(typoResult.match.jawaban);
      if (typoResult.match.link) finalReply += `\n\nDokumen terkait:\n${typoResult.match.link}`;
      return res.json({ reply: finalReply });
    }

    // 2. FALLBACK UMUM (Jika bukan intent berita dan tidak ada di DB)
    const body = {
      systemInstruction: {
        parts: [{
          text: `Kamu adalah VIRA, Chatbot resmi Humas Polda Sumut. Jawab pertanyaan user mengenai layanan kepolisian, informasi umum dengan ramah, singkat, jelas, dan profesional.`
        }]
      },
      contents: [{ role: "user", parts: [{ text: originalMessage }] }]
    };

    const data = await askGemini(body);
    if (!data) return res.json({ reply: "Maaf, seluruh layanan informasi sedang padat. Silakan coba sesaat lagi." });

    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Informasi saat ini belum tersedia.";
    return res.json({ reply });

  } catch (error) {
    console.log("CHAT ERROR:", error);
    return res.status(500).json({ reply: "Terjadi kesalahan pada server" });
  }
});

/* =====================================================
   DATABASE SEEDER FROM JSON
===================================================== */
async function importDataJSON() {
  try {
    const filePath = path.resolve(process.cwd(), "publik", "data.json");
    if (!fs.existsSync(filePath)) return;
    const rawData = fs.readFileSync(filePath, "utf8");
    const data = JSON.parse(rawData);

    for (const item of data) {
      for (const pertanyaan of item.keyword) {
        const [cek] = await db.execute(`SELECT * FROM chatbot_memory WHERE pertanyaan = ?`, [pertanyaan.toLowerCase()]);
        if (cek.length === 0) {
          await db.execute(`INSERT INTO chatbot_memory (pertanyaan, jawaban, link) VALUES (?, ?, ?)`, [pertanyaan.toLowerCase(), item.jawaban, item.link || null]);
        }
      }
    }
    console.log("Import data JSON selesai");
  } catch (error) {
    console.log("Gagal import JSON:", error);
  }
}
importDataJSON();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server berjalan di port: ${PORT}`));

export default app;