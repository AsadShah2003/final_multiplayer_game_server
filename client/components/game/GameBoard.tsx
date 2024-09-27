import { pixelify } from "@/utils/Fonts";
import "./GameBoard.css";

const GameBoard = ({ finishedState, winPattern, currTurn, isMyTurn, opponentName, username, handleClick }:
  { finishedState: string; winPattern: any, currTurn: any, isMyTurn: boolean | null, opponentName: string; username: string; handleClick: any }) => {


  if (winPattern !== null) {

    console.log("Win pattern recved: ", winPattern)

    if (winPattern.type === "lost") {

      for (let i = 0; i < 3; i++) {
        const winOrLosingCell = document.getElementById(`${winPattern.winPattern[i]}`) as HTMLElement;
        if (winOrLosingCell) {
          winOrLosingCell.style.backgroundColor = "red";
          winOrLosingCell.style.border = "1px solid red";
        }
      }

    } else if (winPattern.type === "won") {

      for (let i = 0; i < 3; i++) {
        const winOrLosingCell = document.getElementById(`${winPattern.winPattern[i]}`) as HTMLElement;
        if (winOrLosingCell) {
          winOrLosingCell.style.backgroundColor = "green";
          winOrLosingCell.style.border = "1px solid green";

        }
      }

    }

  }

  return (
    <div className="max-w-[600px] max-h-[400px] flex flex-col">
      <div className={`${pixelify.className} self-center flex flex-col gap-5 items-center absolute top-[40px]`}>
        <div className="flex items-center gap-5">
          <div className={`${isMyTurn === true ? "my-turn" : ""}`}>
            <h1 className="text-[1.5rem]">{username}</h1>
          </div>
          <h1 className="text-[1.5rem]">vs</h1>
          <div className={`${isMyTurn === false ? "my-turn" : ""}`}>
            <h1 className="text-[1.5rem]">{opponentName && opponentName.length > 0 ? opponentName : "Opponent"}</h1>
          </div>
        </div>
        <h1 className="font-mono self-center text-center w-fit">
          You are playing as <strong>{currTurn}</strong>
        </h1>
        {
          finishedState !== "draw" ? <>
            {
              winPattern.type === "won" ? <h1 className="self-center text-center">
                You Won
              </h1> : winPattern.type === "lost" ? <h1 className="self-center text-center">
                You Lost
              </h1> :
                <h1 className="self-center text-center">
                  Its {isMyTurn ? " your " : " your opponent "} turn
                </h1>

            }
          </> : <h1 className="self-center text-center">
            Its a Draw
          </h1>
        }

      </div>

      <div className="row flex">
        <div onClick={(e) => handleClick(e.target)} id="0" className="col"></div>
        <div onClick={(e) => handleClick(e.target)} id="1" className="col"></div>
        <div onClick={(e) => handleClick(e.target)} id="2" className="col"></div>
      </div>
      <div className="row flex">
        <div onClick={(e) => handleClick(e.target)} id="3" className="col"></div>
        <div onClick={(e) => handleClick(e.target)} id="4" className="col"></div>
        <div onClick={(e) => handleClick(e.target)} id="5" className="col"></div>
      </div>
      <div className="row flex">
        <div onClick={(e) => handleClick(e.target)} id="6" className="col"></div>
        <div onClick={(e) => handleClick(e.target)} id="7" className="col"></div>
        <div onClick={(e) => handleClick(e.target)} id="8" className="col"></div>
      </div>
    </div>
  );
};

export default GameBoard;
