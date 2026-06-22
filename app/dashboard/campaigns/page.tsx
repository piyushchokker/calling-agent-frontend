'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { startCampaign } from '@/lib/api';
import { Play, Clock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function CampaignsPage() {
  const { selectedCompanyId } = useAppStore();
  const [loading, setLoading] = useState(false);

  const handleStartCampaign = async () => {
    if (!selectedCompanyId) {
      toast.error('Please select a tenant from the header first.');
      return;
    }
    
    setLoading(true);
    try {
      await startCampaign(selectedCompanyId);
      toast.success('Campaign started successfully!');
    } catch (error) {
      toast.error('Failed to start campaign.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Campaigns</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Launch and monitor your outbound voice campaigns.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border border-border shadow-none">
          <CardHeader className="px-5 pt-5 pb-3">
            <CardTitle className="text-base">New Campaign</CardTitle>
            <CardDescription className="text-sm">
              Start a new outbound calling campaign for all pending leads in the selected tenant. 
              The AI agent will automatically dial and qualify leads.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-5 pb-5 pt-2">
            <Button
              onClick={handleStartCampaign}
              disabled={loading || !selectedCompanyId}
              className="w-full gap-2 font-medium"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              {loading ? 'Starting Campaign...' : 'Start Outreach Campaign'}
            </Button>
            
            {!selectedCompanyId && (
              <p className="text-xs text-destructive mt-3 text-center">
                Please select a tenant in the top header to start.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border border-border shadow-none flex flex-col h-full min-h-[250px]">
          <CardHeader className="px-5 pt-5 pb-3 border-b border-border">
            <CardTitle className="text-base">Recent Activity</CardTitle>
            <CardDescription className="text-sm">View recent campaign history.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col items-center justify-center p-8">
            <Clock className="w-8 h-8 text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground text-center">
              Campaign history will appear here once supported by the backend.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
