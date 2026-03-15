import { useState, useMemo } from 'react';
import { Plus, Search, Check, Trash2, Pencil, Star, X, MoreVertical } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useWallet } from '../hooks/useWallet';
import { getCards } from '../api/cards';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { PageLayout } from '../components/layout/PageLayout';
import { CardSkeleton } from '../components/ui/Skeleton';
import { Toast, useToast } from '../components/ui/Toast';
import type { WalletCardResponse } from '../types';
import axios from 'axios';

const MAX_CARDS = 20;

function rewardColor(type: string | undefined): 'green' | 'blue' | 'yellow' | 'gray' {
  if (!type) return 'gray';
  const t = type.toLowerCase();
  if (t.includes('cashback') || t.includes('cash')) return 'green';
  if (t.includes('miles')) return 'yellow';
  if (t.includes('points') || t.includes('reward')) return 'blue';
  return 'gray';
}

// ── Card Picker Modal ──────────────────────────────────────────────────────────

function CardPickerModal({
  onClose,
  walletCardIds,
  onAdd,
}: {
  onClose: () => void;
  walletCardIds: Set<string>;
  onAdd: (cardId: string) => Promise<void>;
}) {
  const [search, setSearch] = useState('');
  const [adding, setAdding] = useState<string | null>(null);

  const { data: allCards = [], isLoading } = useQuery({
    queryKey: ['cards'],
    queryFn: getCards,
  });

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return allCards;
    return allCards.filter(
      (c) => c.displayName.toLowerCase().includes(q) || c.bankId.toLowerCase().includes(q)
    );
  }, [allCards, search]);

  const handleAdd = async (cardId: string) => {
    setAdding(cardId);
    await onAdd(cardId);
    setAdding(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-0 sm:px-4">
      <div className="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="font-semibold text-navy">Add a card</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-navy">
            <X size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
            <input
              autoFocus
              type="text"
              placeholder="Search by card name or bank…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>
        </div>

        {/* Card list */}
        <div className="overflow-y-auto flex-1 px-4 py-2">
          {isLoading ? (
            <div className="space-y-2 py-2">
              {Array.from({ length: 5 }).map((_, i) => <CardSkeleton key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-8">No cards found.</p>
          ) : (
            <div className="space-y-1.5 py-2">
              {filtered.map((card) => {
                const inWallet = walletCardIds.has(card.id);
                return (
                  <div
                    key={card.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition ${
                      inWallet ? 'border-gray-100 bg-gray-50 opacity-70' : 'border-gray-200 hover:border-brand/40 hover:bg-blue-50/30'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-navy truncate">{card.displayName}</p>
                      <p className="text-xs text-gray-400">{card.bankId}</p>
                    </div>
                    <Badge label={(card.rewardCurrencyType ?? '').replace(/_/g, ' ')} color={rewardColor(card.rewardCurrencyType)} />
                    {inWallet ? (
                      <Check size={16} className="text-green-500 flex-shrink-0" />
                    ) : (
                      <button
                        onClick={() => handleAdd(card.id)}
                        disabled={adding === card.id}
                        className="text-brand hover:text-blue-700 text-xs font-medium flex-shrink-0 disabled:opacity-50"
                      >
                        {adding === card.id ? '…' : 'Add'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Per-card actions menu ──────────────────────────────────────────────────────

function CardRow({
  card,
  onRemove,
  onUpdate,
}: {
  card: WalletCardResponse;
  onRemove: () => void;
  onUpdate: (data: { nickname?: string; isPrimary?: boolean }) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [editingNick, setEditingNick] = useState(false);
  const [nickValue, setNickValue] = useState(card.nickname ?? '');
  const [confirmRemove, setConfirmRemove] = useState(false);

  const saveNickname = () => {
    onUpdate({ nickname: nickValue || undefined });
    setEditingNick(false);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          {editingNick ? (
            <div className="flex items-center gap-2 mb-1">
              <input
                autoFocus
                value={nickValue}
                onChange={(e) => setNickValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && saveNickname()}
                placeholder="Nickname"
                className="text-sm border-b border-brand focus:outline-none w-36"
              />
              <button onClick={saveNickname} className="text-xs text-brand font-medium">Save</button>
              <button onClick={() => setEditingNick(false)} className="text-xs text-gray-400">Cancel</button>
            </div>
          ) : (
            <p className="font-medium text-sm text-navy">
              {card.nickname ?? card.displayName}
              {card.nickname && <span className="text-gray-400 font-normal ml-1 text-xs">({card.displayName})</span>}
            </p>
          )}
          <p className="text-xs text-gray-400 mt-0.5">
            {card.bankId} · Added {new Date(card.addedAt).toLocaleDateString('en-IN')}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Badge label={(card.rewardCurrencyType ?? '').replace(/_/g, ' ')} color={rewardColor(card.rewardCurrencyType)} />
          {card.isPrimary && <Badge label="Primary" color="green" />}
          <div className="relative">
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="text-gray-400 hover:text-navy p-1"
            >
              <MoreVertical size={15} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-7 z-10 bg-white border border-gray-200 rounded-lg shadow-lg py-1 w-44">
                <button
                  onClick={() => { setEditingNick(true); setMenuOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 text-left"
                >
                  <Pencil size={13} className="text-gray-400" /> Edit nickname
                </button>
                {!card.isPrimary && (
                  <button
                    onClick={() => { onUpdate({ isPrimary: true }); setMenuOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 text-left"
                  >
                    <Star size={13} className="text-gray-400" /> Set as primary
                  </button>
                )}
                <button
                  onClick={() => { setConfirmRemove(true); setMenuOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-red-50 text-red-600 text-left"
                >
                  <Trash2 size={13} /> Remove card
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {confirmRemove && (
        <div className="mt-3 pt-3 border-t border-red-100 flex items-center justify-between gap-3">
          <p className="text-xs text-red-600">Remove this card from your wallet?</p>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={() => setConfirmRemove(false)}>Cancel</Button>
            <Button size="sm" className="!bg-red-600 !text-white hover:!bg-red-700" onClick={onRemove}>
              Remove
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export function Wallet() {
  const [showPicker, setShowPicker] = useState(false);
  const { toast, show: showToast, hide: hideToast } = useToast();
  const { query: { data: wallet = [], isLoading }, add, update, remove } = useWallet();

  const walletCardIds = useMemo(() => new Set(wallet.map((c) => c.cardId)), [wallet]);

  const handleAdd = async (cardId: string) => {
    try {
      await add.mutateAsync({ cardId });
      showToast('Card added to wallet!', 'success');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 409) showToast('Card already in wallet', 'error');
        else if (status === 422) showToast('Wallet is full (max 20 cards)', 'error');
        else showToast('Failed to add card. Try again.', 'error');
      }
    }
  };

  return (
    <PageLayout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-navy">My Wallet</h1>
          <Button
            size="sm"
            onClick={() => setShowPicker(true)}
            disabled={wallet.length >= MAX_CARDS}
          >
            <Plus size={14} className="mr-1" /> Add card
          </Button>
        </div>
        <p className="text-sm text-gray-400 mb-6">{wallet.length} / {MAX_CARDS} cards</p>

        {/* Card list */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : wallet.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl">
            <p className="text-gray-500 mb-4">Your wallet is empty.</p>
            <Button onClick={() => setShowPicker(true)}>Add your first card</Button>
          </div>
        ) : (
          <div className="space-y-3">
            {wallet.map((card) => (
              <CardRow
                key={card.id}
                card={card}
                onRemove={() => remove.mutate(card.id)}
                onUpdate={(data) => update.mutate({ id: card.id, data })}
              />
            ))}
          </div>
        )}

        {/* Card picker modal */}
        {showPicker && (
          <CardPickerModal
            onClose={() => setShowPicker(false)}
            walletCardIds={walletCardIds}
            onAdd={handleAdd}
          />
        )}

        {/* Toast */}
        {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
      </div>
    </PageLayout>
  );
}
