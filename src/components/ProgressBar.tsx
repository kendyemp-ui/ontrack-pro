interface ProgressBarProps {
  value: number;
  max: number;
  label: string;
  unit: string;
  colorClass?: string;
  showRemaining?: boolean;
}

const ProgressBar = ({ value, max, label, unit, colorClass = 'gradient-primary', showRemaining = true }: ProgressBarProps) => {
  const percentage = Math.min((value / max) * 100, 100);
  const isOver = value > max;
  const remaining = max - value;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span className="text-sm font-semibold text-foreground">
          {value}{unit} <span className="text-muted-foreground font-normal">/ {max}{unit}</span>
        </span>
      </div>
      <div className="progress-bar h-2.5">
        <div
          className={`progress-fill ${isOver ? 'bg-destructive' : colorClass}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showRemaining && (
        <p className={`text-xs ${isOver ? 'text-destructive' : 'text-muted-foreground'}`}>
          {isOver
            ? `Excedeu ${Math.abs(remaining)}${unit}`
            : `Faltam ${remaining}${unit}`}
        </p>
      )}
    </div>
  );
};

export default ProgressBar;
