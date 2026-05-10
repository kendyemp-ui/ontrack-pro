/**
 * Grove — Logo oficial (anéis de crescimento formando um G)
 *
 * Paleta atualizada para corresponder ao novo logo (mai/2026):
 *   Anel externo  → #1B3A24  (verde floresta escuro)
 *   Anel do meio  → #4A7C59  (verde médio)
 *   Anel interno  → #7FA882  (verde sage claro)
 *   Wordmark      → #111111  (preto-quase — igual ao logo gerado)
 *
 * Props:
 *   size          — largura/altura do SVG (default 48)
 *   color         — cor do anel externo   (default #1B3A24)
 *   accentColor   — cor do anel do meio   (default #4A7C59)
 *   innerColor    — cor do anel interno   (default #7FA882)
 *   wordmark      — exibe "Grove" ao lado do ícone
 *   wordmarkColor — cor do texto wordmark (default #111111)
 *   wordmarkSize  — font-size em px (default 28)
 *   className     — classes Tailwind extras no wrapper
 */

interface GroveIconProps {
  size?: number;
  color?: string;
  accentColor?: string;
  innerColor?: string;
  wordmark?: boolean;
  wordmarkColor?: string;
  wordmarkSize?: number;
  className?: string;
}

export function GroveIcon({
  size = 48,
  color = "#1B3A24",
  accentColor = "#4A7C59",
  innerColor = "#7FA882",
  wordmark = false,
  wordmarkColor = "#111111",
  wordmarkSize = 28,
  className,
}: GroveIconProps) {
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
        {/* Outer ring  r=22  — verde escuro */}
        <path
          d="M 40.6 10 A 22 22 0 1 0 50 28 L 42.5 28"
          stroke={color}
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Middle ring  r=14.5  — verde médio */}
        <path
          d="M 36.3 16.1 A 14.5 14.5 0 1 0 42.5 28 L 36 28"
          stroke={accentColor}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Inner ring  r=8  — verde sage */}
        <path
          d="M 32.6 21.4 A 8 8 0 1 0 36 28 L 28 28"
          stroke={innerColor}
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
            color: wordmarkColor,
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
