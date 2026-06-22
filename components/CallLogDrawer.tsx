import React, { useEffect, useState } from 'react';
import { Customer, CallLog } from '@/lib/types';
import { getCallLog } from '@/lib/api';
import { FileText, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface CallLogDrawerProps {
  customer: Customer | null;
  onClose: () => void;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  PENDING:        { label: 'Pending',        className: 'bg-muted text-muted-foreground border-transparent' },
  CALL_INITIATED: { label: 'Call Initiated', className: 'bg-blue-500/15 text-blue-400 border-blue-500/20' },
  QUALIFIED:      { label: 'Qualified',      className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' },
  FAILED:         { label: 'Failed',         className: 'bg-red-500/15 text-red-400 border-red-500/20' },
  NOT_INTERESTED: { label: 'Not Interested', className: 'bg-amber-500/15 text-amber-400 border-amber-500/20' },
  NEEDS_REVIEW:   { label: 'Needs Review',   className: 'bg-purple-500/15 text-purple-400 border-purple-500/20' },
};

export function CallLogDrawer({ customer, onClose }: CallLogDrawerProps) {
  const [log, setLog] = useState<CallLog | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (customer) {
      const fetchLog = async () => {
        setLoading(true);
        try {
          const data = await getCallLog(customer.id);
          setLog(data);
        } catch (error) {
          toast.error('Failed to fetch call log details.');
          console.warn('API Error:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchLog();
    } else {
      setLog(null);
    }
  }, [customer]);

  return (
    <Sheet open={!!customer} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-[450px] sm:w-[600px] sm:max-w-md border-l border-border bg-background p-0 flex flex-col shadow-2xl">
        <SheetHeader className="px-6 py-5 border-b border-border bg-muted/20">
          <SheetTitle className="text-lg">Call Log Detail</SheetTitle>
          <SheetDescription className="text-sm mt-1">
            {customer?.name} <span className="mx-1 text-muted-foreground/40">•</span> <span className="font-mono text-xs">{customer?.phone}</span>
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Loading call details...</span>
            </div>
          ) : log ? (
            <>
              {/* Outcome Section */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  AI Summary & Outcome
                </h3>
                <div className="bg-muted/30 rounded-xl p-5 border border-border">
                  <div className="mb-3">
                    {log.outcome && (
                      <Badge variant="outline" className={cn('text-[11px] font-medium px-2 py-0.5', statusConfig[log.outcome]?.className ?? statusConfig.PENDING.className)}>
                        {statusConfig[log.outcome]?.label ?? log.outcome}
                      </Badge>
                    )}
                  </div>
                  <p className="text-foreground text-sm leading-relaxed whitespace-pre-wrap">
                    {log.summary || 'No summary available.'}
                  </p>
                </div>
              </div>

              {/* Transcript Section */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5" />
                  Full Transcript
                </h3>
                <div className="bg-muted/30 rounded-xl p-5 border border-border">
                  <p className="text-foreground text-[13px] whitespace-pre-wrap font-mono leading-relaxed">
                    {log.transcript || 'No transcript available.'}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <p className="text-sm">No call log data available for this customer.</p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
