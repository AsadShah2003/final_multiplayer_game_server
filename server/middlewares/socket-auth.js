import { io } from "../socket/socket";

io.use((socket, next) => {
  const sessionID = socket.handshake.auth.sessionID;
  const checkSession = findSession(sessionID);

  if (checkSession) {
    console.log("Found session");
    socket.sessionID = sessionID;
    socket.userID = checkSession.userID;
    socket.username = checkSession.username;
    return next();
  }

  const username = socket.handshake.auth.username;
  const userID = socket.handshake.auth.userID;

  console.log("Server received username: ", username, " and uid: ", userID);

  if (!username || !userID) {
    return next(new Error("Username or UserID Missing!"));
  }

  // create new session
  socket.sessionID = generateSessionID(15);
  socket.userID = userID;
  socket.username = username;
  next();
});

let users = [];
