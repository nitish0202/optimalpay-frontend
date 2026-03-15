import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Check, Search, ArrowLeft } from 'lucide-react';
import { getCards } from '../api/cards';
import { addCard } from '../api/wallet';
import type { CreditCard } from '../types';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { CardSkeleton } from '../components/ui/Skeleton';
import { PageLayout } from '../components/layout/PageLayout';

function rewardColor(type: string): 'blue' | 'green' | 'yellow' | 'gray' {
  if (type.includes('CASHBACK') || type.includes('cashback')) return 'green';
  if (type.includes('POINTS') || type.includes('points')) return 'blue';
  if (type.includes('MILES') || type.includes('miles')) return 'yellow';
  return 'gray';
}

export function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [nicknames, setNicknames] = useState<Record<string, string>>({});
  const [adding, setAdding] = useState(false);
  const [progress, setProgress] = useState(0);

  const { data: cards = [], isLoading } = useQuery({
    queryKey: ['cards'],
    queryFn: getCards,
  });

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return cards;
    return cards.filter(
      (c) =>
        c.cardName.toLowerCase().includes(q) ||
        c.bankName.toLowerCase().includes(q)
    );
  }, [cards, search]);

  const selectedCards = cards.filter((c) => selected.has(c.cardId));

  const toggle = (cardId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(cardId) ? next.delete(cardId) : next.add(cardId);
      return next;
    });
  };

  const handleAddToWallet = async () => {
    setAdding(true);
    setProgress(0);
    const list = Array.from(selected);
    for (let i = 0; i < list.length; i++) {
      try {
        await addCard({
          cardId: list[i],
          nickname: nicknames[list[i]] || undefined,
          isPrimary: i === 0,
        });
      } catch {
        // continue on duplicate or other errors
      }
      setProgress(i + 1);
    }
    navigate('/dashboard');
  };

  return (
    <PageLayout hideNav>
      <div className="min-h-screen bg-gray-50 py-10 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8 text-center">
            <p className="text-sm text-brand font-semibold uppercase tracking-wide mb-2">
              Step {step} of 2
            </p>
            <h1 className="text-2xl font-bold text-navy">
              {step === 1 ? 'Which cards do you have?' : 'Confirm your wallet'}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {step === 1
                ? 'Select all the credit cards you own.'
                : 'Review your selections before adding to your wallet.'}
            </p>
          </div>

          {step === 1 && (
            <>
              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search by card name or bank…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>

              {/* Card list */}
              <div className="space-y-2 mb-6">
                {isLoading
                  ? Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
                  : filtered.map((card: CreditCard) => (
                      <button
                        key={card.cardId}
                        onClick={() => toggle(card.cardId)}
                        className={`w-full flex items-center gap-3 p-4 rounded-lg border text-left transition ${
                          selected.has(card.cardId)
                            ? 'border-brand bg-blue-50'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                            selected.has(card.cardId) ? 'border-brand bg-brand' : 'border-gray-300'
                          }`}
                        >
                          {selected.has(card.cardId) && <Check size={12} className="text-white" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-navy truncate">{card.cardName}</p>
                          <p className="text-xs text-gray-500">{card.bankName}</p>
                        </div>
                        <Badge
                          label={card.rewardType.replace(/_/g, ' ')}
                          color={rewardColor(card.rewardType)}
                        />
                      </button>
                    ))}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="text-sm text-gray-500 hover:text-navy underline"
                >
                  Skip for now
                </button>
                <div className="flex items-center gap-3">
                  {selected.size > 0 && (
                    <span className="text-sm text-gray-600">{selected.size} selected</span>
                  )}
                  <Button disabled={selected.size === 0} onClick={() => setStep(2)}>
                    Continue →
                  </Button>
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="space-y-2 mb-6">
                {selectedCards.map((card) => (
                  <div
                    key={card.cardId}
                    className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-navy">{card.cardName}</p>
                      <p className="text-xs text-gray-500">{card.bankName}</p>
                    </div>
                    <input
                      type="text"
                      placeholder="Nickname (optional)"
                      value={nicknames[card.cardId] ?? ''}
                      onChange={(e) =>
                        setNicknames((prev) => ({ ...prev, [card.cardId]: e.target.value }))
                      }
                      className="w-36 px-2 py-1.5 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-brand"
                    />
                  </div>
                ))}
              </div>

              {adding && (
                <p className="text-sm text-gray-500 text-center mb-4">
                  Adding {progress} of {selected.size} cards…
                </p>
              )}

              <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => setStep(1)}>
                  <ArrowLeft size={16} className="mr-1" /> Back
                </Button>
                <Button loading={adding} onClick={handleAddToWallet}>
                  Add to wallet
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
