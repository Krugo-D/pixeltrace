'use client';

import { RiskTier } from '@pixeltrace/shared-types';

interface RiskGaugeProps {
  score: number;
  tier: RiskTier;
}

export default function RiskGauge({ score, tier }: RiskGaugeProps) {
  const getColor = () => {
    if (tier === RiskTier.LOW) return 'text-green-600';
    if (tier === RiskTier.MEDIUM) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getBgColor = () => {
    if (tier === RiskTier.LOW) return 'bg-green-100';
    if (tier === RiskTier.MEDIUM) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getStrokeColor = () => {
    if (tier === RiskTier.LOW) return 'stroke-green-600';
    if (tier === RiskTier.MEDIUM) return 'stroke-yellow-600';
    return 'stroke-red-600';
  };

  // Calculate circle progress (0-100 to 0-251.2 for circumference)
  const circumference = 2 * Math.PI * 40; // radius = 40
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative w-32 h-32">
        <svg className="transform -rotate-90 w-32 h-32">
          <circle
            cx="64"
            cy="64"
            r="40"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-gray-200"
          />
          <circle
            cx="64"
            cy="64"
            r="40"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className={`transition-all duration-500 ${getStrokeColor()}`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className={`text-3xl font-bold ${getColor()}`}>{score}</div>
            <div className="text-xs text-gray-500">Risk Score</div>
          </div>
        </div>
      </div>
      <div className={`px-4 py-2 rounded-full ${getBgColor()} ${getColor()}`}>
        <span className="text-sm font-medium">{tier} Risk</span>
      </div>
    </div>
  );
}

