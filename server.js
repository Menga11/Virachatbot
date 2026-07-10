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

app.use(
  express.static(
    path.join(process.cwd(), "publik")
  )
);


/* =====================================================
   API KEYS
===================================================== */

const API_KEYS = [
  process.env.API_KEY,
  process.env.API_KEY_2
].filter(Boolean);


/* =====================================================
   GEMINI API
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

        console.log(
          `Menggunakan API ${API_KEYS.indexOf(apiKey) + 1}`
        );

        return data;
      }


      if (
        response.status === 429 ||
        data?.error?.message
          ?.toLowerCase()
          ?.includes("quota")
      ) {

        console.log(
          `API ${API_KEYS.indexOf(apiKey) + 1} quota habis`
        );

        await new Promise(
          resolve => setTimeout(resolve, 1000)
        );

        continue;
      }


      if (response.status === 503) {

        console.log(
          `API ${API_KEYS.indexOf(apiKey) + 1} sibuk`
        );

        await new Promise(
          resolve => setTimeout(resolve, 2000)
        );

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
   NLP FUNCTIONS
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

    "cara minta informasi":
      "permintaan informasi online"

  };


  for (const key in synonyms) {

    if (text.includes(key)) {

      text = text.replace(
        key,
        synonyms[key]
      );

    }

  }


  return text;
}


/* =====================================================
   NATURAL RESPONSE
===================================================== */

function naturalResponse(jawaban) {

  if (
    jawaban
      .toLowerCase()
      .includes("ada yang bisa saya bantu")
  ) {

    return jawaban;

  }


  const templates = [

    `Baik, berikut informasinya:\n${jawaban}`,

    `Berikut informasi yang dapat kami sampaikan:\n${jawaban}`,

    `Informasi yang Anda butuhkan:\n${jawaban}`,

    `Berikut penjelasannya:\n${jawaban}`,

    `${jawaban}`

  ];


  return templates[
    Math.floor(
      Math.random() * templates.length
    )
  ];

}


/* =====================================================
   ROUTE PAGES
===================================================== */

app.get("/", (req, res) => {

  res.sendFile(
    path.join(
      process.cwd(),
      "publik",
      "pages",
      "index.html"
    )
  );

});


app.get("/multimedia", (req, res) => {

  res.sendFile(
    path.join(
      process.cwd(),
      "publik",
      "pages",
      "multimedia.html"
    )
  );

});


app.get("/pid", (req, res) => {

  res.sendFile(
    path.join(
      process.cwd(),
      "publik",
      "pages",
      "pid.html"
    )
  );

});


app.get("/pemnas", (req, res) => {

  res.sendFile(
    path.join(
      process.cwd(),
      "publik",
      "pages",
      "pemnas.html"
    )
  );

});


app.get("/kontak", (req, res) => {

  res.sendFile(
    path.join(
      process.cwd(),
      "publik",
      "pages",
      "kontak.html"
    )
  );

});


/* =====================================================
   TYPO MATCHING
===================================================== */

async function findBestMatch(userMessage) {

  const [rows] = await db.execute(
    "SELECT * FROM chatbot_memory"
  );


  const userWords =
    userMessage.split(" ");


  let bestMatch = null;

  let smallestDistance = 999;


  for (const row of rows) {

    const dbWords =
      row.pertanyaan
        .toLowerCase()
        .split(" ");


    for (const word of userWords) {

      for (const dbWord of dbWords) {

        const distance =
          levenshtein.get(
            word,
            dbWord
          );


        if (
          distance < smallestDistance
        ) {

          smallestDistance =
            distance;

          bestMatch = row;

        }

      }

    }

  }


  if (smallestDistance <= 2) {

    return {

      match: bestMatch,

      distance:
        smallestDistance

    };

  }


  return null;

}


/* =====================================================
   HTML CLEANER
===================================================== */

