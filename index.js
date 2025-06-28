const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: ["http://localhost:3000", "http://192.168.100.22:3000"],
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
  server.listen(8000, () => {
    console.log("Node.js server running on http://localhost:8000");
  });
}

module.exports = app;
