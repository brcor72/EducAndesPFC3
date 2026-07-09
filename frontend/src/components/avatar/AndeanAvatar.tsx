import { useMemo } from 'react';

export interface AndeanAvatarProfile {
  displayName?: string;
  gender?: string;
  skinTone?: string;
  activity?: string;
  birthYear?: number;
}

// ── Paletas ───────────────────────────────────────────────────────────────────
const SKIN: Record<string, string> = {
  claro:  '#f0c090',
  medio:  '#c8894e',
  moreno: '#9b6234',
  oscuro: '#6b3d1e',
};
const SKIN_SHADOW: Record<string, string> = {
  claro:  '#d4a070',
  medio:  '#a06830',
  moreno: '#7a4820',
  oscuro: '#4a2410',
};

const ACTIVITY_BG: Record<string, [string, string]> = {
  agricultor:  ['#3a7a2e', '#5aaa48'],
  tejedora:    ['#c44040', '#e87050'],
  ganadero:    ['#8b6400', '#c49a20'],
  pastor:      ['#3a5a7a', '#5a8aaa'],
  artesana:    ['#8a2a6a', '#c45a9a'],
  comerciante: ['#2a4a8a', '#4a7aaa'],
  docente:     ['#2a6a5a', '#4aaa8a'],
  estudiante:  ['#5a3a8a', '#8a6acc'],
};

const CLOTHING_COLOR: Record<string, string> = {
  agricultor:  '#4a8a3a',
  tejedora:    '#c44040',
  ganadero:    '#9a7010',
  pastor:      '#4a6a8a',
  artesana:    '#8a3070',
  comerciante: '#3a5a9a',
  docente:     '#3a7a6a',
  estudiante:  '#6a4a9a',
};

// Colores del chullo (franjas andinas)
const CHULLO_STRIPES = ['#e8c020', '#c42020', '#2050c4', '#20a050', '#e86020'];

// ── Función auxiliar hash ─────────────────────────────────────────────────────
function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

// ── Componente principal ──────────────────────────────────────────────────────
interface Props {
  profile: AndeanAvatarProfile;
  size?: number;
  className?: string;
}

