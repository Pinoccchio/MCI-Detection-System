"use client";

interface ConfidenceGaugeProps {
  confidence: number; // 0-1
}

export function ConfidenceGauge({ confidence }: ConfidenceGaugeProps) {
  const percentage = Math.round(confidence * 100);

  const getColor = () => {
    if (percentage >= 80) return "text-green-500";
    if (percentage >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getBackgroundColor = () => {
    if (percentage >= 80) return "bg-green-500";
    if (percentage >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getLabel = () => {
    if (percentage >= 80) return "High Confidence";
    if (percentage >= 60) return "Moderate Confidence";
    return "Low Confidence";
  };

  return (
    <div className="space-y-3">
      {/* Progress bar */}
      <div className="relative h-8 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full ${getBackgroundColor()} transition-all duration-500 ease-out flex items-center justify-end pr-3`}
          style={{ width: `${percentage}%` }}
        >
          <span className="text-sm font-bold text-white">
            {percentage}%
          </span>
        </div>
      </div>

      {/* Label */}
      <div className="flex items-center justify-between">
        <span className={`text-sm font-semibold ${getColor()}`}>
          {getLabel()}
        </span>
        <div className="flex gap-2 text-xs text-muted-foreground">
          <span>0%</span>
          <span className="mx-2">50%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Gauge visualization (circular) */}
      <div className="flex justify-center pt-4">
        <div className="relative w-40 h-40">
          <svg className="transform -rotate-90 w-40 h-40">
            {/* Background circle */}
            <circle
              cx="80"
              cy="80"
              r="70"
              stroke="currentColor"
              strokeWidth="12"
              fill="transparent"
              className="text-muted"
            />
            {/* Progress circle */}
            <circle
              cx="80"
              cy="80"
              r="70"
              stroke="currentColor"
              strokeWidth="12"
              fill="transparent"
              strokeDasharray={`${2 * Math.PI * 70}`}
              strokeDashoffset={`${2 * Math.PI * 70 * (1 - confidence)}`}
              className={`${getBackgroundColor().replace('bg-', 'text-')} transition-all duration-500`}
              strokeLinecap="round"
            />
          </svg>
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-3xl font-bold ${getColor()}`}>
              {percentage}%
            </span>
            <span className="text-xs text-muted-foreground mt-1">
              Confidence
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
