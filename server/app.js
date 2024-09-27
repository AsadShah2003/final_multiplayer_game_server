const cors = require("cors");
const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const {
  findSession,
  saveSession,
  addToMatchQueue,
  checkForMatch,
  removePlayerFromQueue,
} = require("../server/store/store");

const app = express();
app.use(express.json());
app.use(cors());

const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "http://localhost:3000",
  },
});

const allUsers = {};
const allRooms = [];

// Main socket event handling
io.on("connection", (socket) => {
  //add connecting socket to allUsers list
  allUsers[socket.id] = {
    socket: socket,
    online: true,
  };

  socket.on("request_to_play", (data) => {
    const currentUser = allUsers[socket.id];
    currentUser.playerName = data.playerName;

    let opponentPlayer;

    for (const key in allUsers) {
      const user = allUsers[key];
      if (user.online && !user.playing && socket.id !== key) {
        opponentPlayer = user;
        break;
      }
    }

    if (opponentPlayer) {
      allRooms.push({
        player1: opponentPlayer,
        player2: currentUser,
      });

      const isCurrPlayerTurn = Math.floor(Math.random() * 4 - 1 + 1);

      currentUser.socket.emit("OpponentFound", {
        opponentName: opponentPlayer.playerName,
        playingAs: "circle",
        myTurn: isCurrPlayerTurn <= 2 ? true : false,
      });

      opponentPlayer.socket.emit("OpponentFound", {
        opponentName: currentUser.playerName,
        playingAs: "cross",
        myTurn: isCurrPlayerTurn <= 2 ? false : true,
      });

      currentUser.socket.on("playerMoveFromClient", (data) => {
        opponentPlayer.socket.emit("playerMoveFromServer", {
          gameState: [...data.gameState],
          cell: data.cell,
          playingAs: "cross",
        });
      });

      opponentPlayer.socket.on("playerMoveFromClient", (data) => {
        currentUser.socket.emit("playerMoveFromServer", {
          gameState: [...data.gameState],
          cell: data.cell,
          playingAs: "circle",
        });
      });

      currentUser.socket.on("gameFinished", (data) => {
        opponentPlayer.socket.emit("gameFinishedFromServer", {
          message: "You Lost",
          lastCell: data.lastCell,
          winPattern: data.winPattern
        });
        currentUser.socket.emit("gameFinishedFromServer", {
          message: "You Won",
          lastCell: data.lastCell,
          winPattern: data.winPattern
        });
      });

      opponentPlayer.socket.on("gameFinished", (data) => {
        currentUser.socket.emit("gameFinishedFromServer", {
          message: "You Lost",
          lastCell: data.lastCell,
          winPattern: data.winPattern
        });
        opponentPlayer.socket.emit("gameFinishedFromServer", {
          message: "You Won",
          lastCell: data.lastCell,
          winPattern: data.winPattern
        });
      });

      // DRAW
      currentUser.socket.on("gameIsADraw", (data) => {
        opponentPlayer.socket.emit("draw", {
          lastCell: data.lastCell
        })
      })
      opponentPlayer.socket.on("gameIsADraw", (data) => {
        currentUser.socket.emit("draw", {
          lastCell: data.lastCell
        })
      })


    } else {
      currentUser.socket.emit("OpponentNotFound");
    }
  });


  // Handle disconnection
  socket.on("disconnect", async () => {
    const currentUser = allUsers[socket.id];
    currentUser.online = false;
    currentUser.playing = false;

    for (let index = 0; index < allRooms.length; index++) {
      const { player1, player2 } = allRooms[index];

      if (player1.socket.id === socket.id) {
        player2.socket.emit("opponentLeftMatch");
        break;
      }

      if (player2.socket.id === socket.id) {
        player1.socket.emit("opponentLeftMatch");
        break;
      }
    }
  });



});

app.get("/", (req, res) => {
  res.send("Hello World");
});

server.listen(5000, () => {
  console.log("Server listening on port 5000");
});

module.exports = server;
