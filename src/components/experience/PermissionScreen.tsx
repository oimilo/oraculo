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
          setError('Permissao negada. Precisamos do microfone para ouvir suas respostas.');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-8"
      style={{
        background: 'radial-gradient(ellipse at center, #0a0a0a 0%, #000000 70%)',
      }}
    >
      <div
        className="max-w-md text-center"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(16px)',
          transition: 'opacity 1.2s ease-out, transform 1.2s ease-out',
        }}
      >
        {/* Ornamental line */}
        <div className="mx-auto mb-8 w-12 h-px bg-white/20" />

        <h2
          className="text-3xl text-white/90 mb-2 font-light tracking-wide"
          style={{ fontFamily: 'var(--font-cormorant), Georgia, serif' }}
        >
          O Oraculo
        </h2>

        <p
          className="text-white/30 text-sm mb-8 tracking-widest uppercase"
          style={{ fontFamily: 'var(--font-cormorant), Georgia, serif' }}
        >
          experiencia interativa de voz
        </p>

        <p className="text-white/50 mb-10 leading-relaxed text-sm" style={{ fontFamily: 'Georgia, serif' }}>
          Vamos precisar do seu microfone para ouvir suas respostas.
          <br />
          Suas palavras nao sao gravadas — apenas processadas no momento.
        </p>

        <button
          onClick={requestMicrophone}
          disabled={isRequesting}
          className="group relative px-10 py-4 rounded-full text-white/80 text-base tracking-wider transition-all duration-500 disabled:opacity-40"
          style={{
            fontFamily: 'var(--font-cormorant), Georgia, serif',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            animation: 'oracle-glow 4s ease-in-out infinite',
          }}
        >
          <span className="relative z-10 group-hover:text-white transition-colors duration-300">
            {isRequesting ? 'Aguardando permissao...' : 'Permitir microfone'}
          </span>
          <div
            className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{ background: 'rgba(255, 255, 255, 0.06)' }}
          />
        </button>

        {error && (
          <p className="text-red-400/70 mt-8 text-sm" style={{ fontFamily: 'Georgia, serif' }}>
            {error}
          </p>
        )}

        {/* Bottom ornamental line */}
        <div className="mx-auto mt-12 w-8 h-px bg-white/10" />
      </div>
    </div>
  );
}
