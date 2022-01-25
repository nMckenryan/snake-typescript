import React, { useEffect, useState, useRef } from "react";
import "./App.css";
import AppleLogo from "./applePixels.png";
import OldMonitor from "./oldMonitor.png";
import useInterval from "./useInterval";

// TODO: Revamp icons in 3D


// INITIAL VALUES
const canvasX = 1000;
const canvasY = 1000;
const initialSnake = [
  [4, 10],
  [4, 10],
];

// TODO: Randomise? 
const initialApple = [14, 10];
const scale = 10;
// TODO: Ramp up speed as high score increases? optional mode?
const timeDelay = 100; //speed of snake in milliseconds

function App() {
  const canvasRef = useRef<HTMLCanvasElement | null >(null);
  const [snake, setSnake] = useState(initialSnake);
  const [apple, setApple] = useState(initialApple);
  const [direction, setDirection] = useState([0, -1]);
  const [delay, setDelay] = useState<number | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);

  useInterval(() => runGame(), delay);

  // GENERATE CANVAS FOR SNAKE GAME
  useEffect(() => {
    let fruit = document.getElementById("fruit") as HTMLCanvasElement
    if(canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d")
      if(ctx) {
        ctx.setTransform(scale, 0, 0, scale, 0,0)
        // Erases pixels behind snake as created.
        ctx.clearRect(0,0, window.innerWidth, window.innerHeight)
        ctx.fillStyle = "#a3d001";
        snake.forEach(([x,y]) => ctx.fillRect(x, y, 1, 1));
        ctx.drawImage(fruit, apple[0], apple[1], 1,1)
      }
    }

  }, [snake, apple, gameOver])


  // SETS HIGHSCORES ON GAME OVER
  function handleSetScore() {
    if (score > Number(localStorage.getItem("snakeScore"))) {
      localStorage.setItem("snakeScore", JSON.stringify(score))
    }
  }

  // Resets Game Variables
  function reset() {
    setSnake(initialSnake);
    setApple(initialApple);
    setDirection([1,0]);
    setDelay(timeDelay);
    setScore(0);
    setGameOver(false)
  }

  //checks if snake's head has reached the boundaries of the canvas. triggering game over
  // TODO: Change snake head read on collision
  function checkCollision(head: number[]) {
    for (let i = 0; i < head.length; i++) {
      if (head[i] < 0 || head[i] * scale >= canvasX) return true;
    }

    for (const s of snake) {
      if (head[0] === s[0] && head[1] === s[1]) return true;
    }

    return false;
  }

  // Checks if Apple Eaten
  function appleAte(newSnake: number[][]) {
    // Generates random co-ord
    let coord = apple.map(() => Math.floor((Math.random() * canvasX) / scale));
    // Generate new apple once eaten
    if (newSnake[0][0] === apple[0] && newSnake[0][1] === apple[1]) {
      let newApple = coord;
      setScore(score + 1);
      setApple(newApple);
      return true;
    }
    return false;
  }


  // START GAME
  function runGame() {
    const newSnake = [...snake];
    const newSnakeHead = [
      newSnake[0][0] + direction[0],
      newSnake[0][1] + direction[1],
    ];
    newSnake.unshift(newSnakeHead);

    // Fail/Game Over Condition, resets and applies score.
    if (checkCollision(newSnakeHead)) {
      setDelay(null);
      setGameOver(true);
      handleSetScore();
    }
    if (!appleAte(newSnake)) {
      newSnake.pop();
    }
    setSnake(newSnake);
  }


  // TODO: Fix bug where snake can turn in on itself and cause Fail State (i.e. hitting right while snake is movign left triggeres game over)
  function changeDirection(e: React.KeyboardEvent<HTMLDivElement>) {
    switch (e.key) {
      case "ArrowLeft":
        setDirection([-1, 0]);
        break;
      case "ArrowRight":
        setDirection([1, 0]);
        break;
      case "ArrowUp":
        setDirection([0, -1]);
        break;
      case "ArrowDown":
        setDirection([0, 1]);
        break;
    }
  }

  // VIEW RENDER 
  //TODO: INtergrate start screen! 
  return (
    <div onKeyDown={(e) => changeDirection(e)}>
      <img id="fruit" src={AppleLogo} alt="fruit" width="30" />
      <img src={OldMonitor} alt="fruit" width="4000" className="monitor" />
      
      <canvas
        className="playArea"
        ref={canvasRef}
        width={`${canvasX}px`}
        height={`${canvasY}px`}
      />

      {gameOver && <div className="gameOver">GAME OVER</div>}

      <button onClick={reset} className="playButton">
        Play
      </button>

      <div className="scoreBox">
        <h3>Score: {score}</h3>
        <h3>High Score: {localStorage.getItem("snakeScore")}</h3>
      </div>
    </div>
  );
}

export default App;
