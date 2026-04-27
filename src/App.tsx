import SnakeGame from './components/SnakeGame';
import MusicPlayer from './components/MusicPlayer';

export default function App() {
  return (
    <div className="min-h-screen bg-transparent flex flex-col items-center justify-center p-4 lg:p-8 relative overflow-hidden font-sans">
      {/* Animated Background Grid is applied globally via body in index.css */}
      <div className="absolute inset-0 bg-grid z-0 opacity-40 pointer-events-none" />

      {/* Glowing Accents */}
      <div className="absolute top-1/4 left-1/4 w-[30rem] h-[30rem] bg-cyan-500/20 rounded-full blur-[120px] pointer-events-none z-0 mix-blend-screen" />
      <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-fuchsia-500/20 rounded-full blur-[120px] pointer-events-none z-0 mix-blend-screen" />

      <div className="z-10 text-center mb-10 w-full">
        <h1 className="text-5xl lg:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-cyan-400 via-fuchsia-400 to-pink-600 drop-shadow-[0_0_15px_rgba(236,72,153,0.4)]">
          NEON SNAKE
        </h1>
        <p className="mt-3 text-cyan-200/60 font-mono text-sm tracking-[0.2em] font-medium uppercase">
          // Sync your moves to the beat
        </p>
      </div>

      <div className="z-10 flex flex-col-reverse lg:flex-row gap-8 lg:gap-16 items-center lg:items-stretch justify-center w-full max-w-6xl">
        <div className="flex flex-col justify-center w-full lg:w-auto">
          <MusicPlayer />
        </div>
        <div className="flex flex-col justify-center">
          <SnakeGame />
        </div>
      </div>
    </div>
  );
}
