import { useNavigate } from 'react-router-dom';
import { CreditCardIcon, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useWallet } from '../hooks/useWallet';
import { Button } from '../components/ui/Button';
import { PageLayout } from '../components/layout/PageLayout';
import { CardSkeleton } from '../components/ui/Skeleton';
import { Badge } from '../components/ui/Badge';
import type { WalletCardResponse } from '../types';

function rewardColor(type: string | undefined): 'green' | 'blue' | 'yellow' | 'gray' {
  if (!type) return 'gray';
  const t = type.toLowerCase();
  if (t.includes('cashback') || t.includes('cash')) return 'green';
  if (t.includes('miles')) return 'yellow';
  if (t.includes('points') || t.includes('reward')) return 'blue';
  return 'gray';
}

function bankAccent(bankName: string): string {
  const b = bankName.toLowerCase();
  if (b.includes('hdfc')) return 'border-l-4 border-l-blue-600';
  if (b.includes('icici')) return 'border-l-4 border-l-orange-500';
  if (b.includes('axis')) return 'border-l-4 border-l-purple-600';
  if (b.includes('sbi')) return 'border-l-4 border-l-blue-800';
  if (b.includes('kotak')) return 'border-l-4 border-l-red-500';
  if (b.includes('amex') || b.includes('american')) return 'border-l-4 border-l-green-600';
  return 'border-l-4 border-l-gray-400';
}

function WalletCardTile({ card }: { card: WalletCardResponse }) {
  return (
    <div className={`bg-white rounded-xl p-4 shadow-sm border border-gray-100 ${bankAccent(card.bankId)} cursor-pointer hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between mb-2">
        <CreditCardIcon size={18} className="text-gray-400 mt-0.5" />
        <Badge label={(card.rewardCurrencyType ?? '').replace(/_/g, ' ')} color={rewardColor(card.rewardCurrencyType)} />
      </div>
      <p className="font-semibold text-navy text-sm leading-tight">{card.displayName}</p>
      {card.nickname && <p className="text-xs text-gray-400 mt-0.5">{card.nickname}</p>}
      <p className="text-xs text-gray-500 mt-1">{card.bankId}</p>
      {card.isPrimary && (
        <span className="inline-block mt-2 text-xs text-green-600 font-medium">● Primary</span>
      )}
    </div>
  );
}

export function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { query: { data: wallet, isLoading } } = useWallet();

  const greeting = user?.email ? user.email.split('@')[0] : 'there';
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <PageLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-navy">Hi, {greeting} 👋</h1>
            <p className="text-sm text-gray-400 mt-0.5">{today}</p>
          </div>
          <Button size="lg" onClick={() => navigate('/recommend')} className="flex items-center gap-2">
            Which card should I use?
            <ArrowRight size={16} />
          </Button>
        </div>

        {/* Wallet section */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-navy">Your Wallet</h2>
            {wallet && (
              <p className="text-xs text-gray-400 mt-0.5">{wallet.length} / 20 cards</p>
            )}
          </div>
          <Button variant="secondary" size="sm" onClick={() => navigate('/wallet')}>
            Manage cards
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : !wallet || wallet.length === 0 ? (
          <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl py-14 text-center">
            <CreditCardIcon size={32} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm font-medium mb-1">You haven't added any cards yet.</p>
            <p className="text-gray-400 text-xs mb-4">Add your cards to get personalised recommendations.</p>
            <Button variant="secondary" onClick={() => navigate('/wallet')}>
              Add your first card →
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {wallet.map((c) => <WalletCardTile key={c.id} card={c} />)}
          </div>
        )}

        {/* Quick tip */}
        {wallet && wallet.length > 0 && (
          <div className="mt-8 bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center justify-between gap-4">
            <p className="text-sm text-navy">
              Ready to find the best card for your next purchase?
            </p>
            <Button size="sm" onClick={() => navigate('/recommend')}>
              Get recommendation
            </Button>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
