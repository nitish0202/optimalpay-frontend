import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, ChevronDown, ChevronUp, AlertTriangle, Info, Tag, Star, RotateCcw, LayoutDashboard } from 'lucide-react';
import { useRecommendStore } from '../store/recommendStore';
import type { CardResult, CapDisclosure, MilestoneInfo, BenefitHit } from '../types';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { PageLayout } from '../components/layout/PageLayout';

// ── Helpers ────────────────────────────────────────────────────────────────────

function confidenceColor(tier: string): 'green' | 'yellow' | 'gray' {
  if (tier === 'HIGH') return 'green';
  if (tier === 'MEDIUM') return 'yellow';
  return 'gray';
}

function fmt(n: number | undefined): string {
  if (n === undefined || n === null) return '—';
  return n.toFixed(2);
}

// ── Cap Disclosure ─────────────────────────────────────────────────────────────

function CapBox({ cap }: { cap: CapDisclosure }) {
  return (
    <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-800">
      <AlertTriangle size={13} className="flex-shrink-0 mt-0.5 text-amber-500" />
      <span>
        <strong>{cap.capLabel}</strong>
        {cap.capValue !== undefined && ` (₹${cap.capValue} / ${cap.period})`}
        {' — '}
        {cap.explanation}
      </span>
    </div>
  );
}

// ── Milestone Info ─────────────────────────────────────────────────────────────

function MilestoneBox({ m }: { m: MilestoneInfo }) {
  return (
    <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-xs text-blue-800">
      <Info size={13} className="flex-shrink-0 mt-0.5 text-blue-500" />
      <span>
        <strong>Milestone: </strong>{m.description}
        {m.spendTarget !== undefined && ` (target ₹${m.spendTarget})`}
        {m.rewardDescription && ` → ${m.rewardDescription}`}
      </span>
    </div>
  );
}

// ── Expandable card row ────────────────────────────────────────────────────────

