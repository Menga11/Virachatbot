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
      console.log("TOTAL GOOGLE ITEM:", data.items?.length || 0);

      if (response.ok) {
        console.log(`Menggunakan API ${API_KEYS.indexOf(apiKey) + 1}`);
        return data;
      }

      if (
        response.status === 429 ||
        data?.error?.message?.toLowerCase()?.includes("quota")
      ) {
        console.log(`API ${API_KEYS.indexOf(apiKey) + 1} quota habis`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue;
      }

      if (response.status === 503) {
        console.log(`API ${API_KEYS.indexOf(apiKey) + 1} sibuk`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        continue;
      }

      console.log("GEMINI ERROR:", data);
    } catch (error) {
      console.log("GEMINI FETCH ERROR:", error);
    }
  }

  console.log("Semua API telah mencapai limit");
  return null;
}

/* =====================================================
   PREPROCESS TEXT & SYNONYMS (DI-FIX AGAR SPASI TIDAK HILANG)
===================================================== */
function preprocess(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-zA-Z0-9\s]/g, "") // Hanya hapus simbol, amankan spasi (\s)
    .replace(/\s+/g, " ")           // Satukan spasi ganda
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
    "cara minta informasi": "permintaan informasi online",
    "curanwor": "curanmor"
  };

  for (const key in synonyms) {
    if (text.includes(key)) {
      text = text.replace(key, synonyms[key]);
    }
  }
  return text;
}

function isGreeting(text) {
  const greetings = ["halo", "hai", "hi", "selamat pagi", "selamat siang", "selamat sore", "p", "permisi"];
  return greetings.includes(text);
}

/* =====================================================
   NATURAL RESPONSE DATABASE
===================================================== */
function naturalResponse(jawaban) {
  if (jawaban.toLowerCase().includes("ada yang bisa saya bantu")) {
    return jawaban;
  }

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
app.get("/", (req, res) => {
  res.sendFile(path.join(process.cwd(), "publik", "pages", "index.html"));
});

app.get("/multimedia", (req, res) => {
  res.sendFile(path.join(process.cwd(), "publik", "pages", "multimedia.html"));
});

app.get("/pid", (req, res) => {
  res.sendFile(path.join(process.cwd(), "publik", "pages", "pid.html"));
});

app.get("/pemnas", (req, res) => {
  res.sendFile(path.join(process.cwd(), "publik", "pages", "pemnas.html"));
});

app.get("/kontak", (req, res) => {
  res.sendFile(path.join(process.cwd(), "publik", "pages", "kontak.html"));
});

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

  if (smallestDistance <= 2) {
    return {
      match: bestMatch,
      distance: smallestDistance
    };
  }
  return null;
}

