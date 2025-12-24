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
    if (tier === RiskTier.LOW) return 'bg-green-50 border-green-200';
    if (tier === RiskTier.MEDIUM) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const getStrokeColor = () => {
    if (tier === RiskTier.LOW) return 'stroke-green-600';
    if (tier === RiskTier.MEDIUM) return 'stroke-yellow-600';
    return 'stroke-red-600';
  };

  const getRingColor = () => {
    if (tier === RiskTier.LOW) return 'text-green-100';
    if (tier === RiskTier.MEDIUM) return 'text-yellow-100';
    return 'text-red-100';
  };

  // Calculate circle progress (0-100 to 0-251.2 for circumference)
  const size = 200;
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90" width={size} height={size}>
          {/* Background ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth="12"
            fill="none"
            className={getRingColor()}
          />
          {/* Progress ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth="12"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className={`transition-all duration-1000 ${getStrokeColor()}`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className={`text-6xl md:text-7xl font-bold ${getColor()} leading-none`}>
            {score}
          </div>
          <div className="text-sm md:text-base text-gray-500 mt-2 font-medium">Risk Score</div>
        </div>
      </div>
      <div className={`px-6 py-3 rounded-full border-2 ${getBgColor()} ${getColor()}`}>
        <span className="text-base md:text-lg font-semibold">{tier} Risk</span>
      </div>
    </div>
  );
}

