import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Search, X, Loader2 } from 'lucide-react';
import { useRecommend } from '../hooks/useRecommend';
import { searchMerchants, type Merchant } from '../api/merchants';
import { useRecommendStore } from '../store/recommendStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { PageLayout } from '../components/layout/PageLayout';

// ── Types ──────────────────────────────────────────────────────────────────────

type Channel = 'ONLINE' | 'POS' | 'APP' | 'UPI';

const CHANNELS: { label: string; value: Channel }[] = [
  { label: 'Online', value: 'ONLINE' },
  { label: 'POS', value: 'POS' },
  { label: 'App', value: 'APP' },
  { label: 'UPI', value: 'UPI' },
];

const PAYMENT_APPS = ['Google Pay', 'PhonePe', 'Paytm', 'Amazon Pay', 'BHIM'];

const LOADING_MESSAGES = [
  'Scanning your wallet…',
  'Checking reward rates…',
  'Applying bank offers…',
  'Crunching cashback…',
  'Finding the best card…',
];

const schema = z.object({
  merchantDisplay: z.string().optional(),   // display only, not sent to backend
  amount: z
    .string()
    .min(1, 'Enter an amount')
    .refine((v) => !isNaN(Number(v)) && Number(v) > 0, 'Enter a valid positive amount')
    .refine((v) => Number(v) <= 1_000_000, 'Amount cannot exceed ₹10,00,000'),
  categoryId: z.string().optional(),
  channel: z.enum(['ONLINE', 'POS', 'APP', 'UPI']),
  paymentApp: z.string().optional(),
  transactionDate: z.string(),
  hasAmazonPrime: z.boolean(),
});

type FormData = z.infer<typeof schema>;

// ── Loading Overlay ────────────────────────────────────────────────────────────

function LoadingOverlay() {
  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setMsgIdx((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 600);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
      <Loader2 className="animate-spin text-brand mb-4" size={40} />
      <p className="text-navy font-medium text-sm">{LOADING_MESSAGES[msgIdx]}</p>
    </div>
  );
}

// ── Merchant Search ────────────────────────────────────────────────────────────

