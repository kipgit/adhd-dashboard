/**
 * Login Page
 * Apple-inspired minimal design
 */

'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Container } from '@/components/layout/Container';
import { api } from '@/lib/api';
import { useStore } from '@/store/useStore';

export default function LoginPage() {
  const router = useRouter();
  const setUser = useStore((state) => state.setUser);
  const addToast = useStore((state) => state.addToast);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { user } = await api.login(email, password);
      setUser(user);
      addToast('Welcome back!', 'success');
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background dark:bg-dark-background px-4">
      <Container size="sm">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🧠</div>
          <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
          <p className="text-text-secondary dark:text-dark-text-secondary">
            Log in to your ADHD Dashboard
          </p>
        </div>

        <div className="bg-surface dark:bg-dark-surface rounded-3xl p-8 shadow-ios-lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />

            <Input
              type="password"
              label="Password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && (
              <div className="p-3 rounded-xl bg-ios-red/10 text-ios-red text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={isLoading}
            >
              Log In
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/register"
              className="text-ios-blue hover:underline text-sm"
            >
              Don't have an account? Sign up
            </Link>
          </div>
        </div>

        <p className="text-center text-text-tertiary dark:text-dark-text-tertiary text-xs mt-8">
          Built with 💚 for neurodivergent brains
        </p>
      </Container>
    </div>
  );
}
