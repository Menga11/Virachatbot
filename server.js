import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import fetch from "node-fetch";
import { getDB } from "./db.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(process.cwd(), "publik")));

/* =====================================================
   DATABASE SEEDER
===================================================== */
async function initializeDatabase() {
    try {
        const db = await getDB();
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
            console.log("✅ Database siap.");
        }
    } catch (err) { console.error("❌ Setup DB gagal:", err.message); }
}
initializeDatabase();

/* =====================================================
   HELPER FUNCTIONS (Gemini & Intent)
===================================================== */
function isNewsIntent(userMessage) {
    const newsKeywords = ["berita", "kasus", "narkoba", "sabu", "kriminal", "terbaru", "update"];
    return newsKeywords.some(keyword => userMessage.toLowerCase().includes(keyword));
}

async function dapatkanBeritaGemini(keyword) {
    try {
        const apiKey = process.env.API_KEY || process.env.API_KEY_2;
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `Cari berita terkini "${keyword}" di Sumut. Jawab singkat maksimal 3 kalimat sebagai VIRA Polda Sumut. Berikan link media kredibel.` }] }],
                tools: [{ googleSearch: {} }]
            })
        });
        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    } catch { return null; }
}

async function tanyaGemini(userMessage) {
    try {
        const apiKey = process.env.API_KEY || process.env.API_KEY_2;
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ parts: [{ text: `Anda VIRA, chatbot Polda Sumut. Jawab ramah: ${userMessage}` }] }] })
        });
        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    } catch { return "Maaf, layanan VIRA sedang gangguan."; }
}

/* =====================================================
   MAIN CHAT ROUTE
===================================================== */
app.post("/chat", async (req, res) => {
    const userQuery = req.body.message || "";
    const lowerQuery = userQuery.toLowerCase();

    // 1. Sapaan Dasar
    if (["halo", "halooo", "hai", "pagi", "siang"].some(s => lowerQuery.includes(s))) {
        return res.json({ reply: "Halo! Saya VIRA, Asisten Virtual Humas Polda Sumut. Ada yang bisa saya bantu hari ini?" });
    }

    // 2. Cek Database
    const db = await getDB();
    const [rows] = await db.query("SELECT * FROM chatbot_memory WHERE pertanyaan LIKE ?", [`%${userQuery}%`]);

    if (rows.length > 0) {
        return res.json({ reply: rows[0].jawaban });
    }

    // 3. Jika bukan sapaan & tidak ada di DB, cek Intent Berita atau AI
    if (isNewsIntent(userQuery)) {
        const berita = await dapatkanBeritaGemini(userQuery);
        return res.json({ reply: berita || "Maaf, saya tidak menemukan berita terkait saat ini." });
    } else {
        const jawabanAI = await tanyaGemini(userQuery);
        return res.json({ reply: jawabanAI });
    }
});

app.get("/", (req, res) => res.sendFile(path.join(process.cwd(), "publik/pages/index.html")));

if (process.env.NODE_ENV !== "production") {
    app.listen(3000, () => console.log("Server running on port 3000"));
}

export default app;