function MerchantSearch({
  value,
  onChange,
  onSelect,
  onClear,
}: {
  value: string;
  onChange: (displayName: string) => void;
  onSelect: (merchantId: string, displayName: string) => void;
  onClear: () => void;
}) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<Merchant[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    try {
      const results = await searchMerchants(q);
      setSuggestions(results.slice(0, 5));
      setOpen(results.length > 0);
    } catch {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setQuery(v);
    onChange(v);
    onClear();  // user is typing freely — clear any previously selected merchantId
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(v), 300);
  };

  const handleSelect = (m: Merchant) => {
    setQuery(m.merchantName);
    onChange(m.merchantName);
    onSelect(m.merchantId, m.merchantName);
    setSuggestions([]);
    setOpen(false);
  };

  const handleClear = () => {
    setQuery('');
    onChange('');
    onClear();
    setSuggestions([]);
    setOpen(false);
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-sm font-medium text-navy mb-1">
        Merchant / Store <span className="text-gray-400 font-normal">(optional)</span>
      </label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
        <input
          type="text"
          value={query}
          onChange={handleInput}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder="Search merchants e.g. Swiggy, Amazon…"
          className="w-full pl-9 pr-8 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" size={14} />
        )}
        {!loading && query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={14} />
          </button>
        )}
      </div>
      {open && suggestions.length > 0 && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          {suggestions.map((m) => (
            <button
              key={m.merchantId}
              type="button"
              onClick={() => handleSelect(m)}
              className="w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 text-navy border-b border-gray-50 last:border-0"
            >
              <span className="font-medium">{m.merchantName}</span>
              {m.categoryName && <span className="text-gray-400 text-xs ml-2">{m.categoryName}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

export function Recommend() {
  const navigate = useNavigate();
  const recommend = useRecommend();
  const setResult = useRecommendStore((s) => s.setResult);

  // merchantId is tracked outside RHF — set when user picks from autocomplete, cleared on free typing
  const merchantIdRef = useRef<string | null>(null);

  const today = new Date().toISOString().split('T')[0];

  const { register, handleSubmit, watch, control, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      merchantDisplay: '',
      amount: '',
      categoryId: '',
      channel: 'ONLINE',
      paymentApp: '',
      transactionDate: today,
      hasAmazonPrime: false,
    },
  });

  const merchantDisplay = watch('merchantDisplay');
  const categoryId = watch('categoryId');
  const channel = watch('channel');
  const amount = watch('amount');

  const isAmazonMerchant = merchantDisplay?.toLowerCase().includes('amazon');
  const isShoppingCategory = categoryId === 'shopping';
  const showPrime = isAmazonMerchant || isShoppingCategory;
  const showPaymentApp = channel === 'APP';
  // Can submit if: a merchantId was selected from autocomplete, OR a category is chosen
  const canSubmit = (!!merchantIdRef.current || !!categoryId) && !!amount && Number(amount) > 0;

  const onSubmit = async (data: FormData) => {
    const result = await recommend.mutateAsync({
      merchantId: merchantIdRef.current ?? undefined,
      categoryId: data.categoryId || undefined,
      amount: Number(data.amount),
      channel: data.channel,
      paymentApp: data.paymentApp || undefined,
      transactionDate: data.transactionDate,
      hasAmazonPrime: data.hasAmazonPrime,
    });
    setResult(result);
    navigate('/results');
  };

  return (
    <PageLayout>
      {recommend.isPending && <LoadingOverlay />}
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-16">
        <h1 className="text-2xl font-bold text-navy mb-2">Find your best card</h1>
        <p className="text-gray-500 text-sm mb-8">
          Tell us where you&apos;re spending and we&apos;ll rank every card in your wallet.
        </p>

        {recommend.isError && (
          <div className="mb-4 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            Could not get recommendations. Please try again.
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Merchant search */}
          <Controller
            name="merchantDisplay"
            control={control}
            render={({ field }) => (
              <MerchantSearch
                value={field.value ?? ''}
                onChange={field.onChange}
                onSelect={(id) => { merchantIdRef.current = id; }}
                onClear={() => { merchantIdRef.current = null; }}
              />
            )}
          />
          {merchantIdRef.current === null && !categoryId && (
            <p className="text-xs text-amber-600 -mt-3">
              Select a merchant from the dropdown, or choose a category below.
            </p>
          )}

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-navy mb-1">Amount (₹)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₹</span>
              <input
                type="number"
                min={1}
                max={1000000}
                placeholder="e.g. 1700"
                {...register('amount')}
                className="w-full pl-7 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>
            {errors.amount && <p className="mt-1 text-xs text-red-600">{errors.amount.message}</p>}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-navy mb-1">
              Category <span className="text-gray-400 font-normal">(optional if merchant selected)</span>
            </label>
            <select
              {...register('categoryId')}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand"
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

          {/* Channel */}
          <div>
            <label className="block text-sm font-medium text-navy mb-1">Payment channel</label>
            <div className="flex rounded-lg border border-gray-300 overflow-hidden">
              {CHANNELS.map((ch) => (
                <button
                  key={ch.value}
                  type="button"
                  onClick={() => setValue('channel', ch.value)}
                  className={`flex-1 py-2 text-sm font-medium transition ${
                    channel === ch.value
                      ? 'bg-brand text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  } border-r border-gray-300 last:border-0`}
                >
                  {ch.label}
                </button>
              ))}
            </div>
          </div>

          {/* Payment app (only for APP channel) */}
          {showPaymentApp && (
            <div>
              <label className="block text-sm font-medium text-navy mb-1">
                Payment app <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <select
                {...register('paymentApp')}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand"
              >
                <option value="">— Select app —</option>
                {PAYMENT_APPS.map((app) => (
                  <option key={app} value={app}>{app}</option>
                ))}
              </select>
            </div>
          )}

          {/* Amazon Prime (only for Amazon or shopping) */}
          {showPrime && (
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                {...register('hasAmazonPrime')}
                className="w-4 h-4 rounded border-gray-300 text-brand focus:ring-brand"
              />
              <span className="text-sm text-navy">I have Amazon Prime</span>
            </label>
          )}

          {/* Date */}
          <Input
            id="transactionDate"
            type="date"
            label="Transaction date"
            {...register('transactionDate')}
          />

          <Button
            type="submit"
            className="w-full"
            size="lg"
            loading={recommend.isPending}
            disabled={!canSubmit || recommend.isPending}
          >
            Get Recommendation
          </Button>
        </form>
      </div>
    </PageLayout>
  );
}

export type { RecommendationResponse } from '../types';
