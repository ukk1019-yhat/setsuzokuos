import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiRequest } from '../api/client';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Layers, CheckCircle2, ArrowRight, Building, Mail, Sparkles } from 'lucide-react';

interface OrgPublicInfo {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  country: string;
  currency: string;
  description?: string | null;
}

export const PublicLeadIntakePage: React.FC = () => {
  const { orgSlug } = useParams<{ orgSlug: string }>();
  const [org, setOrg] = useState<OrgPublicInfo | null>(null);
  const [isLoadingOrg, setIsLoadingOrg] = useState(true);

  // Form State
  const [title, setTitle] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [serviceRequired, setServiceRequired] = useState('Web Development & Engineering');
  const [estimatedBudget, setEstimatedBudget] = useState<number | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrg = async () => {
      try {
        const slug = orgSlug || 'setsuzoku-media-labs';
        const data = await apiRequest<OrgPublicInfo>(`/organizations/public/${slug}`);
        setOrg(data);
      } catch (err) {
        console.warn('Could not fetch org details, using fallback branding:', err);
        setOrg({
          id: 'default',
          name: 'SETSUZOKU Media Labs',
          slug: orgSlug || 'setsuzoku-media-labs',
          country: 'India',
          currency: 'INR',
          description: 'Unified Creative Agency & Digital Engineering Studio',
        });
      } finally {
        setIsLoadingOrg(false);
      }
    };
    fetchOrg();
  }, [orgSlug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !contactName || !email) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await apiRequest('/leads/intake', {
        method: 'POST',
        body: JSON.stringify({
          organizationSlug: org?.slug || orgSlug || 'setsuzoku-media-labs',
          title,
          contactName,
          email,
          phone: phone || undefined,
          companyName: companyName || undefined,
          serviceRequired: serviceRequired || undefined,
          estimatedBudget: estimatedBudget ? Number(estimatedBudget) : undefined,
        }),
      });

      setSubmitted(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit inquiry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const services = [
    'Web Development & Engineering',
    'Brand Identity & UI/UX Design',
    'Video Production & Post-Editing',
    'Digital Marketing & Growth',
    'Cloud Architecture & IT Services',
    'Strategic Business Consulting',
  ];

  if (isLoadingOrg) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F9FB]">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 text-brand-teal mx-auto mb-3" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <span className="text-xs uppercase font-semibold text-brand-muted tracking-wider">
            Loading Client Portal...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F9FB] flex flex-col justify-between font-sans text-brand-navy">
      {/* Header Bar */}
      <header className="bg-white border-b border-brand-border px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-brand-teal text-white flex items-center justify-center font-bold shadow">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-brand-navy">{org?.name}</h1>
            <span className="text-[10px] text-brand-teal font-medium tracking-wider uppercase block">
              Direct Project Inquiry
            </span>
          </div>
        </div>
        <Link
          to="/login"
          className="text-xs font-semibold text-brand-muted hover:text-brand-navy transition flex items-center gap-1.5"
        >
          <span>Staff Login</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-12">
        {submitted ? (
          <div className="bg-white border border-brand-border rounded-xl p-8 sm:p-12 text-center shadow-sm">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-brand-navy mb-2">
              Inquiry Received Successfully!
            </h2>
            <p className="text-sm text-brand-muted max-w-md mx-auto mb-8 leading-relaxed">
              Thank you, <strong className="text-brand-navy">{contactName}</strong>. Your project details have been logged in our system. A project director from{' '}
              <strong className="text-brand-navy">{org?.name}</strong> will review your requirements and reach out within 24 hours.
            </p>
            <div className="p-4 rounded-lg bg-gray-50 border border-gray-100 max-w-sm mx-auto text-xs text-gray-600 mb-8 space-y-1 text-left">
              <div className="flex justify-between">
                <span className="text-gray-400">Project:</span>
                <span className="font-semibold text-gray-800">{title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Service:</span>
                <span className="font-semibold text-gray-800">{serviceRequired}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Confirmation Sent To:</span>
                <span className="font-semibold text-gray-800">{email}</span>
              </div>
            </div>
            <Button
              variant="outline"
              size="md"
              onClick={() => {
                setSubmitted(false);
                setTitle('');
                setContactName('');
                setEmail('');
                setPhone('');
                setCompanyName('');
                setEstimatedBudget('');
              }}
            >
              Submit Another Inquiry
            </Button>
          </div>
        ) : (
          <div className="bg-white border border-brand-border rounded-xl shadow-sm overflow-hidden">
            {/* Form Banner */}
            <div className="bg-brand-navy p-8 text-white">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-teal/20 text-brand-teal text-[11px] font-semibold mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Start Your Next Project</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight mb-2">
                Work With {org?.name}
              </h2>
              <p className="text-xs text-slate-300 max-w-lg leading-relaxed">
                {org?.description ||
                  'Tell us about your project objectives, timeline, and deliverables. We will evaluate feasibility and prepare an official quotation.'}
              </p>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {errorMsg && (
                <div className="p-3 rounded-md bg-rose-50 border border-rose-200 text-xs text-rose-700">
                  {errorMsg}
                </div>
              )}

              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-brand-muted border-b border-gray-100 pb-2">
                  1. Project Headline & Service
                </h3>
                <Input
                  label="Project Title / Headline"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Next-Gen Mobile App & Web Platform"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-brand-text mb-1">
                      Primary Service Category
                    </label>
                    <select
                      value={serviceRequired}
                      onChange={(e) => setServiceRequired(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-brand-border rounded-md focus:outline-none focus:ring-1 focus:ring-brand-teal"
                    >
                      {services.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  <Input
                    label={`Estimated Budget (${org?.currency || 'INR'})`}
                    type="number"
                    value={estimatedBudget}
                    onChange={(e) => setEstimatedBudget(e.target.value ? Number(e.target.value) : '')}
                    placeholder="e.g. 150000"
                  />
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-brand-muted border-b border-gray-100 pb-2">
                  2. Contact & Company Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Your Full Name"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Jane Doe"
                  />

                  <Input
                    label="Business Email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jane@company.com"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Company / Brand Name"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Acme Studios Inc."
                  />

                  <Input
                    label="Phone Number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-[11px] text-brand-muted">
                  🔒 Information transmitted is kept strictly confidential.
                </span>
                <Button type="submit" variant="primary" size="md" isLoading={isSubmitting}>
                  Submit Project Inquiry
                </Button>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-brand-border bg-white py-6 text-center text-xs text-brand-muted">
        Powered by{' '}
        <strong className="text-brand-navy">SETSUZOKU OS</strong> — From First Inquiry to Final Payment.
      </footer>
    </div>
  );
};

