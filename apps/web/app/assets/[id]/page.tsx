'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getAnalysis, getAsset } from '@/lib/api';
import RiskGauge from '@/components/RiskGauge';
import RiskCard from '@/components/RiskCard';
import { AnalysisRunResponse, RiskTier } from '@pixeltrace/shared-types';

export default function AssetPage() {
  const params = useParams();
  const id = params.id as string;
  const [analysis, setAnalysis] = useState<AnalysisRunResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const fetchAnalysis = async () => {
      try {
        const data = await getAnalysis(id);
        if (data) {
          setAnalysis(data);
          setLoading(false);
          // Stop polling if analysis is complete
          if (data.completedAt) {
            if (interval) clearInterval(interval);
          }
        } else {
          // Analysis not started yet, poll every 2 seconds
          if (!interval) {
            interval = setInterval(fetchAnalysis, 2000);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load analysis');
        setLoading(false);
        if (interval) clearInterval(interval);
      }
    };

    fetchAnalysis();

    return () => {
      if (interval) clearInterval(interval);
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
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{new Date(analysis.completedAt || '').toLocaleString()}</span>
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
        <RiskRadar results={analysis.results} />

        {/* Risk Breakdown */}
        <div className="space-y-4 md:space-y-6">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Risk Breakdown</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-gray-300 to-transparent"></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {analysis.results.map((result) => (
              <RiskCard key={result.id} result={result} />
            ))}
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

