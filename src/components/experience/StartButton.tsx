'use client';

interface StartButtonProps {
  onClick: () => void;
}

export default function StartButton({ onClick }: StartButtonProps) {
  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center">
      <button
        onClick={onClick}
        className="
          bg-white/10 hover:bg-white/20
          border border-white/20
          text-white text-xl font-light tracking-wider
          px-16 py-8 rounded-full
          animate-pulse
          transition-all duration-300 hover:scale-105
        "
      >
        Toque para começar
      </button>
    </div>
  );
}
