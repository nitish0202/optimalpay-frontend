import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRecommend } from '../hooks/useRecommend';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { PageLayout } from '../components/layout/PageLayout';
import type { RecommendationResponse } from '../types';

const schema = z.object({
  merchantName: z.string().optional(),
  amount: z.string().min(1, 'Enter an amount').refine((v) => !isNaN(Number(v)) && Number(v) > 0, 'Enter a valid positive amount'),
  categoryId: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export function Recommend() {
  const navigate = useNavigate();
  const recommend = useRecommend();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    const result = await recommend.mutateAsync({
      merchantName: data.merchantName || undefined,
      amount: Number(data.amount),
      categoryId: data.categoryId || undefined,
    });
    navigate('/results', { state: { result } });
  };

  return (
    <PageLayout>
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-16">
        <h1 className="text-2xl font-bold text-navy mb-2">Find your best card</h1>
        <p className="text-gray-500 text-sm mb-8">
          Tell us where you're spending and we'll rank every card in your wallet.
        </p>

        {recommend.isError && (
          <div className="mb-4 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            Could not get recommendations. Please try again.
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            id="merchantName"
            label="Merchant / Store (optional)"
            placeholder="e.g. Swiggy, Amazon, Zomato"
            {...register('merchantName')}
          />
          <Input
            id="amount"
            type="number"
            label="Amount (₹)"
            placeholder="e.g. 1700"
            error={errors.amount?.message}
            {...register('amount')}
          />
          <div>
            <label className="block text-sm font-medium text-navy mb-1">Category (optional)</label>
            <select
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand"
              {...register('categoryId')}
            >
              <option value="">— Select a category —</option>
              <option value="dining">Dining</option>
              <option value="grocery">Grocery</option>
              <option value="fuel">Fuel</option>
              <option value="travel">Travel</option>
              <option value="shopping">Shopping</option>
              <option value="entertainment">Entertainment</option>
              <option value="utilities">Utilities</option>
              <option value="rent">Rent</option>
            </select>
          </div>

          <Button type="submit" className="w-full" size="lg" loading={recommend.isPending}>
            Get Recommendation
          </Button>
        </form>
      </div>
    </PageLayout>
  );
}

export type { RecommendationResponse };
