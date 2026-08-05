import express from "express";
import path from "path";
import dotenv from "dotenv";
import fs from "fs";
import fetch from "node-fetch";
import { getDB, testConnection } from "./db.js";
import levenshtein from "fast-levenshtein";

dotenv.config();

const app = express();

const db = getDB();

testConnection();

console.log("Express berhasil jalan");

/* =====================================================
   MIDDLEWARE & CONFIGURATION
===================================================== */
app.use(express.json());
app.use(express.static(path.join(process.cwd(), "publik")));

const API_KEYS = [
  process.env.API_KEY,
  process.env.API_KEY_2
].filter(Boolean);

/* =====================================================
   GEMINI API FALLBACK
===================================================== */
async function askGemini(body) {
  for (const apiKey of API_KEYS) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        }
      );

      const data = await response.json();

      if (response.ok) {
        console.log(`Menggunakan API ${API_KEYS.indexOf(apiKey) + 1}`);
        return data;
      }

      if (response.status === 429 || data?.error?.message?.toLowerCase()?.includes("quota")) {
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
   TEXT PROCESSING & CLEANING
===================================================== */
function preprocess(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^\w\s]/gi, "")
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

function cleanHTML(text = "") {
  return String(text)
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&#8211;/g, "-")
    .replace(/&#8217;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function scoreNews(title, keyword) {
  const text = title.toLowerCase();
  const words = keyword.toLowerCase().split(/\s+/).filter(Boolean);
  let score = 0;

  for (const word of words) {
    if (text.includes(word)) {
      score += 3;
    }
  }

  if (text.includes(keyword.toLowerCase())) {
    score += 5;
  }

  return score;
}

function naturalResponse(jawaban = "") {
  jawaban = String(jawaban || "");

  if (jawaban.toLowerCase().includes("ada yang bisa saya bantu")) {
    return jawaban;
  }

  const templates = [
    `Baik, berikut informasinya:\n${jawaban}`,
    `Berikut informasi yang dapat kami sampaikan:\n${jawaban}`,
    `Informasi yang Anda butuhkan:\n${jawaban}`,
    jawaban
  ];

  return templates[Math.floor(Math.random() * templates.length)];
}

/* =====================================================
   ROUTING PAGES
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
   DATABASE LEVENSHTEIN (TYPO MATCH)
===================================================== */
async function findBestMatch(userMessage) {
  const [rows] = await db.execute("SELECT * FROM chatbot_memory");

  const userWords = String(userMessage || "")
    .toLowerCase()
    .split(/\s+/);

  let bestMatch = null;
  let smallestDistance = 999;

  for (const row of rows) {

    const pertanyaan = String(row.pertanyaan || "").toLowerCase();

    if (!pertanyaan) continue;

    const dbWords = pertanyaan.split(/\s+/);

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

  if (bestMatch && smallestDistance <= 2) {
    return {
      match: bestMatch,
      distance: smallestDistance
    };
  }

  return null;
}

/* =====================================================
   INDIVIDUAL NEWS SCRAPERS
===================================================== */

// 1. SOURCE: TBNEWS SUMUT (WordPress API)
async function searchTBNews(keyword) {
  try {
    console.log("Mencari TBNews Sumut untuk:", keyword);
    const response = await fetch(
      `https://tribratanews.sumut.polri.go.id/wp-json/wp/v2/posts?per_page=10&search=${encodeURIComponent(keyword)}`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
      }
    );

    if (!response.ok) return [];
    const data = await response.json();
    if (!Array.isArray(data)) return [];

    return data.map(post => {
      const title = cleanHTML(post.title?.rendered || "");
      return {
        source: "TBNews Sumut",
        title,
        link: post.link,
        date: post.date ? post.date.replace("T", " ") : null,
        score: scoreNews(title, keyword) + 5
      };
    });
  } catch (error) {
    console.log("TBNEWS ERROR:", error.message);
    return [];
  }
}

// 2. SOURCE: HUMAS POLRI (HTML Scraping via Regex)
async function searchHumasPolri(keyword) {
  try {
    console.log("Mencari Humas Polri untuk:", keyword);
    const response = await fetch("https://humas.polri.go.id/news/all", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });

    if (!response.ok) return [];
    const html = await response.text();
    const results = [];
    const regex = /<a[^>]+href=["']([^"']*\/news\/detail\/[^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
    let match;

    while ((match = regex.exec(html)) !== null) {
      const link = match[1].startsWith("http") ? match[1] : `https://humas.polri.go.id${match[1]}`;
      const title = cleanHTML(match[2]);

      if (!title || title.length < 10) continue;

      const score = scoreNews(title, keyword);
      if (score > 0) {
        results.push({
          source: "Humas Polri",
          title,
          link,
          date: null,
          score: score + 3
        });
      }
    }
    return results;
  } catch (error) {
    console.log("HUMAS ERROR:", error.message);
    return [];
  }
}

// 3. SOURCE: DETIK NEWS (RSS Split Mechanism for Serverless Compatibility)
async function searchDetik(keyword) {
  try {
    console.log("Mencari detikNews untuk:", keyword);
    const response = await fetch("https://news.detik.com/berita/rss", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });

    if (!response.ok) return [];
    const xml = await response.text();
    const items = xml.split("<item>");
    items.shift(); 

    const results = [];

    for (const item of items) {
      const titleMatch = item.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/i) || item.match(/<title>([\s\S]*?)<\/title>/i);
      const linkMatch = item.match(/<link>([\s\S]*?)<\/link>/i);
      const dateMatch = item.match(/<pubDate>([\s\S]*?)<\/pubDate>/i);

      if (!titleMatch || !linkMatch) continue;

      const title = cleanHTML(titleMatch[1]);
      const score = scoreNews(title, keyword);

      if (score > 0) {
        results.push({
          source: "detikNews",
          title,
          link: linkMatch[1].trim(),
          date: dateMatch ? dateMatch[1].trim() : null,
          score
        });
      }
    }
    return results;
  } catch (error) {
    console.log("DETIK ERROR:", error.message);
    return [];
  }
}