export function AndeanAvatar({ profile, size = 80, className = '' }: Props) {
  const {
    gender   = 'no_especificado',
    skinTone = 'medio',
    activity = 'estudiante',
    displayName = 'usuario',
    birthYear,
  } = profile;

  const isFemale = gender === 'femenino';
  const isMale   = gender === 'masculino';
  const skin     = SKIN[skinTone]        ?? SKIN.medio;
  const skinSh   = SKIN_SHADOW[skinTone] ?? SKIN_SHADOW.medio;
  const [bg1, bg2] = ACTIVITY_BG[activity] ?? ACTIVITY_BG.estudiante;
  const cloth    = CLOTHING_COLOR[activity] ?? CLOTHING_COLOR.estudiante;
  const isOlder  = birthYear ? (new Date().getFullYear() - birthYear) > 40 : false;

  // Color de cabello único por nombre
  const hairColors = ['#1a0800', '#2c1400', '#3a1a00', '#0a0400'];
  const hairColor  = hairColors[hash(displayName) % hairColors.length];

  // ID único para gradientes
  const uid = useMemo(() => hash(displayName + activity + skinTone).toString(36), [displayName, activity, skinTone]);

  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={`rounded-full ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id={`bg-${uid}`} cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor={bg2} />
          <stop offset="100%" stopColor={bg1} />
        </radialGradient>
        <clipPath id={`clip-${uid}`}>
          <circle cx="100" cy="100" r="100" />
        </clipPath>
      </defs>

      <g clipPath={`url(#clip-${uid})`}>
        {/* Fondo */}
        <circle cx="100" cy="100" r="100" fill={`url(#bg-${uid})`} />

        {/* Cuerpo / ropa */}
        <ellipse cx="100" cy="210" rx="90" ry="65" fill={cloth} />

        {/* Patrón geométrico andino en la ropa (franjas) */}
        {[0, 1, 2].map((i) => (
          <rect
            key={i}
            x="10" y={188 + i * 8} width="180" height="4"
            fill={CHULLO_STRIPES[i % CHULLO_STRIPES.length]}
            opacity="0.5"
          />
        ))}

        {/* Cuello */}
        <rect x="86" y="148" width="28" height="28" rx="4" fill={skin} />

        {/* Cabello trasero (femenino: trenzas) */}
        {isFemale && (
          <>
            <rect x="56" y="90" width="16" height="90" rx="8" fill={hairColor} />
            <rect x="128" y="90" width="16" height="90" rx="8" fill={hairColor} />
            {/* detalles de trenza */}
            {[0,1,2,3,4].map(i => (
              <ellipse key={i} cx="64" cy={110 + i * 16} rx="8" ry="5" fill={hairColor} opacity="0.6" />
            ))}
            {[0,1,2,3,4].map(i => (
              <ellipse key={i} cx="136" cy={110 + i * 16} rx="8" ry="5" fill={hairColor} opacity="0.6" />
            ))}
          </>
        )}

        {/* Cara */}
        <ellipse cx="100" cy="118" rx="44" ry="50" fill={skin} />

        {/* Sombras de cara */}
        <ellipse cx="100" cy="155" rx="30" ry="10" fill={skinSh} opacity="0.3" />

        {/* Cabello superior */}
        {isFemale ? (
          // Femenino: pelo partido al medio
          <path
            d={`M58,108 Q60,70 100,68 Q140,70 142,108 Q130,88 100,86 Q70,88 58,108Z`}
            fill={hairColor}
          />
        ) : isMale ? (
          // Masculino: pelo corto
          <path
            d={`M60,110 Q62,72 100,70 Q138,72 140,110 Q128,82 100,80 Q72,82 60,110Z`}
            fill={hairColor}
          />
        ) : (
          // No especificado: pelo neutro
          <path
            d={`M62,112 Q64,74 100,72 Q136,74 138,112 Q126,84 100,82 Q74,84 62,112Z`}
            fill={hairColor}
          />
        )}

        {/* ── Chullo andino ─────────────────────────────────────── */}
        {/* Orejeras */}
        <rect x="56" y="88" width="18" height="32" rx="9" fill={CHULLO_STRIPES[0]} />
        <rect x="126" y="88" width="18" height="32" rx="9" fill={CHULLO_STRIPES[0]} />
        {/* Franjas en orejeras */}
        {[0,1].map(i => (
          <rect key={i} x="56" y={96 + i*10} width="18" height="4" rx="2"
            fill={CHULLO_STRIPES[(i+1) % CHULLO_STRIPES.length]} />
        ))}
        {[0,1].map(i => (
          <rect key={i} x="126" y={96 + i*10} width="18" height="4" rx="2"
            fill={CHULLO_STRIPES[(i+1) % CHULLO_STRIPES.length]} />
        ))}

        {/* Cuerpo del chullo */}
        <path d="M62,100 L74,52 Q100,36 126,52 L138,100 Q120,88 100,88 Q80,88 62,100Z"
          fill={CHULLO_STRIPES[0]} />

        {/* Franjas del chullo */}
        {CHULLO_STRIPES.slice(1).map((color, i) => (
          <path
            key={i}
            d={`M${66 + i * 4},${96 - i * 8} Q100,${80 - i * 8} ${134 - i * 4},${96 - i * 8}`}
            fill="none"
            stroke={color}
            strokeWidth="5"
            strokeLinecap="round"
          />
        ))}

        {/* Pompón */}
        <circle cx="100" cy="40" r="10" fill={CHULLO_STRIPES[1]} />
        <circle cx="100" cy="40" r="6"  fill={CHULLO_STRIPES[3]} />
        <circle cx="100" cy="40" r="3"  fill={CHULLO_STRIPES[0]} />

        {/* ── Cara ─────────────────────────────────────────────── */}
        {/* Cejas */}
        <path d="M80,102 Q88,98 96,101" fill="none" stroke={hairColor} strokeWidth="2.5" strokeLinecap="round" />
        <path d="M104,101 Q112,98 120,102" fill="none" stroke={hairColor} strokeWidth="2.5" strokeLinecap="round" />

        {/* Ojos */}
        <ellipse cx="88" cy="112" rx="7" ry="7.5" fill="white" />
        <ellipse cx="112" cy="112" rx="7" ry="7.5" fill="white" />
        <circle cx="89" cy="113" r="4.5" fill="#1a0800" />
        <circle cx="113" cy="113" r="4.5" fill="#1a0800" />
        <circle cx="90.5" cy="111" r="1.5" fill="white" opacity="0.8" />
        <circle cx="114.5" cy="111" r="1.5" fill="white" opacity="0.8" />

        {/* Nariz */}
        <ellipse cx="100" cy="126" rx="4" ry="3" fill={skinSh} opacity="0.5" />

        {/* Boca: sonrisa */}
        <path d="M88,136 Q100,144 112,136" fill="none" stroke={skinSh} strokeWidth="2.5" strokeLinecap="round" />

        {/* Mejillas */}
        <ellipse cx="80" cy="130" rx="8" ry="5" fill="#e87080" opacity="0.25" />
        <ellipse cx="120" cy="130" rx="8" ry="5" fill="#e87080" opacity="0.25" />

        {/* Bigote (hombre mayor) */}
        {isMale && isOlder && (
          <path d="M90,133 Q100,138 110,133" fill={hairColor} opacity="0.7" stroke={hairColor} strokeWidth="2" strokeLinecap="round" />
        )}
      </g>
    </svg>
  );
}