function CardRow({ card, rank, animate }: { card: CardResult; rank: number; animate: boolean }) {
  const [expanded, setExpanded] = useState(false);

  const hasCaps = (card.capDisclosures?.length ?? 0) > 0;
  const hasMilestones = (card.milestoneInfos?.length ?? 0) > 0;
  const hasBenefits = (card.relevantBenefits?.length ?? 0) > 0;
  const hasOffers = (card.offersApplied?.length ?? 0) > 0;
  const hasDetails = hasCaps || hasMilestones || hasBenefits || hasOffers;

  return (
    <motion.div
      initial={animate ? { opacity: 0, x: -12 } : false}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25, delay: rank * 0.05 }}
      className="bg-white border border-gray-200 rounded-xl overflow-hidden"
    >
      <div className="flex items-center gap-3 p-4">
        <span className="text-sm font-bold text-gray-400 w-6 flex-shrink-0">#{rank + 1}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-navy truncate">{card.cardName}</p>
          <p className="text-xs text-gray-400">{card.bankName}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-sm font-semibold text-navy">₹{fmt(card.estimatedRewardRs)}</p>
          <p className="text-xs text-gray-400">{fmt(card.effectiveRewardRatePercent)}%</p>
        </div>
        {hasDetails && (
          <button
            onClick={() => setExpanded((e) => !e)}
            className="text-gray-400 hover:text-navy ml-1"
            aria-label="Toggle details"
          >
            {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
        )}
      </div>

      {expanded && hasDetails && (
        <div className="border-t border-gray-100 px-4 pb-4 pt-3 space-y-2">
          {/* Cap disclosures */}
          {hasCaps && card.capDisclosures!.map((cap) => (
            <CapBox key={cap.ruleId} cap={cap} />
          ))}

          {/* Milestones */}
          {hasMilestones && card.milestoneInfos!.map((m) => (
            <MilestoneBox key={m.milestoneId} m={m} />
          ))}

          {/* Benefits */}
          {hasBenefits && (
            <div className="flex flex-wrap gap-1.5">
              {card.relevantBenefits!.map((b: BenefitHit) => (
                <span
                  key={b.benefitType}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                    b.isWarning
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-blue-50 text-blue-700 border border-blue-100'
                  }`}
                >
                  {b.isWarning ? <AlertTriangle size={10} /> : <Star size={10} />}
                  {b.description}
                </span>
              ))}
            </div>
          )}

          {/* Offers */}
          {hasOffers && (
            <div className="flex flex-wrap gap-1.5">
              {card.offersApplied!.map((offer: string) => (
                <span
                  key={offer}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200"
                >
                  <Tag size={10} /> {offer}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

export function Results() {
  const navigate = useNavigate();
  const { lastResult: result, clearResult } = useRecommendStore();

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
  const isLowConfidence = result.confidenceTier !== 'HIGH';

  const handleNewQuery = () => {
    clearResult();
    navigate('/recommend');
  };

  return (
    <PageLayout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-navy">Results</h1>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => navigate('/dashboard')}>
              <LayoutDashboard size={13} className="mr-1" /> Dashboard
            </Button>
            <Button size="sm" onClick={handleNewQuery}>
              <RotateCcw size={13} className="mr-1" /> New query
            </Button>
          </div>
        </div>

        {/* Resolved context */}
        {(result.resolvedMerchant || result.resolvedCategory) && (
          <p className="text-xs text-gray-400 mb-4">
            Showing results for{' '}
            {result.resolvedMerchant && <strong className="text-gray-600">{result.resolvedMerchant}</strong>}
            {result.resolvedMerchant && result.resolvedCategory && ' · '}
            {result.resolvedCategory && <span className="capitalize">{result.resolvedCategory}</span>}
          </p>
        )}

        {/* Section 1 — Winner */}
        {winner && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-blue-50 border border-brand rounded-xl p-5 mb-6"
          >
            <div className="flex items-center gap-2 mb-3">
              <Trophy size={18} className="text-brand" />
              <span className="text-sm font-semibold text-brand">Best card for this purchase</span>
              <Badge label={result.confidenceTier} color={confidenceColor(result.confidenceTier)} />
            </div>
            <p className="text-xl font-bold text-navy">{winner.cardName}</p>
            <p className="text-sm text-gray-500 mb-3">{winner.bankName}</p>

            <div className="flex flex-wrap gap-4 text-sm mb-3">
              <div>
                <p className="text-xs text-gray-400">Estimated reward</p>
                <p className="font-bold text-green-700 text-lg">₹{fmt(winner.estimatedRewardRs)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Effective rate</p>
                <p className="font-semibold text-navy">{fmt(winner.effectiveRewardRatePercent)}%</p>
              </div>
              {winner.nativeCurrencyAmount && (
                <div>
                  <p className="text-xs text-gray-400">{winner.nativeCurrencyLabel ?? 'Native'}</p>
                  <p className="font-semibold text-navy">{winner.nativeCurrencyAmount}</p>
                </div>
              )}
              {winner.offerUpliftRs > 0 && (
                <div>
                  <p className="text-xs text-gray-400">Offer uplift</p>
                  <p className="font-semibold text-green-600">+₹{fmt(winner.offerUpliftRs)}</p>
                </div>
              )}
            </div>

            {result.recommendationExplanation && (
              <p className="text-xs text-gray-500 italic border-t border-blue-100 pt-2">
                {result.recommendationExplanation}
              </p>
            )}

            {/* Winner caps */}
            {(winner.capDisclosures?.length ?? 0) > 0 && (
              <div className="mt-3 space-y-1.5">
                {winner.capDisclosures!.map((cap) => <CapBox key={cap.ruleId} cap={cap} />)}
              </div>
            )}

            {/* Winner milestones */}
            {(winner.milestoneInfos?.length ?? 0) > 0 && (
              <div className="mt-2 space-y-1.5">
                {winner.milestoneInfos!.map((m) => <MilestoneBox key={m.milestoneId} m={m} />)}
              </div>
            )}

            {/* Winner offers */}
            {(winner.offersApplied?.length ?? 0) > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {winner.offersApplied!.map((offer: string) => (
                  <span key={offer} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                    <Tag size={10} /> {offer}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Section 2 — Other cards */}
        {rest.length > 0 && (
          <div className="mb-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
              All cards ranked
            </p>
            <div className="space-y-2">
              {rest.map((card: CardResult, i: number) => (
                <CardRow key={card.cardId} card={card} rank={i + 1} animate />
              ))}
            </div>
          </div>
        )}

        {/* Section 3 — Footnotes */}
        <div className="space-y-2 text-xs text-gray-400 border-t border-gray-100 pt-4">
          {isLowConfidence && result.confidenceReason && (
            <p>
              <strong className="text-gray-500">Confidence note:</strong> {result.confidenceReason}
            </p>
          )}
          {winner?.redemptionModeAssumption && (
            <p>
              <strong className="text-gray-500">Redemption assumption:</strong>{' '}
              {winner.redemptionModeAssumption}
            </p>
          )}
          <p>Offer validity and reward rates are subject to change. Always verify with your bank before transacting.</p>
          <p className="mt-1">
            Computed in {result.computationMs}ms · {result.rankedCards.length} card
            {result.rankedCards.length !== 1 ? 's' : ''} evaluated
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 mt-8">
          <Button className="flex-1" onClick={handleNewQuery}>
            <RotateCcw size={14} className="mr-1.5" /> Try another transaction
          </Button>
          <Button variant="secondary" className="flex-1" onClick={() => navigate('/dashboard')}>
            <LayoutDashboard size={14} className="mr-1.5" /> Back to dashboard
          </Button>
        </div>
      </div>
    </PageLayout>
  );
}
