"use client";
import GameBoard from "@/components/game/GameBoard";
import { Button } from "@/components/ui/button";
import { pixelify } from "@/utils/Fonts";
import { useState } from "react";
import { io } from "socket.io-client";
import { playAudio } from "@/utils/AudioPlayer";
import Swal from "sweetalert2";

export default function Home() {
  const [playerName, setPlayerName] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [moves, setMoves] = useState(Array(9).fill(null));
  const [currPlayer, setCurrPlayer] = useState("");
  const [socket, setSocket]: any = useState(null);
  const [iAmplayingAs, setIAmPlayingAs] = useState("");
  const [opponentName, setOpponentName] = useState<string>("");
  const [finishedState, setFinishedState] = useState("");
  const [isMyTurn, setIsMyTurn] = useState<boolean | null>(null);

  const [winner, setWinner] = useState<any>(null)
  const [servWinPattern, setServWinPattern] = useState<any>({})

  const checkForWinner = (state: (string | null)[]) => {
    const winningPatterns = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    //check for any nulls to indicate a draw
    const draw = !state.includes(null)
    if (draw) {
      return {
        status: "thereIsADraw"
      }
    }

    let i = 0
    for (let pattern of winningPatterns) {
      const [a, b, c] = pattern;
      if (state[a] !== null && state[a] === state[b] && state[a] === state[c]) {
        return { status: "thereIsAWinner", winPattern: winningPatterns[i] }
      }
      i++
    }


    return { status: "noWinnerForNow" }
  };

  const handleCellClick = (element: any) => {
    const cellIdx = Number(element.id);

    if (winner || moves[cellIdx] || (isMyTurn !== null && isMyTurn === false)) {
      return;
    }

    const newMoves = [...moves];
    newMoves[cellIdx] = currPlayer;

    const isThereAwinner = checkForWinner(newMoves);

    if (isThereAwinner !== null && isThereAwinner.winPattern && isThereAwinner.winPattern.length > 0
      && isThereAwinner.status === "thereIsAWinner"
    ) {
      element.innerText = currPlayer;

      setWinner(true)

      console.log("Just before gameFinished winPattern = ", isThereAwinner)

      socket?.emit("gameFinished", {
        lastCell: Number(element.id),
        winner: currPlayer.toLowerCase() === "x" ? "cross" : "circle",
        winPattern: isThereAwinner.winPattern
      });

      //setIsMyTurn(false);
      return;
    } else if (isThereAwinner !== null && isThereAwinner.status === "thereIsADraw") {
      element.innerText = currPlayer;
      setFinishedState("draw")

      socket?.emit("gameIsADraw", {
        lastCell: cellIdx,
      })

      return
    }

    socket?.emit("playerMoveFromClient", {
      gameState: newMoves,
      cell: cellIdx,
    });

    element.innerText = currPlayer;
    setMoves(newMoves);

    setIsMyTurn(false);
  };

  const getUserName = async () => {
    const result = await Swal.fire({
      title: "Enter your name",
      input: "text",
      showCancelButton: true,
      inputValidator: (value: any) => {
        if (!value) {
          return "You need to write something!";
        }
      },
    });

    return result;
  };

  const playAnotherMatch = async (msg: string) => {
    const result = await Swal.fire({
      title: msg.length > 0 && msg === "You Won" ? "You won the match" : "You lost the match",
      showCancelButton: true,
      text: "Click ok to look for another match",
      showConfirmButton: true,
    });
    return result
  };


  const onPlayClick = async () => {
    const _playerName = await getUserName();
    if (!_playerName.isConfirmed) {
      return;
    }

    const newSocket = io("http://localhost:5000", {
      autoConnect: true,
    });

    newSocket.emit("request_to_play", {
      playerName: _playerName.value,
    });

    setSocket(newSocket);
    setPlayerName(_playerName.value);
  };

  socket?.on("gameFinishedFromServer", async (data: any) => {
    if (data.message === "You Lost") {

      //render last move
      const moveToShow = document.getElementById(`${data.lastCell}`)!;
      moveToShow.innerText = currPlayer.toLowerCase() === "x" ? "O" : "X";

      setServWinPattern({
        type: "lost",
        winPattern: data.winPattern
      })

      playAudio("/sounds/lose.mp3")

    } else if (data.message === "You Won") {
      setServWinPattern({
        type: "won",
        winPattern: data.winPattern
      })
      playAudio("/sounds/win.mp3")
    }

    const askToReset = await playAnotherMatch(data.message)
    if (askToReset.isConfirmed) {
      location.reload()
    }

  });

  socket?.on("playerMoveFromServer", (data: any) => {
    const updateMoves = [...data.gameState];
    setMoves(updateMoves);
    //render moves
    const moveToShow = document.getElementById(`${data.cell}`)!;
    moveToShow.innerText = data.playingAs === "cross" ? "X" : "O";

    setCurrPlayer(data.playingAs === "circle" ? "X" : "O");

    setIsMyTurn(true);
  });

  socket?.on("draw", (data: any) => {
    setFinishedState("draw")
    //render last move
    const moveToShow = document.getElementById(`${data.lastCell}`)!;
    moveToShow.innerText = currPlayer.toLowerCase() === "x" ? "O" : "X";
  })


  socket?.on("connect", () => {
    setIsPlaying(true);
  });

  socket?.on("OpponentNotFound", function () {
    setOpponentName("");
  });
  socket?.on("opponentLeftMatch", () => {
    setFinishedState("opponentLeftMatch");
  });

  socket?.on("OpponentFound", function (data: any) {
    setOpponentName(data.opponentName);

    const myTurnSYMBOL = data.playingAs === "circle" ? "X" : "O";

    setIAmPlayingAs(myTurnSYMBOL);
    if (data.myTurn === true) {
      setIsMyTurn(true);
      setCurrPlayer(myTurnSYMBOL);


    } else if (data.myTurn === false) {
      setIsMyTurn(false);

      //switch to 2nd player currPlayer symbol
      setCurrPlayer(myTurnSYMBOL === "X" ? "O" : "X");
    }
    console.log("Opponent will be playing as: ", data.playingAs);
  });

  if (finishedState === "youWon") {
    return (
      <>
        <div className="min-h-screen w-full flex justify-center items-center">
          <h1 className={`${pixelify.className} text-3xl`}>
            You won, your opponent left the match
          </h1>
          <Button
            onClick={() => location.reload()}
            className={`${pixelify.className} mt-6 p-6 shadow-xl bg-purple-700 font-bold w-64 opacity-[0.9] self-center h-16 text-2xl hover:opacity-[1] hover:!bg-purple-700`}
          >
            Go to Menu
          </Button>
        </div>
      </>
    );
  }

  if (finishedState === "opponentLeftMatch") {
    return (
      <>
        <div className="min-h-screen w-full flex flex-col justify-center items-center">
          <h1 className={`${pixelify.className} text-3xl`}>
            You won, your opponent left the match
          </h1>
          <Button
            onClick={() => location.reload()}
            className={`${pixelify.className} mt-12 p-6 shadow-xl bg-purple-700 font-bold w-64 opacity-[0.9] self-center h-16 text-2xl hover:opacity-[1] hover:!bg-purple-700`}
          >
            Go to Menu
          </Button>
        </div>
      </>
    );
  }

  if (!isPlaying) {
    return (
      <>
        <div className="min-h-screen w-full flex justify-center items-center bg-white">
          <main className="flex flex-col w-[400px] gap-4">
            <Button
              onClick={onPlayClick}
              className={`${pixelify.className} p-6 shadow-xl bg-purple-700 font-bold w-64 opacity-[0.9] self-center h-16 text-2xl hover:opacity-[1] hover:!bg-purple-700`}
            >
              Play Now
            </Button>
          </main>
        </div>
      </>
    );
  }

  if (isPlaying && opponentName === "") {
    return (
      <div
        className={`${pixelify.className} bg-white h-screen w-full flex justify-center items-center text-4xl font-bold`}
      >
        <h1>Waiting for opponent</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex justify-center pt-48">

      <GameBoard
        finishedState={finishedState}
        winPattern={servWinPattern}
        currTurn={iAmplayingAs}
        isMyTurn={isMyTurn}
        opponentName={opponentName}
        handleClick={handleCellClick}
        username={playerName}
      />
    </div>
  );
}
