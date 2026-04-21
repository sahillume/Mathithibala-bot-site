const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const path = require("path");

const { startBot, requestPairCode } = require("./bot");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

// =========================
// START BOT INSTANCE
// =========================
startBot(io);

// =========================
// PAIR CODE API
// =========================
app.post("/pair", async (req, res) => {
  const { number } = req.body;

  if (!number) {
    return res.json({ error: "Number required" });
  }

  try {
    const code = await requestPairCode(number);

    return res.json({
      success: true,
      code
    });
  } catch (e) {
    return res.json({
      success: false,
      error: e.message
    });
  }
});

// =========================
server.listen(3000, () => {
  console.log("🌐 Pair Panel running on http://localhost:3000");
});
