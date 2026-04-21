const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion
} = require("@whiskeysockets/baileys");

const pino = require("pino");

let sock;
let ioRef;

// =========================
// START BOT
// =========================
async function startBot(io) {
  ioRef = io;

  const { state, saveCreds } = await useMultiFileAuthState("./session");
  const { version } = await fetchLatestBaileysVersion();

  sock = makeWASocket({
    auth: state,
    version,
    printQRInTerminal: false,
    logger: pino({ level: "silent" })
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (update) => {
    const { connection } = update;

    if (connection === "open") {
      console.log("✅ Bot Connected");
      io.emit("status", "connected");
    }
  });
}

// =========================
// REQUEST PAIR CODE
// =========================
async function requestPairCode(number) {
  if (!sock) throw new Error("Bot not ready yet");

  const code = await sock.requestPairingCode(number);

  if (ioRef) {
    ioRef.emit("pair", { number, code });
  }

  return code;
}

module.exports = { startBot, requestPairCode };
