import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../store/authStore';
import { login } from '../api/auth';
import { getWallet } from '../api/wallet';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import axios from 'axios';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});
type FormData = z.infer<typeof schema>;

export function Login() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [serverError, setServerError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setServerError('');
    try {
      const result = await login(data);
      setAuth(result.user, result.accessToken);

      // Check if user has wallet cards to decide where to redirect
      try {
        const wallet = await getWallet();
        navigate(wallet.length > 0 ? '/dashboard' : '/onboarding');
      } catch {
        navigate('/onboarding');
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 401 || status === 400) {
          setServerError('Incorrect email or password.');
        } else {
          setServerError('Something went wrong. Please try again.');
        }
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 px-8 py-10">
          <div className="mb-8 text-center">
            <Link to="/" className="font-semibold text-navy text-xl">OptimalPay</Link>
            <p className="text-gray-500 text-sm mt-2">Welcome back</p>
          </div>

          {serverError && (
            <div className="mb-4 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              id="email"
              type="email"
              label="Email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              id="password"
              type="password"
              label="Password"
              placeholder="Your password"
              error={errors.password?.message}
              {...register('password')}
            />

            <Button type="submit" className="w-full" loading={isSubmitting}>
              Log in
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            New here?{' '}
            <Link to="/signup" className="text-brand font-medium hover:underline">Create account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
