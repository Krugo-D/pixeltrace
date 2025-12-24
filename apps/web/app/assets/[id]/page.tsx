'use client';

import RiskGauge from '@/components/RiskGauge';
import RiskRadar from '@/components/RiskRadar';
import { getAnalysis } from '@/lib/api';
import { AnalysisRunResponse, RiskTier } from '@pixeltrace/shared-types';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AssetPage() {
  const params = useParams();
  const id = params.id as string;
  const [analysis, setAnalysis] = useState<AnalysisRunResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    const fetchAnalysis = async () => {
      try {
        const data = await getAnalysis(id);
        if (data) {
          setAnalysis(data);
          setLoading(false);
          // Stop polling if analysis is complete
          if (data.completedAt) {
            if (interval) {
              clearInterval(interval);
              interval = null;
            }
            return;
          }
        }
        
        // If we get here, analysis doesn't exist or isn't complete yet
        // Set up polling if not already polling
        if (!interval) {
          interval = setInterval(fetchAnalysis, 2000);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load analysis');
        setLoading(false);
        if (interval) {
          clearInterval(interval);
          interval = null;
        }
      }
    };

    fetchAnalysis();

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [id]);

  if (loading && !analysis) {
    return (
      <main className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="text-gray-600">Analyzing image...</p>
          <p className="text-sm text-gray-400">This may take a few moments</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <p className="text-red-600">{error}</p>
        </div>
      </main>
    );
  }

  if (!analysis || !analysis.completedAt) {
    return (
      <main className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="text-gray-600">Analysis in progress...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Risk Assessment</h1>
              <p className="text-gray-600 text-base md:text-lg">Analysis completed</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{new Date(analysis.completedAt || '').toLocaleString()}</span>
              </div>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Upload New Image</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Overall Risk Score - Prominent */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 md:p-12">
          <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16">
            <div className="flex-shrink-0">
              <RiskGauge
                score={analysis.overallScore || 0}
                tier={(analysis.riskTier as RiskTier) || RiskTier.LOW}
              />
            </div>
            <div className="flex-1 max-w-2xl text-center lg:text-left">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                Overall Risk Assessment
              </h2>
              <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-4">
                Based on our analysis across multiple risk dimensions, this image has
                been assigned an overall risk score of <span className="font-semibold text-gray-900">{analysis.overallScore}</span> out of 100.
                This score is indicative and should be considered alongside your specific
                use case and legal requirements.
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm text-gray-600">Score calculated from 6 risk categories</span>
              </div>
            </div>
          </div>
        </div>

        {/* Risk Score Map */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Risk Profile Map</h2>
          <div className="flex justify-center">
            <RiskRadar results={analysis.results} />
          </div>
        </div>

        {/* Risk Scores */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Risk Scores</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analysis.results.map((result) => {
              const categoryLabels: Record<string, string> = {
                VISUAL_SIMILARITY: 'Visual Similarity',
                TRADEMARK: 'Trademark',
                COPYRIGHT: 'Copyright',
                CHARACTER: 'Character',
                TRAINING_DATA: 'Training Data',
                COMMERCIAL_USAGE: 'Commercial Usage',
              };
              const getScoreColor = (score: number) => {
                if (score >= 60) return 'text-red-600 bg-red-50';
                if (score >= 30) return 'text-yellow-600 bg-yellow-50';
                return 'text-green-600 bg-green-50';
              };
              const getConfidenceColor = (confidence: number) => {
                if (confidence >= 0.7) return 'text-green-600';
                if (confidence >= 0.4) return 'text-yellow-600';
                return 'text-gray-500';
              };
              return (
                <div key={result.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-gray-700">
                      {categoryLabels[result.category] || result.category}
                    </h3>
                    <span className={`px-2 py-1 rounded text-sm font-bold ${getScoreColor(result.score)}`}>
                      {result.score}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Confidence</span>
                    <span className={getConfidenceColor(result.confidence)}>
                      {Math.round(result.confidence * 100)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 md:p-8">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-semibold text-blue-900 mb-2">Important Notice</h3>
              <p className="text-sm md:text-base text-blue-800 leading-relaxed">
                This risk assessment is a proof-of-concept tool designed to provide indicative
                risk signals. It does not constitute legal advice, and results should not be
                considered definitive. For commercial use, especially in high-visibility
                campaigns, consult with legal counsel familiar with IP law in your jurisdiction.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

