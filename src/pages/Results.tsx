import { useLocation, useNavigate } from 'react-router-dom';
import { Trophy, AlertTriangle } from 'lucide-react';
import type { RecommendationResponse, CardResult } from '../types';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { PageLayout } from '../components/layout/PageLayout';

function confidenceColor(tier: string): 'green' | 'yellow' | 'gray' {
  if (tier === 'HIGH') return 'green';
  if (tier === 'MEDIUM') return 'yellow';
  return 'gray';
}

export function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state?.result as RecommendationResponse | undefined;

  if (!result) {
    return (
      <PageLayout>
        <div className="text-center py-16">
          <p className="text-gray-500 mb-4">No results to display.</p>
          <Button onClick={() => navigate('/recommend')}>Try again</Button>
        </div>
      </PageLayout>
    );
  }

  const [winner, ...rest] = result.rankedCards;

  return (
    <PageLayout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-navy">Results</h1>
          <Button variant="secondary" size="sm" onClick={() => navigate('/recommend')}>
            New query
          </Button>
        </div>

        {/* Winner card */}
        {winner && (
          <div className="bg-blue-50 border border-brand rounded-xl p-5 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Trophy size={18} className="text-brand" />
              <span className="text-sm font-semibold text-brand">Best card for this purchase</span>
              <Badge label={result.confidenceTier} color={confidenceColor(result.confidenceTier)} />
            </div>
            <p className="text-xl font-bold text-navy">{winner.cardName}</p>
            <p className="text-sm text-gray-600">{winner.bankName}</p>
            <div className="mt-3 flex flex-wrap gap-3 text-sm">
              <span className="font-semibold text-green-700">₹{winner.estimatedRewardRs?.toFixed(2)} reward</span>
              <span className="text-gray-500">({winner.effectiveRewardRatePercent?.toFixed(2)}% effective rate)</span>
              {winner.nativeCurrencyAmount && (
                <span className="text-gray-500">= {winner.nativeCurrencyAmount}</span>
              )}
            </div>
            {result.recommendationExplanation && (
              <p className="text-xs text-gray-500 mt-2 italic">{result.recommendationExplanation}</p>
            )}
            {winner.relevantBenefits?.filter((b) => b.isWarning).map((b) => (
              <div key={b.benefitType} className="mt-2 flex items-start gap-1 text-xs text-yellow-700">
                <AlertTriangle size={12} className="flex-shrink-0 mt-0.5" />
                {b.description}
              </div>
            ))}
          </div>
        )}

        {/* Other cards */}
        {rest.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Other cards ranked</p>
            <div className="space-y-2">
              {rest.map((card: CardResult, i: number) => (
                <div key={card.cardId} className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg">
                  <span className="text-sm font-bold text-gray-400 w-5">#{i + 2}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-navy truncate">{card.cardName}</p>
                    <p className="text-xs text-gray-400">{card.bankName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-navy">₹{card.estimatedRewardRs?.toFixed(2)}</p>
                    <p className="text-xs text-gray-400">{card.effectiveRewardRatePercent?.toFixed(2)}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="text-xs text-gray-400 text-center mt-6">
          Computed in {result.computationMs}ms · {result.rankedCards.length} cards evaluated
        </p>
      </div>
    </PageLayout>
  );
}