/* =====================================================
   ESTAFET NEWS AGGREGATOR (FALLBACK MECHANISM)
===================================================== */
async function searchAllNews(keyword) {
  console.log("=================================");
  console.log("MEMULAI PENCARIAN BERJENJANG:", keyword);

  // Langkah 1: Cari dulu di TBNews Sumut
  let beritaPilihan = await searchTBNews(keyword);
  
  // Langkah 2: Jika TBNews kosong, oper ke Humas Polri
  if (beritaPilihan.length === 0) {
    console.log("TBNews kosong, beralih ke Humas Polri...");
    beritaPilihan = await searchHumasPolri(keyword);
  }

  // Langkah 3: Jika Humas Polri masih kosong, beralih ke detikNews
  if (beritaPilihan.length === 0) {
    console.log("Humas Polri kosong, beralih ke detikNews...");
    beritaPilihan = await searchDetik(keyword);
  }

  // Hilangkan Duplikasi Data (jika ada) & Urutkan Score Terbanyak
  const uniqueResults = [];
  const seenTitles = new Set();
  const sorted = beritaPilihan.sort((a, b) => b.score - a.score);

  for (const item of sorted) {
    const key = item.title.toLowerCase().replace(/\s+/g, " ").trim();
    if (!seenTitles.has(key)) {
      seenTitles.add(key);
      uniqueResults.push(item);
    }
  }

  return uniqueResults.slice(0, 3); // Ambil top 3 berita terakurat
}

function formatNewsResults(results) {
  if (!results || results.length === 0) return null;

  let reply = "🔎 Berita yang ditemukan:\n";
  results.forEach((item, index) => {
    reply += `\n${index + 1}. 📰 ${item.source}\n`;
    reply += `${item.title}\n`;
    if (item.date) {
      reply += `📅 ${item.date}\n`;
    }
    reply += `🔗 ${item.link}\n`;
  });

  return reply.trim();
}

/* =====================================================
   INTENT MATCHING
===================================================== */
function isGreeting(userMessage) {
  const greetings = ["halo", "hai", "hi", "hello", "hallo", "selamat pagi", "selamat siang", "selamat sore", "selamat malam"];
  return greetings.includes(userMessage);
}

function isNewsIntent(userMessage) {
  const newsKeywords = ["berita", "narkoba", "penangkapan", "pembunuhan", "kasus", "begal", "curat", "curas", "sabu", "ganja", "curanmor", "pelecehan", "seksual", "judi", "pencurian", "maling"];
  return newsKeywords.some(keyword => userMessage.includes(keyword));
}

