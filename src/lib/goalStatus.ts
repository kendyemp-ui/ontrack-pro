import type { DietObjective } from '@/data/mockData';

export type StatusTone = 'success' | 'warning' | 'destructive';

export interface GoalStatus {
  /** Semantic token: success | warning | destructive */
  tone: StatusTone;
  /** Tailwind text color class (semantic token) */
  textClass: string;
  /** Tailwind background tint class (10% opacity) */
  bgClass: string;
  /** Hex-like HSL var reference for charts/SVG */
  hsl: string;
  /** Short status label, e.g. "Alinhado com seu objetivo" */
  label: string;
  /** Longer message contextualised by the objective */
  message: string;
}

export const objectiveLabels: Record<DietObjective, string> = {
  lose: 'Perder peso',
  maintain: 'Manter peso',
  gain: 'Ganhar massa',
};

const toneStyles: Record<StatusTone, { textClass: string; bgClass: string; hsl: string }> = {
  success: {
    textClass: 'text-success',
    bgClass: 'bg-success/10 text-success',
    hsl: 'hsl(var(--success))',
  },
  warning: {
    textClass: 'text-warning',
    bgClass: 'bg-warning/10 text-warning',
    hsl: 'hsl(var(--warning))',
  },
  destructive: {
    textClass: 'text-destructive',
    bgClass: 'bg-destructive/10 text-destructive',
    hsl: 'hsl(var(--destructive))',
  },
};

const buildStatus = (tone: StatusTone, label: string, message: string): GoalStatus => ({
  tone,
  ...toneStyles[tone],
  label,
  message,
});

/**
 * Evaluates the calorie balance against the user's objective.
 *
 * Thresholds (kcal):
 *  - "near equilibrium" = |balance| <= NEAR
 *  - "moderate" deficit/surplus = balance within MODERATE bounds
 *  - "significant" otherwise
 *
 * @param balance consumed - expenditure (negative = deficit, positive = surplus)
 * @param objective user-selected diet goal
 */
export function getCalorieStatus(balance: number, objective: DietObjective): GoalStatus {
  const NEAR = 150;        // tolerance around equilibrium
  const MODERATE = 600;    // upper bound for healthy deficit/surplus

  const absVal = Math.abs(balance);
  const isDeficit = balance < 0;
  const isSurplus = balance > 0;

  if (objective === 'lose') {
    if (isDeficit && absVal >= NEAR && absVal <= MODERATE) {
      return buildStatus('success', 'Déficit adequado para sua fase', 'Déficit calórico coerente com a meta de perder peso.');
    }
    if (absVal < NEAR) {
      return buildStatus('warning', 'Próximo do equilíbrio', 'Você está perto do equilíbrio — para perder peso, busque um déficit maior.');
    }
    if (isDeficit && absVal > MODERATE) {
      return buildStatus('warning', 'Déficit muito alto', 'Déficit acima do esperado — atenção para não comprometer energia e recuperação.');
    }
    if (isSurplus) {
      return buildStatus('destructive', 'Acima do esperado', 'Superávit calórico — fora do objetivo de perder peso.');
    }
  }

  if (objective === 'maintain') {
    if (absVal <= NEAR) {
      return buildStatus('success', 'Dentro da meta do dia', 'Balanço alinhado com a meta de manter peso.');
    }
    if (absVal <= MODERATE) {
      return buildStatus('warning', isDeficit ? 'Leve déficit' : 'Leve superávit', `${isDeficit ? 'Pequeno déficit' : 'Pequeno superávit'} — atenção para manter o equilíbrio.`);
    }
    return buildStatus('destructive', isDeficit ? 'Déficit significativo' : 'Superávit significativo', `Desvio considerável do equilíbrio — ${isDeficit ? 'consumo abaixo' : 'consumo acima'} do esperado para manter peso.`);
  }

  if (objective === 'gain') {
    if (isSurplus && absVal >= NEAR && absVal <= MODERATE) {
      return buildStatus('success', 'Superávit adequado para sua fase', 'Superávit calórico coerente com a meta de ganhar massa.');
    }
    if (absVal < NEAR) {
      return buildStatus('warning', 'Próximo do equilíbrio', 'Você está perto do equilíbrio — para ganhar massa, busque um superávit maior.');
    }
    if (isSurplus && absVal > MODERATE) {
      return buildStatus('warning', 'Superávit muito alto', 'Superávit acima do esperado — pode favorecer ganho de gordura.');
    }
    if (isDeficit) {
      return buildStatus('destructive', 'Abaixo do esperado', 'Déficit calórico — fora do objetivo de ganhar massa.');
    }
  }

  // fallback (should not reach)
  return buildStatus('warning', 'Sem referência', 'Balanço calórico sem interpretação definida.');
}

/** Short caption used under the balance number in cards/charts. */
export function getBalanceCaption(balance: number, objective: DietObjective): string {
  const status = getCalorieStatus(balance, objective);
  return status.label.toLowerCase();
}
