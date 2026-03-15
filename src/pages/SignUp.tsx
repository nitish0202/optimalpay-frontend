import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../store/authStore';
import { signup } from '../api/auth';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import axios from 'axios';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Min 8 characters'),
});
type FormData = z.infer<typeof schema>;

function strengthLabel(pw: string): { label: string; color: string } {
  if (pw.length === 0) return { label: '', color: '' };
  if (pw.length < 8) return { label: 'Weak', color: 'text-red-500' };
  if (pw.match(/[A-Z]/) && pw.match(/[0-9]/) && pw.match(/[^a-zA-Z0-9]/))
    return { label: 'Strong', color: 'text-green-600' };
  return { label: 'Medium', color: 'text-yellow-600' };
}

export function SignUp() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [serverError, setServerError] = useState('');
  const [pwValue, setPwValue] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setServerError('');
    try {
      const result = await signup(data);
      setAuth(result.user, result.accessToken);
      navigate('/onboarding');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 409) setServerError('An account with this email already exists.');
        else if (status === 400) setServerError('Please check your inputs and try again.');
        else setServerError('Something went wrong. Please try again.');
      }
    }
  };

  const strength = strengthLabel(pwValue);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 px-8 py-10">
          <div className="mb-8 text-center">
            <Link to="/" className="font-semibold text-navy text-xl">OptimalPay</Link>
            <p className="text-gray-500 text-sm mt-2">Create your free account</p>
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
            <div>
              <Input
                id="password"
                type="password"
                label="Password"
                placeholder="Min 8 characters"
                error={errors.password?.message}
                {...register('password', {
                  onChange: (e) => setPwValue(e.target.value),
                })}
              />
              {strength.label && (
                <p className={`text-xs mt-1 ${strength.color}`}>
                  Password strength: {strength.label}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" loading={isSubmitting}>
              Create account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-brand font-medium hover:underline">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