/* =====================================================
   GOOGLE SEARCH API WORKER
===================================================== */
async function searchGoogleNews(keyword, site = "") {
  try {
    const apiKey = process.env.GOOGLE_API_KEY;
    const cx = process.env.GOOGLE_CX;

    let query = `("Polda Sumut" OR "Polda Sumatera Utara" OR "Polisi Sumut") ${keyword}`;

    if (site) {
      query = `site:${site} (${keyword}) ("Polda Sumut" OR "Polda Sumatera Utara" OR "Sumatera Utara")`;
    }


    console.log("KEYWORD CARI:", keyword);
    console.log("QUERY:", query);

    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(query)}&num=5`;

    const response = await fetch(url);

    if (!response.ok) {
      console.log("Google Search Error:", response.status);
      return [];
    }

    const data = await response.json();

    if (!data.items) {
      return [];
    }


    // Jangan filter terlalu ketat
    const hasil = data.items;


    return hasil.map(item => ({
      title: item.title,
      link: item.link,
      source: item.displayLink
    }));


  } catch (err) {
    console.log("SEARCH ERROR:", err);
    return [];
  }
}

/* =====================================================
   GOOGLE NEWS AGGREGATOR
===================================================== */
async function searchAllNews(keyword) {

  const sites = [
    "tribratanews.sumut.polri.go.id",
    "tbnews.polda.sumut.polri.go.id",
    "humas.polri.go.id",
    "detik.com",
    "kompas.com",
    "antaranews.com",
    "cnnindonesia.com",
    "tempo.co"
];

  let semuaBerita = [];

  for (const site of sites) {

    console.log("Mencari di:", site);

    const berita = await searchGoogleNews(keyword, site);

    if (berita.length > 0) {
      console.log("Ditemukan di:", site);

      semuaBerita.push(...berita);
    }

  }

  return semuaBerita.slice(0,5);
}

/* =====================================================
   INTENT MATCHING (DINAMIS & AKURAT)
===================================================== */
function isNewsIntent(userMessage) {

    console.log("Cek Intent Berita:", userMessage);

    const newsKeywords = [
    "berita",
    "kasus",
    "narkoba",
    "sabu",
    "ganja",
    "ekstasi",
    "pelecehan",
    "pencurian",
    "curat",
    "curas",
    "curanmor",
    "begal",
    "perampokan",
    "pembunuhan",
    "korupsi",
    "kriminal",
    "penipuan",
    "penganiayaan",
    "pemerkosaan",
    "penangkapan",
    "tersangka",
    "terbaru",
    "update",
    "informasi"
  ];

    const hasil = newsKeywords.some(keyword =>
        userMessage.includes(keyword)
    );

    console.log("Intent:", hasil);

    return hasil;
}

function getNewsKeyword(userMessage) {

    let keyword = userMessage
        .replace(/\b(berita|kasus|terbaru|hari ini|tentang|yang|di|oleh|dilakukan|lakukan|polisi|polda|sumut|sumatera utara)\b/g, "")
        .replace(/\s+/g, " ")
        .trim();


    if (!keyword) {
        keyword = "kriminal polda sumut";
    }

    return keyword;
}

function formatNewsResults(results) {
  if (!results || results.length === 0) {
    return null;
  }

  let reply = "📰 Berikut berita yang ditemukan:\n\n";

  results.forEach((item, index) => {
    reply += `${index + 1}. ${item.title}\n`;
    reply += `Sumber: ${item.source}\n`;
    reply += `Link: ${item.link}\n\n`;
  });

  return reply.trim();
}

/* =====================================================
   CHATBOT MAIN ENDPOINT
===================================================== */
app.post("/chat", async (req, res) => {
  try {
    if (!req.body || typeof req.body.message !== "string" || !req.body.message.trim()) {
      return res.status(400).json({ reply: "Pesan tidak boleh kosong." });
    }

    const originalMessage = req.body.message; // Simpan pesan asli tanpa manipulasi untuk Gemini
    let userMessage = preprocess(originalMessage);
    userMessage = replaceSynonyms(userMessage);

    console.log("=================================");
    console.log("Pesan Masuk:", userMessage);

    if (isGreeting(userMessage)) {
      return res.json({ reply: "Halo, saya VIRA 👋\nAda yang bisa saya bantu?" });
    }

    // 1. EKSEKUSI JALUR BERITA (Google Search API + Gemini Fallback Terarah)
    if (isNewsIntent(userMessage)) {

    const keyword = getNewsKeyword(userMessage);
    console.log("KEYWORD GOOGLE SEARCH JALAN:", keyword);

    const hasilBerita = await searchAllNews(keyword);

    console.log("Keyword:", keyword);
    console.log("Jumlah berita:", hasilBerita.length);
    console.log(hasilBerita);

    if (hasilBerita.length > 0) {
        return res.json({
            reply: formatNewsResults(hasilBerita)
        });
    }

    return res.json({
        reply: `Maaf, berita mengenai "${keyword}" belum ditemukan pada sumber berita yang digunakan.

Sumber pencarian:
• Tribrata News Sumut
• Humas Polri
• Detik
• Kompas
• Antara`
    });
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

    console.log("BEST SCORE DATABASE:", highestScore);

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

    /* ================= GEMINI FALLBACK UMUM ================= */
    console.log("Mengambil jawaban umum dari Gemini");

    const body = {
      systemInstruction: {
        parts: [{
          text: `Kamu adalah VIRA. Chatbot resmi Humas Polda Sumut. Jawab dengan singkat dan profesional. Jika informasi tidak diketahui atau tidak tersedia, katakan bahwa informasi tersebut belum tersedia.`
        }]
      },
      contents: [{ role: "user", parts: [{ text: originalMessage }] }]
    };

    const data = await askGemini(body);
    if (!data) return res.json({ reply: "Seluruh layanan informasi sedang padat. Silakan coba beberapa saat lagi." });

    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Informasi tidak tersedia";
    return res.json({ reply });

  } catch (error) {
    console.log("CHAT ERROR:", error);
    return res.status(500).json({
        reply: "Terjadi kesalahan pada server"
    });
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
      const keywords = item.keyword;
      const jawaban = item.jawaban;
      const link = item.link || null;

      for (const pertanyaan of keywords) {
        const [cek] = await db.execute(`SELECT * FROM chatbot_memory WHERE pertanyaan = ?`, [pertanyaan.toLowerCase()]);
        if (cek.length === 0) {
          await db.execute(`INSERT INTO chatbot_memory (pertanyaan, jawaban, link) VALUES (?, ?, ?)`, [pertanyaan.toLowerCase(), jawaban, link]);
        }
      }
    }
    console.log("Import data JSON selesai");
  } catch (error) {
    console.log("Gagal import JSON:", error);
  }
}

importDataJSON();

/* =====================================================
   STARTUP & LISTEN
===================================================== */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("=================================");
  console.log(`Server berjalan di port: ${PORT}`);
  console.log("=================================");
});

export default app;