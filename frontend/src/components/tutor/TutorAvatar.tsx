import { useRef, useEffect } from 'react';

export type AvatarState = 'idle' | 'speaking' | 'listening' | 'thinking';

interface Props {
  state: AvatarState;
  playWelcome?: boolean;
  onWelcomeEnd?: () => void;
  size?: number;
}

export function TutorAvatar({ state, playWelcome = false, onWelcomeEnd, size = 260 }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    if (playWelcome) {
      v.muted = false;
      v.loop = false;
      v.playbackRate = 1;
      v.currentTime = 0;
      v.onended = () => { onWelcomeEnd?.(); };
      v.play().catch(() => { onWelcomeEnd?.(); });
    } else if (state === 'speaking') {
      v.muted = true;
      v.loop = true;
      v.playbackRate = 0.75;
      v.onended = null;
      if (v.paused) v.play().catch(() => {});
    } else {
      v.pause();
      v.muted = true;
      v.loop = false;
      v.onended = null;
      if (state === 'idle') v.currentTime = 0;
    }
  }, [state, playWelcome, onWelcomeEnd]);

  const borderColor =
    state === 'listening' ? '#22c55e' :
    state === 'speaking'  ? '#3b82f6' :
    state === 'thinking'  ? '#a855f7' :
    playWelcome           ? '#f59e0b' :
    'transparent';

  return (
    <div style={{ width: size, position: 'relative', userSelect: 'none' }}>
      {/* Pulsing ring when listening */}
      {state === 'listening' && (
        <div style={{
          position: 'absolute', inset: -6, borderRadius: 24,
          border: '3px solid #22c55e',
          animation: 'pulse-ring 1.2s ease-out infinite',
          pointerEvents: 'none',
        }} />
      )}

      <video
        ref={videoRef}
        src="/tutor-yachay.mp4"
        playsInline
        preload="auto"
        style={{
          width: '100%',
          borderRadius: 20,
          border: `3px solid ${borderColor}`,
          transition: 'border-color 0.3s',
          display: 'block',
          background: '#1a1a2e',
        }}
      />

      {/* Status badge */}
      {(state !== 'idle' || playWelcome) && (
        <div style={{
          position: 'absolute', bottom: 8, left: 8,
          background: 'rgba(0,0,0,0.65)',
          borderRadius: 999, padding: '2px 10px',
          fontSize: 11, color: '#fff', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', gap: 5,
        }}>
          {playWelcome && <><span style={{ color: '#fbbf24' }}>●</span> Saludando</>}
          {!playWelcome && state === 'listening' && <><span style={{ color: '#22c55e' }}>●</span> Escuchando</>}
          {!playWelcome && state === 'speaking'  && <><span style={{ color: '#60a5fa' }}>●</span> Hablando</>}
          {!playWelcome && state === 'thinking'  && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ color: '#c084fc' }}>●</span> Pensando
              {[0,1,2].map(i => (
                <span key={i} style={{
                  width: 4, height: 4, borderRadius: '50%', background: '#c084fc',
                  animation: `bounce-dot 0.9s ${i * 0.2}s ease-in-out infinite`,
                  display: 'inline-block', marginLeft: 2,
                }} />
              ))}
            </span>
          )}
        </div>
      )}

      <style>{`
        @keyframes pulse-ring {
          0%   { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(1.15); opacity: 0; }
        }
        @keyframes bounce-dot {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  );
}
