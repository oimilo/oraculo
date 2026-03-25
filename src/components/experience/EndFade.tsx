'use client';
import { useEffect, useState } from 'react';

export default function EndFade() {
  const [opacity, setOpacity] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => setOpacity(1), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 bg-black z-50 transition-opacity duration-[3000ms]" style={{ opacity }} />
  );
}
