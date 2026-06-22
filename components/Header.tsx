'use client';

import React, { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { getCompanies, startCampaign } from '@/lib/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Play, Loader2, Building2 } from 'lucide-react';

export function Header() {
  const { companies, setCompanies, selectedCompanyId, setSelectedCompanyId } = useAppStore();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const data = await getCompanies();
        setCompanies(data);
        if (data.length > 0 && !selectedCompanyId) {
          setSelectedCompanyId(data[0].id);
        }
      } catch (error) {
        toast.error('Failed to load companies. Is the backend running?');
        console.warn('API Error:', error);
      }
    };
    fetchCompanies();
  }, [setCompanies, selectedCompanyId, setSelectedCompanyId]);

  const handleStartCampaign = async () => {
    if (!selectedCompanyId) {
      toast.error('Please select a company first.');
      return;
    }
    setLoading(true);
    try {
      await startCampaign(selectedCompanyId);
      toast.success('Campaign started! Calls dispatched.');
    } catch (error) {
      toast.error('Failed to start campaign.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <header className="h-16 shrink-0 border-b border-border bg-background/80 backdrop-blur-sm flex items-center justify-between px-6 gap-4">
      {/* Left: Tenant Name */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 h-10 px-2">
          <Building2 className="w-5 h-5 text-muted-foreground" />
          <div className="flex flex-col items-start gap-0 text-left">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold leading-none">Your Organization</span>
            <span className="text-sm font-medium text-foreground">
              {companies.find(c => c.id === selectedCompanyId)?.name || 'Loading...'}
            </span>
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        <Button
          onClick={handleStartCampaign}
          disabled={loading || !selectedCompanyId}
          size="default"
          className="h-9 text-sm gap-2 px-4 shadow-sm"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Play className="w-4 h-4" />
          )}
          {loading ? 'Starting…' : 'Start Campaign'}
        </Button>
      </div>
    </header>
  );
}
