const sessions = [];
const matchQueue = [];

// Function to add a player to the matchmaking queue
const addToMatchQueue = (socket, user) => {
  matchQueue.push({
    socket,
    ...user,
  });
};

// Function to check if a match is possible
function checkForMatch() {
  if (matchQueue.length >= 2) {
    const player1 = matchQueue.shift();
    const player2 = matchQueue.shift();
    return {
      player1,
      player2,
    };
  }
  return null;
}

// Function to find an existing session
const findSession = (uid) => {
  return sessions.find((sess) => sess.userID === uid);
};

// Function to save a new session
const saveSession = (session) => {
  sessions.push(session);
};

// Function to remove a player from the matchmaking queue
const removePlayerFromQueue = (userID) => {
  const index = matchQueue.findIndex((player) => player.userID === userID);
  if (index !== -1) {
    matchQueue.splice(index, 1);
  }
};

module.exports = {
  findSession,
  saveSession,
  addToMatchQueue,
  checkForMatch,
  removePlayerFromQueue,
};
