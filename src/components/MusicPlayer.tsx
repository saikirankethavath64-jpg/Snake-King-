import { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Disc3 } from 'lucide-react';
import { motion } from 'motion/react';

export const TRACKS = [
  {
    id: 1,
    title: "Neon Pulse",
    artist: "AI Gen Model A",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    cover: "https://images.unsplash.com/photo-1614729939124-032f0b5609ce?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: 2,
    title: "Synthwave Skyline",
    artist: "Neural Network",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    cover: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: 3,
    title: "Digital Dreams",
    artist: "DeepMind DJ",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    cover: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80",
  }
];

export default function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const [mockProgress, setMockProgress] = useState(false);

  const track = TRACKS[currentTrackIndex];

  const togglePlay = async () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
        setMockProgress(false);
      } else {
        try {
          await audioRef.current.play();
          setIsPlaying(true);
          setMockProgress(false);
        } catch (error) {
          console.warn("Audio playback failed, falling back to mock playback", error);
          setIsPlaying(true);
          setMockProgress(true); // Start mock progress
        }
      }
    }
  };

  const handleSkip = (dir: 1 | -1) => {
    let newIndex = currentTrackIndex + dir;
    if (newIndex < 0) newIndex = TRACKS.length - 1;
    if (newIndex >= TRACKS.length) newIndex = 0;
    setCurrentTrackIndex(newIndex);
    setProgress(0);
  };

  useEffect(() => {
    // Auto-play when track changes if already playing
    if (isPlaying && audioRef.current) {
      audioRef.current.play().then(() => {
        setMockProgress(false);
      }).catch(e => {
        console.warn("Auto-play prevented, mocking", e);
        setMockProgress(true);
      });
    }
  }, [currentTrackIndex]);

  useEffect(() => {
    // Mock progress if the audio failed to load/play
    if (mockProgress && isPlaying) {
      const interval = setInterval(() => {
        setProgress(p => {
          if (p >= 100) {
            handleEnded();
            return 0;
          }
          return p + 0.5; // Update faster, approx 20s per track for mock
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [mockProgress, isPlaying, currentTrackIndex]);

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (audio && audio.duration) {
      setProgress((audio.currentTime / audio.duration) * 100);
    }
  };

  const handleEnded = () => {
    handleSkip(1); // Auto-play next track
  };

  return (
    <div className="w-full max-w-sm bg-slate-900/50 p-6 rounded-3xl border border-fuchsia-500/30 shadow-[0_0_30px_rgba(217,70,239,0.15)] flex flex-col items-center backdrop-blur-md">
      <div className="relative w-48 h-48 mb-6 mt-4">
        <motion.div
          animate={{ rotate: isPlaying ? 360 : 0 }}
          transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
          className="w-full h-full rounded-full overflow-hidden border-4 border-slate-800 shadow-[0_0_20px_rgba(217,70,239,0.3)]"
        >
          <img src={track.cover} alt={track.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 m-auto w-12 h-12 bg-slate-900 rounded-full border border-slate-700 flex justify-center items-center">
             <Disc3 className="w-6 h-6 text-fuchsia-500/50" />
          </div>
        </motion.div>
      </div>

      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-fuchsia-400 drop-shadow-[0_0_5px_rgba(217,70,239,0.5)]">{track.title}</h2>
        <p className="text-slate-400 text-sm mt-1">{track.artist}</p>
      </div>

      <div className="w-full h-1.5 bg-slate-800 rounded-full mb-8 overflow-hidden relative">
        <div
          className="absolute left-0 top-0 h-full bg-gradient-to-r from-cyan-500 to-fuchsia-500 shadow-[0_0_10px_#ec4899] transition-all duration-100 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex items-center gap-6">
        <button
          onClick={() => handleSkip(-1)}
          className="p-3 text-slate-300 hover:text-cyan-400 hover:bg-slate-800 rounded-full transition-colors focus:outline-none"
        >
          <SkipBack className="w-6 h-6" />
        </button>

        <button
          onClick={togglePlay}
          className="p-5 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-full shadow-[0_0_15px_rgba(217,70,239,0.6)] hover:shadow-[0_0_25px_rgba(217,70,239,0.8)] transition-all focus:outline-none transform hover:scale-105"
        >
          {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
        </button>

        <button
          onClick={() => handleSkip(1)}
          className="p-3 text-slate-300 hover:text-cyan-400 hover:bg-slate-800 rounded-full transition-colors focus:outline-none"
        >
          <SkipForward className="w-6 h-6" />
        </button>
      </div>

      <audio
        ref={audioRef}
        src={track.src}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
      />
    </div>
  );
}
