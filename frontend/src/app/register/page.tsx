/**
 * Registration Page
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

export default function RegisterPage() {
  const router = useRouter();
  const setUser = useStore((state) => state.setUser);
  const addToast = useStore((state) => state.addToast);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);

    try {
      const { user } = await api.register(email, password, name);
      setUser(user);
      addToast('Welcome aboard! Your account is ready.', 'success');
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background dark:bg-dark-background px-4">
      <Container size="sm">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🧠</div>
          <h1 className="text-3xl font-bold mb-2">Get Started</h1>
          <p className="text-text-secondary dark:text-dark-text-secondary">
            Create your ADHD Dashboard account
          </p>
        </div>

        <div className="bg-surface dark:bg-dark-surface rounded-3xl p-8 shadow-ios-lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="text"
              label="Name"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />

            <Input
              type="email"
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              type="password"
              label="Password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              helpText="Choose a strong password"
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
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="text-ios-blue hover:underline text-sm"
            >
              Already have an account? Log in
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
