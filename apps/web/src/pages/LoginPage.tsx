import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { AuthLayout } from '../components/layout/AuthLayout';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Sign In" subtitle="Access your business operations console">
      {error && (
        <div className="mb-4 p-3 rounded-md bg-rose-50 border border-rose-200 text-xs text-rose-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@agency.com"
        />

        <div>
          <Input
            label="Password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
          <div className="flex justify-end mt-1">
            <a href="#forgot" className="text-xs text-brand-teal hover:underline">
              Forgot password?
            </a>
          </div>
        </div>

        <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>
          Sign In to Setsuzoku
        </Button>
      </form>

      <div className="mt-6 text-center text-xs text-brand-muted">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="font-semibold text-brand-teal hover:underline">
          Create organization
        </Link>
      </div>
    </AuthLayout>
  );
};

