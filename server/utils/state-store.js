const activePlayers = []
const addActivePlayer = (playerInfo) => {
    activePlayers.push(playerInfo)
}
const removeActivePlayer = (playerID) => {
    const filterOutPlayers = activePlayers.filter((player) => player.id !== playerID)
    activePlayers = [...filterOutPlayers]
}
const getActivePlayers = () => {
    return activePlayers
}

module.exports = {
    activePlayers, addActivePlayer, removeActivePlayer, getActivePlayers
}