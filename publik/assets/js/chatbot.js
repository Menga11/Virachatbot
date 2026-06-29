/* ================= TOGGLE CHAT ================= */
function toggleChat(){

  const chat =
  document.getElementById("chat-container");

  if(
    chat.style.display === "none" ||
    chat.style.display === ""
  ){

    chat.style.display = "flex";

  }else{

    chat.style.display = "none";

  }

}

/* ================= CREATE MESSAGE ================= */
function createMessage(text, sender){

  const chatBox =
  document.getElementById("chat-box");

  const msg =
  document.createElement("div");

  // ================= CLASS CHAT =================
  if(sender === "user"){

    msg.classList.add(
      "message",
      "user-message"
    );

  }else{

    msg.classList.add(
      "message",
      "bot-message"
    );

  }

  msg.innerHTML = text.replace(
  /(https?:\/\/[^\s]+)/g,
  '<a href="$1" target="_blank">$1</a>'
);

  chatBox.appendChild(msg);

  // AUTO SCROLL
  chatBox.scrollTop =
  chatBox.scrollHeight;

}

/* ================= SHOW TYPING ================= */
function showTyping(){

  const chatBox =
  document.getElementById("chat-box");

  const typing =
  document.createElement("div");

  typing.classList.add(
    "message",
    "bot-message"
  );

  typing.innerText = "Mengetik...";

  chatBox.appendChild(typing);

  // AUTO SCROLL
  chatBox.scrollTop =
  chatBox.scrollHeight;

  return typing;

}

/* ================= SEND MESSAGE ================= */
async function sendMessage(){

  const input =
  document.getElementById("user-input");

  const rawMessage =
  input.value.trim();

  if(!rawMessage) return;

  // ================= RESPON SANTAI =================
const santai = {
  "oke": "Baik 👌 Ada lagi yang ingin ditanyakan?",
  "ok": "Siap 👍",
  "makasih": "Sama-sama 😊",
  "terimakasih": "Sama-sama 😊",
  "terima kasih": "Sama-sama 😊",
  "baik": "Baik 👍",
  "sip": "Siap 👌",
  "siap": "Oke 😊",
};

const lowerMessage = rawMessage.toLowerCase();

if(santai[lowerMessage]){

  createMessage(rawMessage, "user");

  input.value = "";

  setTimeout(() => {

    createMessage(
      santai[lowerMessage],
      "bot"
    );

  }, 500);

  return;
}

  // ================= PESAN USER =================
  createMessage(
    rawMessage,
    "user"
  );

  input.value = "";

  // ================= TYPING =================
  const typing =
  showTyping();

  try{

    // ================= FETCH API =================
    const response =
    await fetch(
      "http://localhost:3000/chat",
      {

        method: "POST",

        headers:{
          "Content-Type":
          "application/json"
        },

        body: JSON.stringify({

          message: rawMessage

        })

      }
    );

    const data =
    await response.json();

    // HAPUS TYPING
    typing.remove();

    // ================= BALASAN BOT =================
    createMessage(
      data.reply,
      "bot"
    );

  }

  catch(error){

    console.log(error);

    typing.remove();

    createMessage(
      "Server chatbot sedang bermasalah.",
      "bot"
    );

  }

}

/* ================= QUICK REPLY ================= */
function quickReply(text){

  document
  .getElementById("user-input")
  .value = text;

  sendMessage();

}

/* ================= QUICK QUESTION ================= */
function sendQuickQuestion(question){

  // masukkan text ke input
  document
  .getElementById("user-input")
  .value = question;

  // kirim seperti chat biasa
  sendMessage();
}

/* ================= ENTER KEY ================= */
document
.addEventListener(
  "DOMContentLoaded",
  () => {

    const input =
    document.getElementById("user-input");

    input.addEventListener(
      "keypress",
      function(e){

        if(e.key === "Enter"){

          sendMessage();

        }

      }
    );

    // ================= WELCOME MESSAGE =================
    createMessage(`
  Halo 👋 Saya VIRA, berikut beberapa informasi terkait
  keterbukaan informasi publik yang dapat Anda tanyakan:

  <div class="quick-questions">

    <button onclick="sendQuickQuestion('Apa itu keterbukaan informasi publik(KIP)?')">
      Apa itu keterbukaan informasi publik(KIP)?
    </button>

    <button onclick="sendQuickQuestion('Apa tujuan keterbukaan informasi publik(KIP)?')">
      Tujuan keterbukaan informasi publik(KIP)?
    </button>

  </div>
`, "bot");

    // ================= QUICK MENU =================
    const chatBox =
    document.getElementById("chat-box");

    const quick =
    document.createElement("div");

    quick.classList.add(
      "message",
      "bot-message"
    );

  }
);