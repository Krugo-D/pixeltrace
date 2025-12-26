'use client';

import { RiskCategory, RiskResult } from '@pixeltrace/shared-types';

interface RiskRadarProps {
  results: RiskResult[];
}

const categoryLabels: Record<RiskCategory, string> = {
  [RiskCategory.VISUAL_SIMILARITY]: 'Visual Similarity',
  [RiskCategory.TRADEMARK]: 'Trademark',
  [RiskCategory.COPYRIGHT]: 'Copyright',
  [RiskCategory.CHARACTER]: 'Character',
  [RiskCategory.TRAINING_DATA]: 'Training Data',
  [RiskCategory.COMMERCIAL_USAGE]: 'Commercial',
};

const categoryOrder: RiskCategory[] = [
  RiskCategory.VISUAL_SIMILARITY,
  RiskCategory.TRADEMARK,
  RiskCategory.COPYRIGHT,
  RiskCategory.CHARACTER,
  RiskCategory.TRAINING_DATA,
  RiskCategory.COMMERCIAL_USAGE,
];

export default function RiskRadar({ results }: RiskRadarProps) {
  const size = 340;
  const center = size / 2;
  const radius = size / 2 - 60;
  const numCategories = categoryOrder.length;
  const angleStep = (2 * Math.PI) / numCategories;

  // Create map of results by category
  const resultsMap = new Map(results.map(r => [r.category, r]));

  // Calculate points for each category
  const points = categoryOrder.map((category, index) => {
    const angle = index * angleStep - Math.PI / 2; // Start at top
    const result = resultsMap.get(category);
    const score = result?.score || 0;
    const normalizedScore = score / 100; // 0-1
    const pointRadius = radius * normalizedScore;
    
    return {
      category,
      label: categoryLabels[category],
      score,
      x: center + pointRadius * Math.cos(angle),
      y: center + pointRadius * Math.sin(angle),
      angle,
    };
  });

  // Create path for the polygon
  const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

  // Create grid circles (3 levels: 33, 66, 100)
  const gridCircles = [33, 66, 100].map(level => {
    const r = (radius * level) / 100;
    return { r, level };
  });

  // Create axis lines
  const axisLines = categoryOrder.map((_, index) => {
    const angle = index * angleStep - Math.PI / 2;
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
      angle,
    };
  });

  const getScoreColor = (score: number) => {
    if (score < 30) return 'text-green-600';
    if (score < 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="glass-panel w-full">
      <div className="p-6 md:p-8">
        <h3 className="text-2xl font-semibold text-gray-900 mb-6">Risk Score Map</h3>
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] items-center">
          <div className="bg-white/60 rounded-2xl p-4 flex items-center justify-center">
            <svg width={size} height={size} className="overflow-visible">
              {gridCircles.map(({ r, level }) => (
                <circle
                  key={level}
                  cx={center}
                  cy={center}
                  r={r}
                  fill="none"
                  stroke={level === 100 ? '#cbd5f5' : '#e2e8f0'}
                  strokeWidth={level === 100 ? 1.5 : 1}
                  className="opacity-60"
                />
              ))}

              {axisLines.map((line, index) => {
                const labelDistance = radius + 22;
                const labelX = center + labelDistance * Math.cos(line.angle);
                const labelY = center + labelDistance * Math.sin(line.angle);

                return (
                  <g key={index}>
                    <line
                      x1={center}
                      y1={center}
                      x2={line.x}
                      y2={line.y}
                      stroke="#cbd5f5"
                      strokeWidth={1}
                      className="opacity-40"
                    />
                    <text
                      x={labelX}
                      y={labelY}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="fill-gray-500 text-[10px] uppercase tracking-[0.4em] font-semibold"
                    >
                      {categoryLabels[categoryOrder[index]]}
                    </text>
                  </g>
                );
              })}

              <path
                d={pathData}
                fill="rgba(37, 99, 235, 0.1)"
                stroke="rgb(37, 99, 235)"
                strokeWidth={2}
                strokeLinejoin="round"
                className="transition-all duration-500"
              />

              {points.map((point, index) => (
                <g key={index}>
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r={4}
                    fill="rgb(37, 99, 235)"
                    className="transition-all duration-500"
                  />
                  <text
                    x={point.x}
                    y={point.y - 10}
                    textAnchor="middle"
                    className="text-[10px] font-semibold fill-slate-700"
                  >
                    {Math.round(point.score)}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          <div className="space-y-3">
            {points.map((point, index) => (
              <div
                key={index}
                className="flex items-center justify-between gap-3 p-3 rounded-2xl border border-transparent bg-white/80 hover:border-gray-200 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: 'rgb(37, 99, 235)' }}
                  />
                  <div>
                    <p className="text-sm font-semibold text-gray-800 truncate">{point.label}</p>
                    <p className="text-xs text-gray-500">
                      Confidence {Math.round((resultsMap.get(point.category)?.confidence ?? 0) * 100)}%
                    </p>
                  </div>
                </div>
                <span className={`text-sm font-bold ${getScoreColor(point.score)}`}>
                  {point.score}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


