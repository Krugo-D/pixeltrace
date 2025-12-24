'use client';

import { RiskResult, RiskCategory } from '@pixeltrace/shared-types';

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
  const size = 280;
  const center = size / 2;
  const radius = size / 2 - 40;
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
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8 shadow-sm">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Risk Score Map</h3>
        
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Radar Chart */}
          <div className="flex-shrink-0">
            <svg width={size} height={size} className="overflow-visible">
              {/* Grid circles */}
              {gridCircles.map(({ r, level }) => (
                <circle
                  key={level}
                  cx={center}
                  cy={center}
                  r={r}
                  fill="none"
                  stroke={level === 100 ? '#e5e7eb' : '#f3f4f6'}
                  strokeWidth={level === 100 ? 1.5 : 1}
                  className="opacity-60"
                />
              ))}

              {/* Axis lines */}
              {axisLines.map((line, index) => (
                <line
                  key={index}
                  x1={center}
                  y1={center}
                  x2={line.x}
                  y2={line.y}
                  stroke="#e5e7eb"
                  strokeWidth={1}
                  className="opacity-40"
                />
              ))}

              {/* Risk polygon */}
              <path
                d={pathData}
                fill="rgba(239, 68, 68, 0.2)"
                stroke="rgb(239, 68, 68)"
                strokeWidth={2}
                className="transition-all duration-500"
              />

              {/* Data points */}
              {points.map((point, index) => (
                <g key={index}>
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r={4}
                    fill="rgb(239, 68, 68)"
                    className="transition-all duration-500"
                  />
                  {/* Labels */}
                  <text
                    x={point.x + (point.x > center ? 8 : -8)}
                    y={point.y + (point.y > center ? 12 : -4)}
                    textAnchor={point.x > center ? 'start' : 'end'}
                    className="text-xs font-medium fill-gray-700"
                  >
                    {point.score}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          {/* Legend */}
          <div className="flex-1 space-y-2 min-w-0">
            {points.map((point, index) => {
              const result = resultsMap.get(point.category);
              return (
                <div
                  key={index}
                  className="flex items-center justify-between gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{
                        backgroundColor: 'rgb(239, 68, 68)',
                      }}
                    />
                    <span className="text-sm font-medium text-gray-700 truncate">
                      {point.label}
                    </span>
                  </div>
                  <span className={`text-sm font-semibold ${getScoreColor(point.score)} flex-shrink-0`}>
                    {point.score}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

