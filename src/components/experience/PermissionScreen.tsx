'use client';
import { useState, useEffect } from 'react';

interface PermissionScreenProps {
  onGranted: () => void;
}

export default function PermissionScreen({ onGranted }: PermissionScreenProps) {
  const [error, setError] = useState<string | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);

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
    <div className="fixed inset-0 bg-black flex items-center justify-center p-8 z-50">
      <div className="max-w-md text-center">
        <h2 className="text-2xl text-white mb-4 font-light">Bem-vindo ao Oráculo</h2>
        <p className="text-gray-300 mb-8 leading-relaxed">
          Vamos precisar do seu microfone para ouvir suas respostas.
          Suas palavras não são gravadas — apenas processadas no momento.
        </p>
        <button
          onClick={requestMicrophone}
          disabled={isRequesting}
          className="bg-white/10 hover:bg-white/20 border border-white/30 text-white px-8 py-4 rounded-full text-lg transition-all duration-300 disabled:opacity-50"
        >
          {isRequesting ? 'Aguardando permissão...' : 'Permitir microfone'}
        </button>
        {error && <p className="text-red-400 mt-6 text-sm">{error}</p>}
      </div>
    </div>
  );
}
