'use client';

import { RiskResult } from '@pixeltrace/shared-types';

interface RiskCardProps {
  result: RiskResult;
}

const categoryLabels: Record<string, string> = {
  VISUAL_SIMILARITY: 'Visual Similarity',
  TRADEMARK: 'Trademark / Brand Confusion',
  COPYRIGHT: 'Copyright Style Mimicry',
  CHARACTER: 'Character / Celebrity Likeness',
  TRAINING_DATA: 'Training Data Ambiguity',
  COMMERCIAL_USAGE: 'Commercial Usage',
};

export default function RiskCard({ result }: RiskCardProps) {
  const getScoreColor = (score: number) => {
    if (score < 30) return 'text-green-700 bg-green-50 border-green-200';
    if (score < 60) return 'text-yellow-700 bg-yellow-50 border-yellow-200';
    return 'text-red-700 bg-red-50 border-red-200';
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence > 0.7) return 'text-blue-700';
    if (confidence > 0.4) return 'text-gray-700';
    return 'text-gray-500';
  };

  const getScoreBorder = (score: number) => {
    if (score < 30) return 'border-l-green-500';
    if (score < 60) return 'border-l-yellow-500';
    return 'border-l-red-500';
  };

  return (
    <div className={`bg-white rounded-xl border-l-4 ${getScoreBorder(result.score)} border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between mb-4 gap-4">
        <h3 className="text-lg md:text-xl font-semibold text-gray-900 leading-tight">
          {categoryLabels[result.category] || result.category}
        </h3>
        <div
          className={`px-4 py-2 rounded-lg text-lg font-bold flex-shrink-0 ${getScoreColor(
            result.score
          )}`}
        >
          {result.score}
        </div>
      </div>
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">Confidence</span>
          <span className={`text-sm font-semibold ${getConfidenceColor(result.confidence)}`}>
            {Math.round(result.confidence * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${result.confidence * 100}%` }}
          />
        </div>
      </div>
      <p className="text-sm md:text-base text-gray-700 leading-relaxed">{result.explanation}</p>
    </div>
  );
}