function getNewsKeyword(userMessage) {
  if (userMessage.includes("pelecehan") || userMessage.includes("seksual") || userMessage.includes("cabul")) return "pelecehan";
  if (userMessage.includes("narkoba") || userMessage.includes("sabu") || userMessage.includes("ganja")) return "narkoba";
  if (userMessage.includes("penangkapan") || userMessage.includes("tangkap")) return "tangkap";
  if (userMessage.includes("pembunuhan") || userMessage.includes("bunuh")) return "pembunuhan";
  if (userMessage.includes("judi") || userMessage.includes("judol")) return "judi";
  if (userMessage.includes("curanmor") || userMessage.includes("motor")) return "curanmor";
  if (userMessage.includes("begal") || userMessage.includes("geng motor")) return "begal";
  if (userMessage.includes("pencurian") || userMessage.includes("maling") || userMessage.includes("curat")) return "pencurian";
  return "";
}

/* =====================================================
   CHATBOT MAIN ENDPOINT
===================================================== */
app.post("/chat", async (req, res) => {
  try {
    if (!req.body || typeof req.body.message !== "string" || !req.body.message.trim()) {
      return res.status(400).json({ reply: "Pesan tidak boleh kosong." });
    }

    let rawMessage = req.body.message;
    let userMessage = preprocess(rawMessage);
    userMessage = replaceSynonyms(userMessage);

    console.log("Pesan Masuk:", userMessage);

    if (isGreeting(userMessage)) {
      return res.json({ reply: "Halo, saya VIRA 👋\nAda yang bisa saya bantu?" });
    }

    // Eksekusi Logika Berita Multi-Source Berjenjang
    if (isNewsIntent(userMessage)) {
      const keyword = getNewsKeyword(userMessage);
      if (keyword) {
        const hasilBerita = await searchAllNews(keyword);
        const formatted = formatNewsResults(hasilBerita);

        if (formatted) {
          return res.json({ reply: formatted });
        }
        return res.json({
          reply: `Maaf, berita terkait "${keyword}" belum ditemukan di TBNews Sumut, Humas Polri, maupun detikNews.`
            });
        }
      }

    /* ================= DATABASE SEARCH ================= */
    console.log("Mengambil data chatbot_memory...");

const [allRows] = await db.execute("SELECT * FROM chatbot_memory");

console.log("Jumlah data:", allRows.length);

let bestMatch = null;
let highestScore = 0;

const userWords = userMessage.split(/\s+/);

for (const row of allRows) {

  const dbQuestion = String(row.pertanyaan || "").toLowerCase();

  if (!dbQuestion) continue;

  let score = 0;

  const dbWords = dbQuestion.split(/\s+/);

  for (const word of userWords) {
    if (dbWords.includes(word)) {
      score++;
    }
  }

  if (userMessage.includes(dbQuestion)) {
    score += 5;
  }

  if (score > highestScore) {
    highestScore = score;
    bestMatch = row;
  }
}

console.log("Best Match:", bestMatch);
console.log("Highest Score:", highestScore);

if (bestMatch && highestScore >= 2) {

  let finalReply = naturalResponse(bestMatch.jawaban);

  if (bestMatch.link) {
    finalReply += `\n\nDokumen terkait:\n${bestMatch.link}`;
  }

  return res.json({
    reply: finalReply
  });
}

const typoResult = await findBestMatch(userMessage);

if (
  typoResult &&
  typoResult.match &&
  userWords.length === 1 &&
  typoResult.distance <= 1
) {

  let finalReply = naturalResponse(typoResult.match.jawaban);

  if (typoResult.match.link) {
    finalReply += `\n\nDokumen terkait:\n${typoResult.match.link}`;
  }

  return res.json({
    reply: finalReply
  });
}

    /* ================= GEMINI FALLBACK ================= */
    const body = {
      systemInstruction: {
        parts: [{
          text: `Kamu adalah VIRA. Chatbot resmi Humas Polda Sumut. Jawab dengan singkat dan profesional. Jangan mengarang data. Jika informasi tidak diketahui atau tidak tersedia, katakan bahwa informasi tersebut belum tersedia.`
        }]
      },
      contents: [{ role: "user", parts: [{ text: userMessage }] }]
    };

    const data = await askGemini(body);
    if (!data) return res.json({ reply: "Seluruh layanan Gemini sedang mencapai batas penggunaan." });

    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Informasi tidak tersedia";
    return res.json({ reply });

  } catch (error) {
  console.error("===== CHAT ERROR =====");
  console.error(error);
  console.error(error.stack);

  return res.status(500).json({
    reply: "Terjadi kesalahan pada server"
  });
}
});

/* =====================================================
   DATABASE SEEDER FROM JSON (SAFE FOR VERCEL PATH)
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

app.listen(3000, () => {
  console.log("Server berjalan di http://localhost:3000");
});

export default app;