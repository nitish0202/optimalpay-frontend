import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useWallet } from '../hooks/useWallet';
import { Button } from '../components/ui/Button';
import { PageLayout } from '../components/layout/PageLayout';
import { CardSkeleton } from '../components/ui/Skeleton';
import { Badge } from '../components/ui/Badge';

export function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { query: { data: wallet, isLoading } } = useWallet();

  return (
    <PageLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-navy">Dashboard</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {user?.email}
            </p>
          </div>
          <Button onClick={() => navigate('/recommend')}>
            Find best card
          </Button>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-navy">Your Wallet</h2>
            <Button variant="secondary" size="sm" onClick={() => navigate('/wallet')}>
              Manage
            </Button>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
            </div>
          ) : wallet?.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm mb-4">No cards in your wallet yet.</p>
              <Button variant="secondary" onClick={() => navigate('/onboarding')}>Add cards</Button>
            </div>
          ) : (
            <div className="space-y-2">
              {wallet?.map((c) => (
                <div key={c.id} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-navy">{c.nickname ?? c.cardName}</p>
                    <p className="text-xs text-gray-400">{c.bankName}</p>
                  </div>
                  <Badge label={c.rewardType.replace(/_/g, ' ')} color="blue" />
                  {c.isPrimary && <Badge label="Primary" color="green" />}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
