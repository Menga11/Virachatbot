import express from "express";
import { getDB } from "./db.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // Agar index.html bisa diakses

const ai = new GoogleGenerativeAI(process.env.API_KEY).getGenerativeModel({ 
  model: "gemini-1.5-flash",
  systemInstruction: `Anda adalah VIRA, asisten virtual Humas Polda Sumut. 
  HANYA boleh memberikan link: humas.polri.go.id, tribratanews.polri.go.id, detik.com. 
  Jangan mengarang link lain.`
});

// Route utama untuk menampilkan website
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Route untuk chat
app.post("/chat", async (req, res) => {
  const query = req.body.message || "";
  try {
    const [rows] = await getDB().query(
      "SELECT jawaban FROM chatbot_memory WHERE ? LIKE CONCAT('%', pertanyaan, '%')", 
      [query.toLowerCase()]
    );

    if (rows.length > 0) {
      return res.json({ reply: rows[0].jawaban });
    }

    const result = await ai.generateContent(query);
    res.json({ reply: result.response.text() });
  } catch (err) {
    res.json({ reply: "Silakan kunjungi https://humas.polri.go.id/ untuk info resmi." });
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));