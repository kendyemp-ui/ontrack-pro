/**
 * Grove — Logo oficial (anéis de crescimento formando um G)
 *
 * Geometria (viewBox 56×56, centro 28,28):
 *   Abertura do G: ~-55° → 0° (arco de ~305°)
 *   Travessão de cada anel termina na borda externa do anel imediatamente interior.
 *
 * Props:
 *   size          — largura/altura do SVG (default 48)
 *   color         — cor primária  (default Sage forest #4A7C59)
 *   accentColor   — cor do anel do meio (default #7FA882)
 *   wordmark      — exibe "Grove" ao lado do ícone
 *   wordmarkColor — cor do texto (default igual a `color`)
 *   wordmarkSize  — font-size em px do wordmark (default 28)
 *   className     — classes Tailwind extras no wrapper
 */

interface GroveIconProps {
  size?: number;
  color?: string;
  accentColor?: string;
  wordmark?: boolean;
  wordmarkColor?: string;
  wordmarkSize?: number;
  className?: string;
}

export function GroveIcon({
  size = 48,
  color = "#4A7C59",
  accentColor = "#7FA882",
  wordmark = false,
  wordmarkColor,
  wordmarkSize = 28,
  className,
}: GroveIconProps) {
  const wColor = wordmarkColor ?? color;

  return (
    <span
      className={`inline-flex items-center gap-3 ${className ?? ""}`}
      aria-label="Grove"
    >
      {/* ── SVG icon ── */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 56 56"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/*
          Outer ring  r=22  — forest green
          Start : (40.6, 10.0)  [28 + 22·cos(-55°), 28 + 22·sin(-55°)]
          End   : (50, 28)      [28 + 22, 28]  → 0°
          Crossbar → (42.5, 28) [aligns with middle ring end]
        */}
        <path
          d="M 40.6 10 A 22 22 0 1 0 50 28 L 42.5 28"
          stroke={color}
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/*
          Middle ring  r=14.5  — sage green
          Start : (36.3, 16.1)
          End   : (42.5, 28)
          Crossbar → (36, 28)  [aligns with inner ring end]
        */}
        <path
          d="M 36.3 16.1 A 14.5 14.5 0 1 0 42.5 28 L 36 28"
          stroke={accentColor}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/*
          Inner ring  r=8  — forest green
          Start : (32.6, 21.4)
          End   : (36, 28)
          Crossbar → (28, 28)  [centro]
        */}
        <path
          d="M 32.6 21.4 A 8 8 0 1 0 36 28 L 28 28"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>

      {/* ── Wordmark opcional ── */}
      {wordmark && (
        <span
          style={{
            fontSize: wordmarkSize,
            fontWeight: 700,
            color: wColor,
            letterSpacing: "-0.03em",
            lineHeight: 1,
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          Grove
        </span>
      )}
    </span>
  );
}

export default GroveIcon;
