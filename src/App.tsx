import React, { useEffect, useState, useRef } from "react";
import "./App.css";
import AppleLogo from "./img/apple.png";
import Console from "./img/console.png";
import useInterval from "./useInterval";
import useSound from 'use-sound';

const scoreSfx = require("./appleAte.mp3");
// using ES5 imports so typescript doesn't complain.

// import snakeDead from "./sfx/snakeDead.wav";

// TODO: Revamp icons in 3D

// INITIAL VALUES
const canvasX = 1000;
const canvasY = 1000;
const initialSnake = [
  [4, 10],
  [4, 10],
];




const initialApple = [14, 10];
const scale = 50;
// TODO: Ramp up speed as high score increases? optional mode?
const timeDelay = 100; //speed of snake in milliseconds

function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [snake, setSnake] = useState(initialSnake);
  const [apple, setApple] = useState(initialApple);
  const directions = {
    left: [-1, 0],
    right: [1, 0],
    up: [0, -1],
    down: [0, 1],
  };
  const [lastDirection, setLastDirection] = useState(directions.right)
  const [direction, setDirection] = useState(directions.left);
  const [delay, setDelay] = useState<number | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);

  useInterval(() => runGame(), delay);

  // GENERATE CANVAS FOR SNAKE GAME
  useEffect(() => {
    let fruit = document.getElementById("fruit") as HTMLCanvasElement;
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.setTransform(scale, 0, 0, scale, 0, 0);
        // Erases pixels behind snake as created.
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        // SNAKE COLOR
        ctx.fillStyle = "#c8ff00";
        // TURN SNAKE READ ON GAME OVER
        if (gameOver === true) {
          ctx.fillStyle = "red";
        }
        snake.forEach(([x, y]) => ctx.fillRect(x, y, 1, 1));
        ctx.drawImage(fruit, apple[0], apple[1], 1, 1);
      }
    }
  }, [snake, apple, gameOver]);

  // SETS HIGHSCORES ON GAME OVER
  function handleSetScore() {
    if (score > Number(localStorage.getItem("snakeScore"))) {
      localStorage.setItem("snakeScore", JSON.stringify(score));
    }
  }

  // Resets Game Variables
  function reset() {
    setSnake(initialSnake);
    setApple(initialApple);
    setDirection(directions.right);
    setDelay(timeDelay);
    setScore(0);
    setGameOver(false);
  }

  //checks if snake's head has reached the boundaries of the canvas. triggering game over
  function checkCollision(head: number[]) {
    // TODO: Negates Issue where snake can collide wiht it's own neck

    for (let i = 0; i < head.length; i++) {
      if (head[i] < 0 || head[i] * scale >= canvasX) return true;
    }

    for (const s of snake) {
      if (head[0] === s[0] && head[1] === s[1]) return true;
    }

    return false;
  }

  // Checks if Apple Eaten
  // TODO: Implement Sound when apple eaten
  function AppleAte(newSnake: number[][]) {

    const [playOn] = useSound(
      scoreSfx,
      { volume: 0.25 }
    );

    // Generates random co-ord
    let coord = apple.map(() => Math.floor((Math.random() * canvasX) / scale));
    // Generate new apple once eaten
    if (newSnake[0][0] === apple[0] && newSnake[0][1] === apple[1]) {
      let newApple = coord;
      setScore(score + 1);
      setApple(newApple);
      playOn();

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
    if (!AppleAte(newSnake)) {
      newSnake.pop();
    }
    setSnake(newSnake);
  }

  function turnCheck(d: number[]) {
    if(d !== lastDirection) {
      setDirection(d);

      switch(d) {
        case directions.left:
          setLastDirection(directions.right);
          break;
        case directions.right:
          setLastDirection(directions.left);
          break;
        case directions.up:
          setLastDirection(directions.down);
          break;
        case directions.down:
          setLastDirection(directions.up);
          break;
      }
    }
  }


  // TODO: Fix bug where snake can turn in on itself and cause Fail State (i.e. hitting right while snake is movign left triggeres game over)
  function changeDirection(e: React.KeyboardEvent<HTMLDivElement>) {
    switch (e.key) {
      case "ArrowLeft":
        turnCheck(directions.left);
        // setDirection(directions.left);
        break;
      case "ArrowRight":
        turnCheck(directions.right);
        break;
      case "ArrowUp":
        turnCheck(directions.up);
        break;
      case "ArrowDown":
        turnCheck(directions.down);
        break;
    }
  }

  // VIEW RENDER
  //TODO: INtergrate start screen!
  return (
    <div onKeyDown={(e) => changeDirection(e)}>

      <img id="fruit" src={AppleLogo} alt="fruit" width="30" />
      <img src={Console} alt="fruit" width="4000" className="monitor" />

      <canvas
        className="playArea"
        ref={canvasRef}
        width={`${canvasX}px`}
        height={`${canvasY}px`}
      />

      {gameOver && <div className="gameOver">GAME OVER</div>}

      
      <button onClick={reset}  className="playButton">

      </button>
      <div className="playButtonArea">
      <h4>Play</h4>
      </div>

      <div className="scoreBox">
        <h3>Score: {score}</h3>
        <h3>High Score: {localStorage.getItem("snakeScore")}</h3>
      </div>
    </div>
  );
}

export default App;
