const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: ["https://freechat-mocha.vercel.app"],
    methods: ["GET", "POST"],
  },
});

const cors = require("cors");
app.use(cors({ origin: "*" }));
const users = {};

app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from Node.js" });
});

io.on("connection", (socket) => {
  socket.on("new-user-joined", (name) => {
    users[socket.id] = name;
    socket.broadcast.emit("user-joined", name);
  });

  socket.on("send", (message) => {
    socket.broadcast.emit("receive", {
      message: message,
      name: users[socket.id],
    });
  });

  socket.on("disconnect", () => {
    socket.broadcast.emit("user-left", users[socket.id]);
    delete users[socket.id];
  });
});

if (require.main === module) {
  const PORT = process.env.PORT || 8000;
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