function cleanHTML(text = "") {

  return text
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&#8211;/g, "-")
    .replace(/&#8217;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();

}


/* =====================================================
   TBNEWS
===================================================== */

async function getTBNews(keyword = "") {

  try {

    console.log(
      "Mencari TBNews dengan keyword:",
      keyword || "BERITA TERBARU"
    );


    const url =
      "https://tribratanews.sumut.polri.go.id/wp-json/wp/v2/posts?per_page=100";


    const response =
      await fetch(url);


    if (!response.ok) {

      console.log(
        "TBNEWS HTTP ERROR:",
        response.status
      );

      return null;

    }


    const data =
      await response.json();


    if (
      !Array.isArray(data) ||
      data.length === 0
    ) {

      console.log(
        "Data TBNews kosong"
      );

      return null;

    }


    /*
    ==========================================
    USER HANYA MINTA BERITA TERBARU
    ==========================================
    */

    if (!keyword) {

      const berita = data[0];


      return {

        title:
          cleanHTML(
            berita.title?.rendered || ""
          ),

        link:
          berita.link,

        date:
          berita.date

      };

    }


    /*
    ==========================================
    CARI BERITA SESUAI KEYWORD
    ==========================================
    */

   const berita = data.find(post => {

  const title = cleanHTML(
    post.title?.rendered || ""
  ).toLowerCase();

  console.log("CEK JUDUL:", title);

  return title.includes(
    keyword.toLowerCase()
  );

});


    /*
    ==========================================
    TIDAK ADA BERITA SESUAI KEYWORD
    JANGAN AMBIL BERITA RANDOM
    ==========================================
    */

    if (!berita) {

      console.log(
        `Berita "${keyword}" tidak ditemukan`
      );

      return null;

    }


    console.log(
      "Berita ditemukan:",
      cleanHTML(
        berita.title?.rendered || ""
      )
    );


    return {

      title:
        cleanHTML(
          berita.title?.rendered || ""
        ),

      link:
        berita.link,

      date:
        berita.date

    };


  } catch (error) {

    console.log(
      "TBNEWS ERROR:",
      error
    );

    return null;

  }

}


/* =====================================================
   DETEKSI INTENT BERITA
===================================================== */

function isNewsIntent(userMessage) {

  const newsKeywords = [

    "berita",
    "narkoba",
    "penangkapan",
    "kasus",
    "begal",
    "curat",
    "curas",
    "sabu",
    "ganja",
    "curanmor",
    "pelecehan",
    "seksual",
    "judi"

  ];


  return newsKeywords.some(
    keyword =>
      userMessage.includes(keyword)
  );

}


/* =====================================================
   AMBIL KEYWORD BERITA
===================================================== */

function getNewsKeyword(userMessage) {

  if (
    userMessage.includes("pelecehan") ||
    userMessage.includes("seksual")
  ) {

    return "pelecehan";

  }


  if (
    userMessage.includes("narkoba")
  ) {

    return "narkoba";

  }


  if (
    userMessage.includes("penangkapan")
  ) {

    return "tangkap";

  }


  if (
    userMessage.includes("judi")
  ) {

    return "judi";

  }


  if (
    userMessage.includes("curanmor")
  ) {

    return "curanmor";

  }


  if (
    userMessage.includes("begal")
  ) {

    return "begal";

  }


  if (
    userMessage.includes("curat")
  ) {

    return "curat";

  }


  if (
    userMessage.includes("curas")
  ) {

    return "curas";

  }


  if (
    userMessage.includes("sabu")
  ) {

    return "sabu";

  }


  if (
    userMessage.includes("ganja")
  ) {

    return "ganja";

  }


  return "";

}

function isGreeting(userMessage) {
  const greetings = [
    "halo",
    "hai",
    "hi",
    "hello",
    "hallo",
    "selamat pagi",
    "selamat siang",
    "selamat sore",
    "selamat malam"
  ];

  return greetings.includes(userMessage);
}

/* =====================================================
   CHATBOT API
===================================================== */

app.post("/chat", async (req, res) => {

  try {

    /*
    ==========================================
    VALIDASI INPUT
    ==========================================
    */

    if (
      !req.body ||
      typeof req.body.message !== "string" ||
      !req.body.message.trim()
    ) {

      return res.status(400).json({

        reply:
          "Pesan tidak boleh kosong."

      });

    }


    /*
    ==========================================
    PREPROCESS
    ==========================================
    */

    let userMessage =
      req.body.message;


    userMessage =
      preprocess(userMessage);


    userMessage =
      replaceSynonyms(userMessage);


    console.log(
      "================================="
    );

    console.log(
      "Pesan User:",
      userMessage
    );


    /* ==========================================
   GREETING
========================================== */

if (isGreeting(userMessage)) {
  return res.json({
    reply: "Halo, saya VIRA 👋\nAda yang bisa saya bantu?"
  });
}

   
    /* =====================================================
   TBNEWS
===================================================== */

if (isNewsIntent(userMessage)) {

  const keyword = getNewsKeyword(userMessage);

  console.log("KEYWORD TERDETEKSI:", keyword);

  const berita = await getTBNews(keyword);

  if (
    berita &&
    berita.title &&
    berita.link
  ) {

    return res.json({
      reply:
`📰 Berita TBNews Sumut

${berita.title}

📅 ${berita.date}

🔗 ${berita.link}`
    });

  }

  if (keyword) {

    return res.json({
      reply:
        `Maaf, berita terkait "${keyword}" belum ditemukan di TBNews Sumut.`
    });

  }

}


    /*
    ==========================================
    DATABASE LOKAL
    ==========================================
    */

    const [allRows] =
      await db.execute(

        "SELECT * FROM chatbot_memory"

      );


    let bestMatch = null;

    let highestScore = 0;


    const userWords =
      userMessage.split(" ");


    for (
      const row of allRows
    ) {

      const dbQuestion =
        row.pertanyaan
          .toLowerCase();


      let score = 0;


      for (
        const word of userWords
      ) {

        if (
          dbQuestion
            .split(" ")
            .includes(word)
        ) {

          score++;

        }

      }


      if (
        userMessage.includes(
          dbQuestion
        )
      ) {

        score += 2;

      }


      if (
        score > highestScore
      ) {

        highestScore =
          score;

        bestMatch =
          row;

      }

    }


    console.log(
      "BEST SCORE:",
      highestScore
    );


    /*
    ==========================================
    DATABASE MATCH
    ==========================================
    */

    if (
      bestMatch &&
      highestScore > 4
    ) {

      let finalReply =
        naturalResponse(
          bestMatch.jawaban
        );


      if (
        bestMatch.link
      ) {

        finalReply +=

`\n\nDokumen terkait:

${bestMatch.link}`;

      }


      return res.json({

        reply:
          finalReply

      });

    }


    /*
    ==========================================
    TYPO CHECK
    ==========================================
    */

    const typoResult =
      await findBestMatch(
        userMessage
      );


    if (
      typoResult &&
      userWords.length === 1 &&
      typoResult.distance <= 1
    ) {

      let finalReply =
        naturalResponse(
          typoResult.match.jawaban
        );


      if (
        typoResult.match.link
      ) {

        finalReply +=

`\n\nDokumen terkait:

${typoResult.match.link}`;

      }


      return res.json({

        reply:
          finalReply

      });

    }


    /*
    ==========================================
    GEMINI FALLBACK
    ==========================================
    */

    console.log(
      "Mengambil jawaban dari Gemini"
    );


    const body = {

      systemInstruction: {

        parts: [

          {

            text:
`Kamu adalah VIRA.

Chatbot resmi Humas Polda Sumut.

Jawab dengan singkat dan profesional.

Jangan mengarang data.

Jika informasi tidak diketahui atau tidak tersedia,
katakan bahwa informasi tersebut belum tersedia.

Jangan membuat data kasus, statistik kriminal,
nama tersangka, nama korban, atau kronologi kejadian
jika tidak memiliki sumber informasi yang diberikan.`

          }

        ]

      },


      contents: [

        {

          role: "user",

          parts: [

            {

              text:
                userMessage

            }

          ]

        }

      ]

    };


    const data =
      await askGemini(body);


    if (!data) {

      return res.json({

        reply:
          "Seluruh layanan Gemini sedang mencapai batas penggunaan."

      });

    }


    const reply =

      data
        ?.candidates?.[0]
        ?.content
        ?.parts?.[0]
        ?.text

      ||

      "Informasi tidak tersedia";


    return res.json({

      reply

    });


  } catch (error) {

    console.log(
      "CHAT ERROR:",
      error
    );


    return res
      .status(500)
      .json({

        reply:
          "Terjadi kesalahan pada server"

      });

  }

});


/* =====================================================
   IMPORT JSON KE DATABASE
===================================================== */

async function importDataJSON() {

  try {

    const rawData =
      fs.readFileSync(
        "./publik/data.json"
      );


    const data =
      JSON.parse(rawData);


    for (
      const item of data
    ) {

      const keywords =
        item.keyword;


      const jawaban =
        item.jawaban;


      const link =
        item.link || null;


      for (
        const pertanyaan of keywords
      ) {

        const [cek] =
          await db.execute(

            `SELECT * FROM chatbot_memory
             WHERE pertanyaan = ?`,

            [
              pertanyaan.toLowerCase()
            ]

          );


        if (
          cek.length === 0
        ) {

          await db.execute(

            `INSERT INTO chatbot_memory
            (pertanyaan, jawaban, link)
            VALUES (?, ?, ?)`,

            [

              pertanyaan.toLowerCase(),

              jawaban,

              link

            ]

          );

        }

      }

    }


    console.log(
      "Import data JSON selesai"
    );


  } catch (error) {

    console.log(
      "Gagal import JSON:",
      error
    );

  }

}


/* =====================================================
   STARTUP
===================================================== */

importDataJSON();


app.listen(3000, () => {

  console.log(
    "================================="
  );

  console.log(
    "Server berjalan:"
  );

  console.log(
    "http://localhost:3000"
  );

  console.log(
    "================================="
  );

});


export default app;