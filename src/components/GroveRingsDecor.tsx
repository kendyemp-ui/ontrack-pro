/**
 * GroveRingsDecor
 * Elemento decorativo para as landing pages — anéis de crescimento em escala grande.
 * Usado como background art nas seções hero.
 *
 * Props:
 *   className  — classes Tailwind (posicionamento, opacidade, tamanho)
 *   rings      — quantos anéis renderizar (default 5)
 *   color      — cor dos arcos (default forest green)
 */

interface GroveRingsDecorProps {
  className?: string;
  rings?: number;
  color?: string;
}

// Raios dos anéis decorativos (viewBox 400×400, centro 200,200)
const RADII = [185, 148, 112, 78, 48, 24];

export function GroveRingsDecor({
  className,
  rings = 5,
  color = "hsl(141 25% 39%)",
}: GroveRingsDecorProps) {
  const activeRadii = RADII.slice(0, rings);

  return (
    <svg
      viewBox="0 0 400 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {activeRadii.map((r, i) => {
        // Mesmo ângulo de abertura do logo: -55° → 0°
        // cos(-55°) ≈ 0.574  sin(-55°) ≈ -0.819
        const cx = 200;
        const cy = 200;
        const sx = cx + r * 0.574;   // start x
        const sy = cy - r * 0.819;   // start y
        const ex = cx + r;            // end x (0°)
        const ey = cy;                // end y

        // Travessão alinha com o próximo anel (ou ao centro para o último)
        const nextR = activeRadii[i + 1] ?? 0;
        const cbx = cx + nextR;

        // Opacidade decresce do exterior para o interior
        const opacity = 0.13 - i * 0.02;
        const sw = Math.max(1, 2 - i * 0.25);

        return (
          <path
            key={r}
            d={`M ${sx.toFixed(1)} ${sy.toFixed(1)} A ${r} ${r} 0 1 0 ${ex} ${ey} L ${cbx} ${ey}`}
            stroke={color}
            strokeWidth={sw}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            opacity={opacity}
          />
        );
      })}
    </svg>
  );
}

export default GroveRingsDecor;
