import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { AuthLayout } from '../components/layout/AuthLayout';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await register({
        fullName,
        email,
        password,
        organizationName: organizationName.trim() || undefined,
      });

      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check your details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Get Started" subtitle="Create your agency or business workspace">
      {error && (
        <div className="mb-4 p-3 rounded-md bg-rose-50 border border-rose-200 text-xs text-rose-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Your Full Name"
          type="text"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Jane Doe"
        />

        <Input
          label="Work Email Address"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="jane@agency.com"
        />

        <Input
          label="Password (min 8 characters, uppercase & number)"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />

        <Input
          label="Initial Business / Organization Name"
          type="text"
          value={organizationName}
          onChange={(e) => setOrganizationName(e.target.value)}
          placeholder="Acme Creative Studio (Optional)"
          helperText="You can also set this up in the next step"
        />

        <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>
          Create Workspace
        </Button>
      </form>

      <div className="mt-6 text-center text-xs text-brand-muted">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-brand-teal hover:underline">
          Sign in
        </Link>
      </div>
    </AuthLayout>
  );
};

