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

/* ================= MIDDLEWARE ================= */
app.use(express.json());

app.use(
  express.static(
    path.join(process.cwd(), "publik")
  )
);

/*API KEYS*/
const API_KEYS = [

process.env.API_KEY,
process.env.API_KEY_2

];



async function askGemini(body){

for(const apiKey of API_KEYS){

try{

const response = await fetch(

`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,

{

method:"POST",

headers:{

"Content-Type":"application/json"

},

body:JSON.stringify(body)

}

);


const data = await response.json();



if(response.ok){

console.log(

`Menggunakan API ${API_KEYS.indexOf(apiKey)+1}`

);

return data;

}



if(

response.status===429 ||

data?.error?.message
?.toLowerCase()
?.includes("quota")

){

console.log(

`API ${API_KEYS.indexOf(apiKey)+1} quota habis`

);

await new Promise(
r=>setTimeout(r,1000)
);
continue;

}



if(response.status===503){

console.log(

`API ${API_KEYS.indexOf(apiKey)+1} sibuk`

);

await new Promise(

r=>setTimeout(r,2000)

);

continue;


}



console.log(data);


}

catch(err){

console.log(err);

}



}
console.log(
"Semua API telah mencapai limit"
);


return null;

}

/* ================= NLP FUNCTIONS ================= */

function preprocess(text){
  return text
    .toLowerCase()
    .replace(/[^\w\s]/gi, "")
    .trim();
}

function replaceSynonyms(text){
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

  for(const key in synonyms){
    if(text.includes(key)){
      text = text.replace(key, synonyms[key]);
    }
  }
  return text;
}

// natural response HANYA untuk jawaban dari Database Lokal
function naturalResponse(jawaban){
  if(jawaban.toLowerCase().includes("ada yang bisa saya bantu")){
    return jawaban;
  }
  const templates = [
    `Baik, berikut informasinya:\n${jawaban}`,
    `Berikut informasi yang dapat kami sampaikan:\n${jawaban}`,
    `Informasi yang Anda butuhkan:\n${jawaban}`,
    `Berikut penjelasannya:\n${jawaban}`,
    `${jawaban}`
  ];
  return templates[Math.floor(Math.random() * templates.length)];
}

/* ================= ROUTE PAGES ================= */

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

async function findBestMatch(userMessage){
  const [rows] = await db.execute("SELECT * FROM chatbot_memory");
  const userWords = userMessage.split(" ");
  let bestMatch = null;
  let smallestDistance = 999;

  for(const row of rows){
    const dbWords = row.pertanyaan.toLowerCase().split(" ");
    for(const word of userWords){
      for(const dbWord of dbWords){
        const distance = levenshtein.get(word, dbWord);
        if(distance < smallestDistance){
          smallestDistance = distance;
          bestMatch = row;
        }
      }
    }
  }

  if(smallestDistance <= 2){
    return { match: bestMatch, distance: smallestDistance };
  }
  return null;
}


/* ================= TBNEWS ================= */

async function getTBNews(keyword = ""){

try{

const response = await fetch(

"https://tribratanews.sumut.polri.go.id/wp-json/wp/v2/posts?per_page=20"

);

const data = await response.json();

if(!Array.isArray(data)) return null;

let berita = data.find(post=>{

const text = (

post.title.rendered +

" " +

(post.excerpt?.rendered || "")

).toLowerCase();

return text.includes(keyword.toLowerCase());

});

if(!berita){

berita = data[0];

}

return{

title: berita.title.rendered
.replace(/&#8211;/g,"-")
.replace(/&#8217;/g,"'"),

link: berita.link,

date: berita.date

};

}

catch(err){

console.log(err);

return null;

}

}

/* ================= CHATBOT ================= */

app.post("/chat", async (req, res) => {

try{

let userMessage = req.body.message;

userMessage = preprocess(userMessage);

userMessage = replaceSynonyms(userMessage);

console.log("=================================");
console.log("Pesan User :", userMessage);



/* ================= BERITA TBNEWS ================= */

if(

userMessage.includes("berita") ||

userMessage.includes("narkoba") ||

userMessage.includes("penangkapan") ||

userMessage.includes("kasus") ||

userMessage.includes("begal") ||

userMessage.includes("curat") ||

userMessage.includes("curas") ||

userMessage.includes("sabu") ||

userMessage.includes("ganja") ||

userMessage.includes("curanmor")

){

let keyword = "";


if(userMessage.includes("narkoba")){

keyword = "narkoba";

}

else if(userMessage.includes("penangkapan")){

keyword = "tangkap";

}

else if(userMessage.includes("judi")){

keyword = "judi";

}

else if(userMessage.includes("curanmor")){

keyword = "curanmor";

}
else if(userMessage.includes("begal")){

keyword="begal";

}

else if(userMessage.includes("curat")){

keyword="curat";

}

else if(userMessage.includes("curas")){

keyword="curas";

}

else if(userMessage.includes("sabu")){

keyword="sabu";

}

else if(userMessage.includes("ganja")){

keyword="ganja";

}


const berita = await getTBNews(keyword);



if(

berita &&

berita.title &&

berita.link

){

return res.json({

reply:


`📰 Berita TBNews Sumut


${berita.title}


📅 ${berita.date}


🔗 ${berita.link}`


});


}

}



/* ================= DATABASE ================= */

const [allRows] = await db.execute(

"SELECT * FROM chatbot_memory"

);


let bestMatch = null;

let highestScore = 0;


const userWords =

userMessage.split(" ");



for(const row of allRows){


const dbQuestion =

row.pertanyaan.toLowerCase();


let score = 0;



for(const word of userWords){


if(

dbQuestion

.split(" ")

.includes(word)

){

score++;

}


}



if(

userMessage.includes(

dbQuestion

)

){

score += 2;

}



if(score > highestScore){


highestScore = score;


bestMatch = row;


}


}


console.log(

"BEST SCORE :",

highestScore

);



if(

bestMatch &&

highestScore > 4

){


let finalReply =

naturalResponse(

bestMatch.jawaban

);



if(bestMatch.link){


finalReply +=


`\n\nDokumen terkait :


${bestMatch.link}`;


}



return res.json({


reply :

finalReply


});


}



/* ================= TYPO ================= */


const typoResult =

await findBestMatch(

userMessage

);



if(

typoResult &&

userWords.length===1 &&

typoResult.distance<=1

){



let finalReply =


naturalResponse(

typoResult.match.jawaban

);



if(

typoResult.match.link

){


finalReply +=


`\n\nDokumen terkait :


${typoResult.match.link}`;


}



return res.json({


reply :

finalReply


});


}



/* ================= GEMINI ================= */


console.log(

"Mengambil jawaban dari Gemini"

);



const body = {


systemInstruction:{


parts:[


{


text:`


Kamu adalah VIRA.


Chatbot resmi


Humas Polda Sumut.



Jawab singkat.


Jawab profesional.



Jangan mengarang data.


`.trim()


}


]


},



contents:[


{


role:"user",


parts:[


{


text:userMessage


}


]


}


]


};



const data =

await askGemini(

body

);



if(!data){


return res.json({


reply:


"Seluruh layanan Gemini sedang mencapai batas penggunaan."


});


}



const reply =


data

?.candidates?.[0]

?.content?.parts?.[0]

?.text


||

"Informasi tidak tersedia";



return res.json({


reply


});


}


catch(error){


console.log(error);



return res.status(500)

.json({


reply:


"Terjadi kesalahan pada server"


});


}


});
    
/* ================= IMPORT JSON KE DATABASE ================= */
async function importDataJSON(){
  try {
    const rawData = fs.readFileSync("./publik/data.json");
    const data = JSON.parse(rawData);

    for(const item of data){
      const keywords = item.keyword;
      const jawaban = item.jawaban;
      const link = item.link || null;
      
      for(const pertanyaan of keywords){
        const [cek] = await db.execute(
          `SELECT * FROM chatbot_memory WHERE pertanyaan = ?`,
          [pertanyaan.toLowerCase()]
        );
        if(cek.length === 0){
          await db.execute(
            `INSERT INTO chatbot_memory (pertanyaan, jawaban, link) VALUES (?, ?, ?)`,
            [pertanyaan.toLowerCase(), jawaban, link]
          );
        }
      }
    }
  } catch(error){
    console.log("Gagal import JSON:", error);
  }
}
importDataJSON();

/* ================= SERVER ================= */
app.listen(3000, () => {
  console.log("=================================");
  console.log("Server berjalan:");
  console.log("http://localhost:3000");
  console.log("=================================");
});