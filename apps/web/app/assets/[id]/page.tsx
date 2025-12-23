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
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Risk Assessment</h1>
          <p className="text-gray-600">Analysis completed</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="flex flex-col md:flex-row items-center justify-center gap-12">
            <RiskGauge
              score={analysis.overallScore || 0}
              tier={(analysis.riskTier as RiskTier) || RiskTier.LOW}
            />
            <div className="flex-1 max-w-md">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Overall Risk Assessment
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Based on our analysis across multiple risk dimensions, this image has
                been assigned an overall risk score of {analysis.overallScore} out of 100.
                This score is indicative and should be considered alongside your specific
                use case and legal requirements.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900">Risk Breakdown</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {analysis.results.map((result) => (
              <RiskCard key={result.id} result={result} />
            ))}
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Important Notice</h3>
          <p className="text-sm text-blue-800 leading-relaxed">
            This risk assessment is a proof-of-concept tool designed to provide indicative
            risk signals. It does not constitute legal advice, and results should not be
            considered definitive. For commercial use, especially in high-visibility
            campaigns, consult with legal counsel familiar with IP law in your jurisdiction.
          </p>
        </div>
      </div>
    </main>
  );
}

