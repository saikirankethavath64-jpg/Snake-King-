import { useEffect, useRef, useState, useCallback } from 'react';
import { Trophy, Gamepad2, RotateCcw, Play, Timer, Settings2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { sounds } from '../lib/soundEffects';

type Point = { x: number; y: number };
type Difficulty = 'easy' | 'medium' | 'hard';

const SPEEDS: Record<Difficulty, number> = {
  easy: 180,
  medium: 120,
  hard: 70,
};

export default function SnakeGame() {
  const [gridSize, setGridSize] = useState(20);
  const [initialLength, setInitialLength] = useState(1);
  const [showSettings, setShowSettings] = useState(false);

  const [snake, setSnake] = useState<Point[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Point>({ x: 15, y: 5 });
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('snakeHighScore');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [gameOver, setGameOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');

  const directionRef = useRef<Point>({ x: 1, y: 0 });
  const nextDirectionRef = useRef<Point>({ x: 1, y: 0 });
  const gameBoardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('snakeHighScore', highScore.toString());
  }, [highScore]);

  const generateFood = useCallback((currentSnake: Point[]) => {
    let newFood;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * gridSize),
        y: Math.floor(Math.random() * gridSize),
      };
      const isOnSnake = currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
      if (!isOnSnake) break;
    }
    return newFood;
  }, [gridSize]);

  const startGame = () => {
    sounds.resume();
    const head = { x: Math.floor(gridSize / 2), y: Math.floor(gridSize / 2) };
    const startingSnake = Array.from({ length: initialLength }).map((_, i) => ({ x: head.x - i, y: head.y }));
    setSnake(startingSnake);
    setFood(generateFood(startingSnake));
    setScore(0);
    setGameOver(false);
    setIsPlaying(true);
    setShowSettings(false); // Close settings menu on play
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

        if (newHead.x < 0 || newHead.x >= gridSize || newHead.y < 0 || newHead.y >= gridSize) {
          sounds.playCrash();
          handleGameOver();
          return prevSnake;
        }

        if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
          sounds.playCrash();
          handleGameOver();
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];

        if (newHead.x === food.x && newHead.y === food.y) {
          sounds.playEat();
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

    const interval = setInterval(moveSnake, SPEEDS[difficulty]);
    return () => clearInterval(interval);
  }, [food, gameOver, isPlaying, generateFood, difficulty, gridSize]);

  const handleGameOver = () => {
    setGameOver(true);
    setIsPlaying(false);
  };

  return (
    <div className="flex flex-col items-center bg-slate-900/50 p-6 rounded-3xl border border-cyan-500/30 shadow-[0_0_30px_rgba(34,211,238,0.15)] relative backdrop-blur-md">
      <div className="flex justify-between items-center w-full mb-4 px-2 relative">
        <div className="flex items-center gap-2 text-cyan-400 font-mono text-xl font-bold">
          <Gamepad2 className="w-6 h-6" />
          <span>{score}</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-fuchsia-400 font-mono text-xl font-bold">
            <Trophy className="w-6 h-6" />
            <span>{highScore}</span>
          </div>
          <button 
            onClick={() => setShowSettings(!showSettings)}
            disabled={isPlaying && !gameOver}
            className={`p-2 rounded-full transition-colors ${isPlaying && !gameOver ? 'text-slate-600 cursor-not-allowed' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <Settings2 className="w-6 h-6" />
          </button>
        </div>

        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-12 w-64 bg-slate-900/95 border border-cyan-500/30 rounded-xl p-5 shadow-2xl backdrop-blur-xl z-50 flex flex-col gap-5 origin-top-right"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <h3 className="text-cyan-400 font-bold font-mono tracking-wider">SETTINGS</h3>
                <button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-xs font-bold text-slate-400 font-mono">DIFFICULTY</label>
                <div className="flex gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                  {(['easy', 'medium', 'hard'] as Difficulty[]).map(level => (
                    <button
                      key={level}
                      onClick={() => setDifficulty(level)}
                      className={`flex-1 py-1.5 rounded-md font-mono text-[10px] font-bold uppercase transition-all ${
                        difficulty === level 
                          ? 'bg-cyan-500 text-slate-950 shadow-[0_0_8px_rgba(34,211,238,0.4)]' 
                          : 'text-cyan-500 hover:bg-cyan-500/10'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <label className="flex justify-between items-end text-xs font-bold text-slate-400 font-mono">
                  <span>GRID SIZE</span>
                  <span className="text-cyan-400 text-[10px]">{gridSize} x {gridSize}</span>
                </label>
                <input 
                  type="range" min="10" max="40" step="5" 
                  value={gridSize} 
                  onChange={(e) => setGridSize(Number(e.target.value))} 
                  className="w-full accent-cyan-500" 
                />
              </div>

              <div className="flex flex-col gap-3">
                <label className="flex justify-between items-end text-xs font-bold text-slate-400 font-mono">
                  <span>START LENGTH</span>
                  <span className="text-fuchsia-400 text-[10px]">{initialLength}</span>
                </label>
                <input 
                  type="range" min="1" max="10" step="1" 
                  value={initialLength} 
                  onChange={(e) => setInitialLength(Number(e.target.value))} 
                  className="w-full accent-fuchsia-500" 
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div
        ref={gameBoardRef}
        tabIndex={0}
        className="block bg-slate-950/80 border-2 border-cyan-500/50 rounded-xl outline-none overflow-hidden relative shadow-[0_0_15px_rgba(34,211,238,0.3)] transition-shadow duration-300 focus:shadow-[0_0_35px_rgba(34,211,238,0.7)] focus:border-cyan-400"
        style={{
          width: 'min(80vw, 400px)',
          height: 'min(80vw, 400px)',
        }}
      >
        <div 
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: `linear-gradient(to right, #0ea5e9 1px, transparent 1px), linear-gradient(to bottom, #0ea5e9 1px, transparent 1px)`,
            backgroundSize: `${100/gridSize}% ${100/gridSize}%`
          }}
        />

        <motion.div
           className="absolute z-0 bg-gradient-to-br from-fuchsia-400 to-pink-600 shadow-[0_0_15px_#ec4899] rounded-full"
           style={{
             width: `${100 / gridSize}%`,
             height: `${100 / gridSize}%`,
             left: `${(food.x / gridSize) * 100}%`,
             top: `${(food.y / gridSize) * 100}%`,
           }}
           animate={{ scale: [0.6, 0.85, 0.6], rotate: [0, 180, 360] }}
           transition={{ scale: { repeat: Infinity, duration: 1.5, ease: "easeInOut" }, rotate: { repeat: Infinity, duration: 3, ease: "linear" } }}
        />

        {snake.map((segment, index) => {
           const isHead = index === 0;
           return (
             <motion.div
               key={index}
               className={`absolute ${
                  isHead
                    ? 'bg-cyan-300 shadow-[0_0_12px_#67e8f9] z-10'
                    : 'bg-cyan-500 shadow-[0_0_8px_#06b6d4]'
               }`}
               style={{
                 width: `${100 / gridSize}%`,
                 height: `${100 / gridSize}%`,
               }}
               initial={false}
               animate={{ 
                 left: `${(segment.x / gridSize) * 100}%`, 
                 top: `${(segment.y / gridSize) * 100}%`,
                 scale: isHead ? 1.05 : 0.85,
                 borderRadius: isHead ? '8px' : '4px',
                 opacity: Math.max(0.3, 1 - (index * 0.02))
               }}
               transition={{ 
                 left: { type: 'tween', ease: 'linear', duration: SPEEDS[difficulty] / 1000 },
                 top: { type: 'tween', ease: 'linear', duration: SPEEDS[difficulty] / 1000 },
               }}
             />
           );
        })}

        {(!isPlaying && !gameOver) && (
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[2px] flex flex-col items-center justify-center z-20">
            <div className="flex flex-col items-center gap-4 mb-8">
              <div className="text-cyan-300 font-mono text-xs opacity-80 flex items-center gap-1 bg-slate-900/50 px-3 py-1.5 rounded-full border border-cyan-500/20">
                <Timer className="w-4 h-4" /> 
                SPEED: {SPEEDS[difficulty]}MS / FRAME
              </div>
            </div>
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
