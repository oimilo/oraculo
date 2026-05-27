'use client';
import { useState, useEffect } from 'react';

interface PermissionScreenProps {
  onGranted: () => void;
}

export default function PermissionScreen({ onGranted }: PermissionScreenProps) {
  const [error, setError] = useState<string | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Check if permission already granted
  useEffect(() => {
    (async () => {
      try {
        const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        if (result.state === 'granted') {
          onGranted();
        }
      } catch {
        // Permissions API not supported -- show screen anyway
      }
    })();
  }, [onGranted]);

  async function requestMicrophone() {
    setIsRequesting(true);
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop()); // Stop immediately
      onGranted();
    } catch (err) {
      if (err instanceof DOMException) {
        if (err.name === 'NotAllowedError') {
          setError('Permissão negada. Precisamos do microfone para ouvir suas respostas.');
        } else if (err.name === 'NotFoundError') {
          setError('Nenhum microfone encontrado.');
        } else {
          setError('Erro ao acessar o microfone.');
        }
      }
    } finally {
      setIsRequesting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-8"
      style={{ background: '#000000' }}
    >
      {/* Match StartButton ambient warmth */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 38%, rgba(120, 40, 30, 0.06) 0%, transparent 55%)',
          transition: 'opacity 2s ease',
          opacity: mounted ? 1 : 0,
        }}
      />

      <div
        className="relative max-w-md text-center"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(16px)',
          transition: 'opacity 1.2s ease-out, transform 1.2s ease-out',
        }}
      >
        {/* Ornamental line */}
        <div className="mx-auto mb-10 w-12 h-px bg-white/12" />

        <p
          className="text-white/40 mb-4 leading-relaxed"
          style={{
            fontFamily: 'var(--font-cormorant), Georgia, serif',
            fontSize: '1rem',
            fontWeight: 300,
            letterSpacing: '0.04em',
          }}
        >
          Vamos precisar do seu microfone
          <br />
          para ouvir suas respostas.
        </p>

        <p
          className="mb-12"
          style={{
            fontFamily: 'Georgia, serif',
            fontSize: '0.72rem',
            color: 'rgba(255, 255, 255, 0.22)',
            letterSpacing: '0.04em',
          }}
        >
          Suas palavras não são gravadas — apenas processadas no momento.
        </p>

        <button
          onClick={requestMicrophone}
          disabled={isRequesting}
          className="group relative px-12 py-4 rounded-full transition-all duration-500 disabled:opacity-40"
          style={{
            fontFamily: 'var(--font-cormorant), Georgia, serif',
            fontSize: '1.05rem',
            fontWeight: 400,
            letterSpacing: '0.16em',
            color: 'rgba(255, 255, 255, 0.6)',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            animation: mounted ? 'start-glow 6s ease-in-out infinite' : 'none',
          }}
        >
          <span className="relative z-10 group-hover:text-white/80 transition-all duration-700">
            {isRequesting ? 'Aguardando permissão...' : 'Permitir microfone'}
          </span>
          <div
            className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"
            style={{ background: 'rgba(255, 255, 255, 0.04)' }}
          />
        </button>

        {error && (
          <p className="mt-8" style={{ fontFamily: 'Georgia, serif', fontSize: '0.78rem', color: 'rgba(200, 80, 60, 0.6)' }}>
            {error}
          </p>
        )}

        {/* Bottom ornamental line */}
        <div className="mx-auto mt-12 w-8 h-px bg-white/8" />
      </div>
    </div>
  );
}
