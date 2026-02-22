"use client";

interface ProbabilityChartProps {
  probabilities: {
    "Cognitively Normal": number;
    "Mild Cognitive Impairment": number;
  };
}

export function ProbabilityChart({ probabilities }: ProbabilityChartProps) {
  const normalPercentage = Math.round(probabilities["Cognitively Normal"] * 100);
  const mciPercentage = Math.round(probabilities["Mild Cognitive Impairment"] * 100);

  const bars = [
    {
      label: "Cognitively Normal",
      value: probabilities["Cognitively Normal"],
      percentage: normalPercentage,
      color: "bg-green-500",
      lightColor: "bg-green-100",
    },
    {
      label: "Mild Cognitive Impairment",
      value: probabilities["Mild Cognitive Impairment"],
      percentage: mciPercentage,
      color: "bg-red-500",
      lightColor: "bg-red-100",
    },
  ];

  return (
    <div className="space-y-4">
      {bars.map((bar) => (
        <div key={bar.label} className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">{bar.label}</span>
            <span className="text-muted-foreground">{bar.percentage}%</span>
          </div>
          <div className="relative h-10 bg-muted rounded-lg overflow-hidden">
            <div
              className={`h-full ${bar.color} transition-all duration-500 ease-out flex items-center justify-end pr-3`}
              style={{ width: `${bar.percentage}%` }}
            >
              {bar.percentage > 10 && (
                <span className="text-sm font-semibold text-white">
                  {bar.value.toFixed(3)}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Comparison visualization */}
      <div className="mt-6 p-4 bg-muted/50 rounded-lg">
        <p className="text-sm text-muted-foreground mb-3">Visual Comparison</p>
        <div className="flex h-8 rounded-full overflow-hidden">
          <div
            className="bg-green-500 flex items-center justify-center text-xs font-semibold text-white transition-all duration-500"
            style={{ width: `${normalPercentage}%` }}
          >
            {normalPercentage > 15 && `${normalPercentage}%`}
          </div>
          <div
            className="bg-red-500 flex items-center justify-center text-xs font-semibold text-white transition-all duration-500"
            style={{ width: `${mciPercentage}%` }}
          >
            {mciPercentage > 15 && `${mciPercentage}%`}
          </div>
        </div>
        <div className="flex justify-between mt-2 text-xs">
          <span className="text-green-600 font-medium">Normal</span>
          <span className="text-red-600 font-medium">MCI</span>
        </div>
      </div>
    </div>
  );
}
