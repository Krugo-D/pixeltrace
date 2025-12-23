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
    if (score < 30) return 'text-green-600 bg-green-50';
    if (score < 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence > 0.7) return 'text-blue-600';
    if (confidence > 0.4) return 'text-gray-600';
    return 'text-gray-400';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {categoryLabels[result.category] || result.category}
        </h3>
        <div
          className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(
            result.score
          )}`}
        >
          {result.score}
        </div>
      </div>
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Confidence</span>
          <span className={`text-sm font-medium ${getConfidenceColor(result.confidence)}`}>
            {Math.round(result.confidence * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${result.confidence * 100}%` }}
          />
        </div>
      </div>
      <p className="text-sm text-gray-700 leading-relaxed">{result.explanation}</p>
    </div>
  );
}

