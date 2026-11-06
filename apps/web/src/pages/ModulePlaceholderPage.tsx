import React from 'react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Link } from 'react-router-dom';
import { Layers, ArrowLeft } from 'lucide-react';

interface ModulePlaceholderProps {
  title: string;
  tagline: string;
  modulePhase: string;
  features: string[];
}

export const ModulePlaceholderPage: React.FC<ModulePlaceholderProps> = ({
  title,
  tagline,
  modulePhase,
  features,
}) => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between pb-2 border-b border-brand-border">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-brand-navy">{title}</h1>
            <Badge variant="teal" size="sm">
              {modulePhase}
            </Badge>
          </div>
          <p className="text-xs text-brand-muted mt-1">{tagline}</p>
        </div>

        <Link to="/dashboard">
          <Button variant="outline" size="sm" className="gap-1.5">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Overview</span>
          </Button>
        </Link>
      </div>

      <Card className="p-8 text-center bg-white border border-brand-border shadow-sm">
        <div className="w-12 h-12 rounded-xl bg-brand-navy/5 text-brand-navy flex items-center justify-center mx-auto mb-4">
          <Layers className="w-6 h-6 text-brand-teal" />
        </div>
        <h3 className="text-base font-semibold text-brand-navy">Connected Workflow Module</h3>
        <p className="text-xs text-brand-muted max-w-md mx-auto mt-1">
          This module is part of the continuous SETSUZOKU OS lifecycle engine. Connected database models, API contracts, and decimal schemas are ready.
        </p>

        <div className="mt-6 max-w-lg mx-auto text-left bg-gray-50/70 p-4 rounded-lg border border-gray-100">
          <span className="text-[11px] font-bold text-brand-navy uppercase tracking-wider block mb-2">
            Module Architecture & Capabilities
          </span>
          <ul className="space-y-1.5 text-xs text-brand-text">
            {features.map((f, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-teal flex-shrink-0" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>
      </Card>
    </div>
  );
};

