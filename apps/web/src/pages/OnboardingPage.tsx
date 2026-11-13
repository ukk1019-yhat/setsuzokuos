import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { AuthLayout } from '../components/layout/AuthLayout';
import { Building2, Globe } from 'lucide-react';

export const OnboardingPage: React.FC = () => {
  const { refreshUser } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [businessEmail, setBusinessEmail] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [country, setCountry] = useState('IN');
  const [taxNumber, setTaxNumber] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFinish = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await apiRequest('/organizations', {
        method: 'POST',
        body: JSON.stringify({
          name,
          description: description || undefined,
          businessEmail: businessEmail || undefined,
          currency,
          timezone,
          country,
          taxNumber: taxNumber || undefined,
        }),
      });

      await refreshUser();
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to complete onboarding');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Organization Setup"
      subtitle={`Step ${step} of 2: ${step === 1 ? 'Business Identity' : 'Financial & Localization'}`}
    >
      {/* Progress bar */}
      <div className="w-full bg-gray-200 h-1.5 rounded-full mb-6 overflow-hidden">
        <div
          className="bg-brand-teal h-full transition-all duration-300"
          style={{ width: step === 1 ? '50%' : '100%' }}
        />
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-md bg-rose-50 border border-rose-200 text-xs text-rose-700">
          {error}
        </div>
      )}

      {step === 1 ? (
        <div className="space-y-4">
          <Input
            label="Legal Business Name *"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Acme Media Labs Pvt Ltd"
          />

          <Input
            label="Official Business Email"
            type="email"
            value={businessEmail}
            onChange={(e) => setBusinessEmail(e.target.value)}
            placeholder="billing@acmemedia.com"
            helperText="Used on outgoing invoices and client contracts"
          />

          <div>
            <label className="block text-xs font-semibold text-brand-text mb-1 uppercase tracking-wide">
              Business Description / Industry
            </label>
            <textarea
              rows={3}
              className="w-full px-3.5 py-2 text-sm bg-white border border-brand-border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-teal focus:border-brand-teal"
              placeholder="e.g. Full-service digital marketing, branding and video editing agency."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <Button
            type="button"
            variant="primary"
            className="w-full mt-4"
            disabled={!name.trim()}
            onClick={() => setStep(2)}
          >
            Continue to Financial Settings &rarr;
          </Button>
        </div>
      ) : (
        <form onSubmit={handleFinish} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-brand-text mb-1 uppercase tracking-wide">
                Primary Currency
              </label>
              <select
                className="w-full px-3 py-2 text-sm bg-white border border-brand-border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-teal"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="AED">AED (د.إ)</option>
                <option value="SGD">SGD (S$)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-text mb-1 uppercase tracking-wide">
                Country
              </label>
              <select
                className="w-full px-3 py-2 text-sm bg-white border border-brand-border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-teal"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              >
                <option value="IN">India (IN)</option>
                <option value="US">United States (US)</option>
                <option value="UK">United Kingdom (UK)</option>
                <option value="AE">United Arab Emirates (AE)</option>
                <option value="SG">Singapore (SG)</option>
              </select>
            </div>
          </div>

          <Input
            label="Tax / GST Identification Number"
            value={taxNumber}
            onChange={(e) => setTaxNumber(e.target.value)}
            placeholder="e.g. 29AAAAA0000A1Z5 / EIN"
            helperText="Printed on quotation headers and formal tax invoices"
          />

          <Input
            label="Operational Timezone"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            placeholder="Asia/Kolkata"
          />

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="w-1/3"
              onClick={() => setStep(1)}
            >
              Back
            </Button>
            <Button
              type="submit"
              variant="secondary"
              className="w-2/3"
              isLoading={isLoading}
            >
              Launch Workspace
            </Button>
          </div>
        </form>
      )}
    </AuthLayout>
  );
};

