'use client';

import React, { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { getCustomers, createCustomer } from '@/lib/api';
import { Customer } from '@/lib/types';
import { CallLogDrawer } from '@/components/CallLogDrawer';
import { createClient } from '@/utils/supabase/client';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const statusConfig: Record<string, { label: string; className: string }> = {
  PENDING:        { label: 'Pending',        className: 'bg-muted text-muted-foreground border-transparent' },
  CALL_INITIATED: { label: 'Call Initiated', className: 'bg-blue-500/15 text-blue-400 border-blue-500/20' },
  QUALIFIED:      { label: 'Qualified',      className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' },
  FAILED:         { label: 'Failed',         className: 'bg-red-500/15 text-red-400 border-red-500/20' },
  NOT_INTERESTED: { label: 'Not Interested', className: 'bg-amber-500/15 text-amber-400 border-amber-500/20' },
  NEEDS_REVIEW:   { label: 'Needs Review',   className: 'bg-purple-500/15 text-purple-400 border-purple-500/20' },
};

export default function LeadsPage() {
  const { selectedCompanyId } = useAppStore();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!selectedCompanyId) { setCustomers([]); return; }
    const fetchCustomers = async () => {
      try { setCustomers(await (await import('@/lib/api')).getCustomers(selectedCompanyId)); }
      catch (e) { console.warn(e); }
    };
    fetchCustomers();
    
    const supabase = createClient();
    const channel = supabase
      .channel(`customers-leads-${selectedCompanyId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'customers', filter: `company_id=eq.${selectedCompanyId}` },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            setCustomers((prev) => prev.map(c => c.id === payload.new.id ? { ...c, ...payload.new } : c));
          } else if (payload.eventType === 'INSERT') {
            setCustomers((prev) => [payload.new as Customer, ...prev]);
          } else if (payload.eventType === 'DELETE') {
            setCustomers((prev) => prev.filter(c => c.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedCompanyId]);

  const handleRowClick = (c: Customer) => {
    if (['QUALIFIED', 'NOT_INTERESTED', 'NEEDS_REVIEW', 'FAILED'].includes(c.status)) setSelectedCustomer(c);
  };

  const handleAddLead = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedCompanyId) return;
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    try {
      await createCustomer(
        selectedCompanyId,
        formData.get('name') as string,
        formData.get('phone') as string,
        formData.get('email') as string
      );
      toast.success('Lead added successfully');
      setIsAddOpen(false);
    } catch (error) {
      toast.error('Failed to add lead');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Leads</h1>
          <p className="text-sm text-muted-foreground mt-0.5">All leads for the selected tenant.</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button disabled={!selectedCompanyId}>Add Lead</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Lead</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddLead} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" required placeholder="John Doe" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" name="phone" required placeholder="+1234567890" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email (Optional)</Label>
                <Input id="email" name="email" type="email" placeholder="john@example.com" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Adding...' : 'Add Lead'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border border-border shadow-none">
        <CardHeader className="px-5 py-4 border-b border-border flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold">All Leads</CardTitle>
          <span className="text-xs text-muted-foreground">{customers.length} total</span>
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b border-border">
              <TableHead className="pl-5 text-xs font-medium text-muted-foreground uppercase tracking-wider w-[35%]">Name</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider w-[30%]">Phone</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider w-[20%]">Status</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider text-right pr-5">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center text-sm text-muted-foreground">
                  No leads found. Select a tenant or start a campaign.
                </TableCell>
              </TableRow>
            ) : (
              customers.map((customer) => {
                const config = statusConfig[customer.status] ?? statusConfig.PENDING;
                const clickable = ['QUALIFIED', 'NOT_INTERESTED', 'NEEDS_REVIEW', 'FAILED'].includes(customer.status);
                return (
                  <TableRow
                    key={customer.id}
                    onClick={() => handleRowClick(customer)}
                    className={cn(
                      'border-b border-border/60 transition-colors',
                      clickable ? 'cursor-pointer hover:bg-muted/40' : 'cursor-default'
                    )}
                  >
                    <TableCell className="pl-5 py-3.5 font-medium text-sm">{customer.name}</TableCell>
                    <TableCell className="py-3.5 text-sm text-muted-foreground font-mono">{customer.phone}</TableCell>
                    <TableCell className="py-3.5">
                      <Badge variant="outline" className={cn('text-[11px] font-medium px-2 py-0.5', config.className)}>
                        {config.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3.5 text-right pr-5">
                      {clickable ? (
                        <span className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors underline-offset-2 hover:underline">
                          View log →
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground/40">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

      <CallLogDrawer customer={selectedCustomer} onClose={() => setSelectedCustomer(null)} />
    </div>
  );
}
