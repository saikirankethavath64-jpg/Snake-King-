import { useEffect, useRef, useState, useCallback } from 'react';
import { Trophy, Gamepad2, RotateCcw, Play } from 'lucide-react';

const GRID_SIZE = 20;
const GAME_SPEED = 120; // milliseconds per frame

type Point = { x: number; y: number };

export default function SnakeGame() {
  const [snake, setSnake] = useState<Point[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Point>({ x: 15, y: 5 });
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const directionRef = useRef<Point>({ x: 1, y: 0 });
  const nextDirectionRef = useRef<Point>({ x: 1, y: 0 });
  const gameBoardRef = useRef<HTMLDivElement>(null);

  const generateFood = useCallback((currentSnake: Point[]) => {
    let newFood;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      const isOnSnake = currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
      if (!isOnSnake) break;
    }
    return newFood;
  }, []);

  const startGame = () => {
    setSnake([{ x: 10, y: 10 }]);
    setFood(generateFood([{ x: 10, y: 10 }]));
    setScore(0);
    setGameOver(false);
    setIsPlaying(true);
    directionRef.current = { x: 1, y: 0 };
    nextDirectionRef.current = { x: 1, y: 0 };
    gameBoardRef.current?.focus();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying) return;

      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
      }

      const currentDir = directionRef.current;
      switch (e.key) {
        case 'ArrowUp':
          if (currentDir.y !== 1) nextDirectionRef.current = { x: 0, y: -1 };
          break;
        case 'ArrowDown':
          if (currentDir.y !== -1) nextDirectionRef.current = { x: 0, y: 1 };
          break;
        case 'ArrowLeft':
          if (currentDir.x !== 1) nextDirectionRef.current = { x: -1, y: 0 };
          break;
        case 'ArrowRight':
          if (currentDir.x !== -1) nextDirectionRef.current = { x: 1, y: 0 };
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying]);

  useEffect(() => {
    if (!isPlaying || gameOver) return;

    const moveSnake = () => {
      setSnake(prevSnake => {
        const head = prevSnake[0];
        const nextDir = nextDirectionRef.current;
        directionRef.current = nextDir;

        const newHead = { x: head.x + nextDir.x, y: head.y + nextDir.y };

        if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
          handleGameOver();
          return prevSnake;
        }

        if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
          handleGameOver();
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];

        if (newHead.x === food.x && newHead.y === food.y) {
          setScore(s => {
            const newScore = s + 10;
            setHighScore(h => Math.max(h, newScore));
            return newScore;
          });
          setFood(generateFood(newSnake));
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    };

    const interval = setInterval(moveSnake, GAME_SPEED);
    return () => clearInterval(interval);
  }, [food, gameOver, isPlaying, generateFood]);

  const handleGameOver = () => {
    setGameOver(true);
    setIsPlaying(false);
  };

  return (
    <div className="flex flex-col items-center bg-slate-900/50 p-6 rounded-3xl border border-cyan-500/30 shadow-[0_0_30px_rgba(34,211,238,0.15)] relative backdrop-blur-md">
      <div className="flex justify-between items-center w-full mb-4 px-2">
        <div className="flex items-center gap-2 text-cyan-400 font-mono text-xl font-bold">
          <Gamepad2 className="w-6 h-6" />
          <span>{score}</span>
        </div>
        <div className="flex items-center gap-2 text-fuchsia-400 font-mono text-xl font-bold">
          <Trophy className="w-6 h-6" />
          <span>{highScore}</span>
        </div>
      </div>

      <div
        ref={gameBoardRef}
        tabIndex={0}
        className="grid bg-slate-950/80 border-2 border-cyan-500/50 rounded-xl outline-none overflow-hidden relative shadow-[0_0_15px_rgba(34,211,238,0.3)] transition-shadow duration-300 focus:shadow-[0_0_35px_rgba(34,211,238,0.7)] focus:border-cyan-400"
        style={{
          gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
          width: 'min(80vw, 400px)',
          height: 'min(80vw, 400px)',
        }}
      >
        <div 
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: `linear-gradient(to right, #0ea5e9 1px, transparent 1px), linear-gradient(to bottom, #0ea5e9 1px, transparent 1px)`,
            backgroundSize: `${100/GRID_SIZE}% ${100/GRID_SIZE}%`
          }}
        />

        {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
          const x = i % GRID_SIZE;
          const y = Math.floor(i / GRID_SIZE);
          const isSnake = snake.some(s => s.x === x && s.y === y);
          const isHead = snake[0].x === x && snake[0].y === y;
          const isFood = food.x === x && food.y === y;

          return (
            <div
              key={i}
              className={`w-full h-full relative transition-all duration-75 ${
                isHead
                  ? 'bg-cyan-300 shadow-[0_0_12px_#67e8f9] z-10 rounded-sm scale-110'
                  : isSnake
                  ? 'bg-cyan-500 shadow-[0_0_8px_#06b6d4] rounded-sm scale-95'
                  : isFood
                  ? 'bg-gradient-to-br from-fuchsia-400 to-pink-600 shadow-[0_0_15px_#ec4899] rounded-full scale-75 animate-pulse'
                  : ''
              }`}
            />
          );
        })}

        {(!isPlaying && !gameOver) && (
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[2px] flex flex-col items-center justify-center z-20">
            <button
              onClick={startGame}
              className="px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-full transition-all flex items-center gap-3 shadow-[0_0_20px_rgba(34,211,238,0.5)] hover:shadow-[0_0_40px_rgba(34,211,238,0.9)] hover:scale-105 focus:outline-none"
            >
              <Play className="w-6 h-6 fill-current" />
              PLAY SNAKE
            </button>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-[4px] flex flex-col items-center justify-center z-20 p-6 text-center">
            <h3 className="text-4xl font-black text-fuchsia-500 mb-2 drop-shadow-[0_0_20px_rgba(217,70,239,0.9)]">GAME OVER</h3>
            <p className="text-cyan-200 mb-8 font-mono text-xl">FINAL SCORE: {score}</p>
            <button
              onClick={startGame}
              className="px-8 py-4 bg-transparent border-2 border-fuchsia-500 hover:bg-fuchsia-500/20 text-fuchsia-400 font-bold rounded-full transition-all flex items-center gap-3 shadow-[0_0_20px_rgba(217,70,239,0.3)] hover:shadow-[0_0_40px_rgba(217,70,239,0.7)] hover:scale-105 focus:outline-none"
            >
              <RotateCcw className="w-6 h-6" />
              TRY AGAIN
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
