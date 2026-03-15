import { useNavigate } from 'react-router-dom';
import { Trash2, Plus } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { PageLayout } from '../components/layout/PageLayout';
import { CardSkeleton } from '../components/ui/Skeleton';

export function Wallet() {
  const navigate = useNavigate();
  const { query: { data: wallet, isLoading }, remove } = useWallet();

  return (
    <PageLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-navy">My Wallet</h1>
          <Button size="sm" onClick={() => navigate('/onboarding')}>
            <Plus size={14} className="mr-1" /> Add cards
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : wallet?.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 mb-4">Your wallet is empty.</p>
            <Button onClick={() => navigate('/onboarding')}>Add your first card</Button>
          </div>
        ) : (
          <div className="space-y-2">
            {wallet?.map((c) => (
              <div
                key={c.id}
                className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-navy">{c.nickname ?? c.cardName}</p>
                  <p className="text-xs text-gray-400">{c.bankName} · Added {new Date(c.addedAt).toLocaleDateString('en-IN')}</p>
                </div>
                <Badge label={c.rewardType.replace(/_/g, ' ')} color="blue" />
                {c.isPrimary && <Badge label="Primary" color="green" />}
                <button
                  onClick={() => remove.mutate(c.id)}
                  disabled={remove.isPending}
                  className="text-gray-400 hover:text-red-500 transition ml-1"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
