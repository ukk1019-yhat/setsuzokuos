import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Building, DollarSign, Globe, Save } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { currentOrg, refreshUser, currentRole } = useAuth();
  const [name, setName] = useState('');
  const [businessEmail, setBusinessEmail] = useState('');
  const [description, setDescription] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [taxNumber, setTaxNumber] = useState('');
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [country, setCountry] = useState('IN');

  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currentOrg) {
      setName(currentOrg.name || '');
      setBusinessEmail(currentOrg.businessEmail || '');
      setDescription(currentOrg.description || '');
      setCurrency(currentOrg.currency || 'INR');
      setTaxNumber(currentOrg.taxNumber || '');
      setTimezone(currentOrg.timezone || 'Asia/Kolkata');
      setCountry(currentOrg.country || 'IN');
    }
  }, [currentOrg]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await apiRequest('/organizations/current', {
        method: 'PATCH',
        body: JSON.stringify({
          name,
          businessEmail: businessEmail || undefined,
          description: description || undefined,
          currency,
          taxNumber: taxNumber || undefined,
          timezone,
          country,
        }),
      });

      await refreshUser();
      setSuccessMessage('Organization settings updated successfully.');
    } catch (err: any) {
      setError(err.message || 'Failed to update settings');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="pb-2 border-b border-brand-border">
        <h1 className="text-2xl font-bold text-brand-navy">Organization Settings</h1>
        <p className="text-xs text-brand-muted mt-1">
          Configure business identity, billing currency, localization, and compliance tax parameters.
        </p>
      </div>

      {successMessage && (
        <div className="p-3 rounded-md bg-emerald-50 border border-emerald-200 text-xs text-emerald-700">
          {successMessage}
        </div>
      )}

      {error && (
        <div className="p-3 rounded-md bg-rose-50 border border-rose-200 text-xs text-rose-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <Card title="Business Identity" subtitle="Core branding and registered entity name">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-brand-text mb-1.5 uppercase tracking-wide">
                Brand Logo & Identity
              </label>
              <div className="flex items-center gap-4 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="w-16 h-16 rounded-xl bg-white p-1.5 border border-slate-200 shadow-sm flex items-center justify-center flex-shrink-0">
                  <img
                    src="/setsuzoku-logo.png"
                    alt="SETSUZOKU"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <span className="text-xs font-bold text-brand-navy block">Official SETSUZOKU Brand Identity</span>
                  <span className="text-[11px] text-brand-muted block">Applied across client portals, quotations, invoices, and lead intake forms.</span>
                  <span className="text-[11px] text-brand-teal font-semibold mt-0.5 block">Primary Contact: info@setsuzoku.in</span>
                </div>
              </div>
            </div>

            <Input
              label="Legal Organization Name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Agency Name"
            />

            <Input
              label="Official Invoicing & Business Email"
              type="email"
              value={businessEmail}
              onChange={(e) => setBusinessEmail(e.target.value)}
              placeholder="info@setsuzoku.in"
            />

            <div>
              <label className="block text-xs font-semibold text-brand-text mb-1 uppercase tracking-wide">
                Business Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-white border border-brand-border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-teal"
                placeholder="What your agency or firm provides..."
              />
            </div>
          </div>
        </Card>

        <Card title="Financial & Tax Setup" subtitle="Currency and compliance parameters for quotes and invoices">
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1 uppercase tracking-wide">
                  Default Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-brand-border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-teal"
                >
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="AED">AED (د.إ)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1 uppercase tracking-wide">
                  Country
                </label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-brand-border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-teal"
                >
                  <option value="IN">India</option>
                  <option value="US">United States</option>
                  <option value="UK">United Kingdom</option>
                  <option value="AE">United Arab Emirates</option>
                </select>
              </div>
            </div>

            <Input
              label="Tax Identification / GST Number"
              value={taxNumber}
              onChange={(e) => setTaxNumber(e.target.value)}
              placeholder="e.g. 29AAAAA0000A1Z5"
              helperText="This number is automatically attached to quotes and tax invoices"
            />

            <Input
              label="Operational Timezone"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              placeholder="Asia/Kolkata"
            />
          </div>
        </Card>

        {/* Legal, IP & Privacy Governance Card */}
        <Card
          title="Legal, IP & Data Governance"
          subtitle="Customer content ownership, DPDP compliance, and copyright terms"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-brand-navy">Customer Content Ownership</span>
                <span className="text-[10px] uppercase font-semibold tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                  100% Client Owned
                </span>
              </div>
              <p className="text-brand-muted leading-relaxed">
                You and your clients retain full ownership and intellectual property rights in all uploaded briefs, footage, project files, and deliverables. Setsuzoku OS claims zero title or ownership in user data.
              </p>
              <div className="pt-1 text-[11px] text-brand-text font-medium flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                <span>Customer content is strictly excluded from AI model training and marketing.</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3 border border-brand-border rounded-lg bg-white space-y-1">
                <span className="font-semibold text-brand-navy block">India DPDP Act (2023)</span>
                <p className="text-[11px] text-brand-muted">
                  Full compliance with personal data minimization, Data Subject Access Requests (DSAR export), and Right to Erasure under Section 12.
                </p>
              </div>

              <div className="p-3 border border-brand-border rounded-lg bg-white space-y-1">
                <span className="font-semibold text-brand-navy block">Copyright Takedown Process</span>
                <p className="text-[11px] text-brand-muted">
                  Notice-and-takedown procedure with 36-hour SLA. Designated agent: <strong className="text-brand-navy">info@setsuzoku.in</strong>
                </p>
              </div>
            </div>

            <div className="p-3 border border-brand-border rounded-lg bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="font-semibold text-brand-navy block">Third-Party Software Audit</span>
                <span className="text-[11px] text-brand-muted">
                  Verified 100% permissive commercial licenses (MIT, Apache-2.0, ISC, SIL OFL 1.1). Zero GPL/AGPL dependencies.
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-500 whitespace-nowrap">
                &copy; 2026 Setsuzoku Media Labs
              </span>
            </div>
          </div>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="submit" variant="primary" isLoading={isLoading} className="gap-2">
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </Button>
        </div>
      </form>
    </div>
  );
};

