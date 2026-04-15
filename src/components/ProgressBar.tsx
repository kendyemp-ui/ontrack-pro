interface ProgressBarProps {
  value: number;
  max: number;
  label: string;
  unit: string;
  colorClass?: string;
  showRemaining?: boolean;
}

const ProgressBar = ({ value, max, label, unit, colorClass = 'gradient-accent', showRemaining = true }: ProgressBarProps) => {
  const percentage = Math.min((value / max) * 100, 100);
  const isOver = value > max;
  const remaining = max - value;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-foreground uppercase tracking-wider">{label}</span>
        <span className="text-xs font-semibold text-foreground font-heading">
          {value}{unit} <span className="text-muted-foreground font-normal">/ {max}{unit}</span>
        </span>
      </div>
      <div className="progress-bar h-1.5">
        <div
          className={`progress-fill ${isOver ? 'bg-destructive' : colorClass}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showRemaining && (
        <p className={`text-[10px] ${isOver ? 'text-destructive' : 'text-muted-foreground'}`}>
          {isOver
            ? `Excedeu ${Math.abs(remaining)}${unit}`
            : `Faltam ${remaining}${unit}`}
        </p>
      )}
    </div>
  );
};

export default ProgressBar;
