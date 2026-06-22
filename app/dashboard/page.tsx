'use client';

import React, { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { getCustomers } from '@/lib/api';
import { Customer } from '@/lib/types';
import { CallLogDrawer } from '@/components/CallLogDrawer';
import { createClient } from '@/utils/supabase/client';
import { Users, PhoneOutgoing, CheckCircle, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const statusConfig: Record<string, { label: string; className: string }> = {
  PENDING:        { label: 'Pending',        className: 'bg-muted text-muted-foreground border-transparent' },
  CALL_INITIATED: { label: 'Call Initiated', className: 'bg-blue-500/15 text-blue-400 border-blue-500/20' },
  QUALIFIED:      { label: 'Qualified',      className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' },
  FAILED:         { label: 'Failed',         className: 'bg-red-500/15 text-red-400 border-red-500/20' },
  NOT_INTERESTED: { label: 'Not Interested', className: 'bg-amber-500/15 text-amber-400 border-amber-500/20' },
  NEEDS_REVIEW:   { label: 'Needs Review',   className: 'bg-purple-500/15 text-purple-400 border-purple-500/20' },
};

export default function DashboardPage() {
  const { selectedCompanyId } = useAppStore();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    if (!selectedCompanyId) { setCustomers([]); return; }
    const fetchCustomers = async () => {
      try {
        const data = await getCustomers(selectedCompanyId);
        setCustomers(data);
      } catch (e) { console.warn(e); }
    };
    fetchCustomers();
    
    const supabase = createClient();
    const channel = supabase
      .channel(`customers-dashboard-${selectedCompanyId}`)
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

  const totalLeads     = customers.length;
  const callsInitiated = customers.filter(c => c.status !== 'PENDING').length;
  const qualifiedLeads = customers.filter(c => c.status === 'QUALIFIED').length;
  const conversionRate = totalLeads > 0 ? Math.round((qualifiedLeads / totalLeads) * 100) : 0;

  const handleRowClick = (customer: Customer) => {
    if (['QUALIFIED', 'NOT_INTERESTED', 'NEEDS_REVIEW', 'FAILED'].includes(customer.status)) {
      setSelectedCustomer(customer);
    }
  };

  const stats = [
    { label: 'Total Leads',     value: totalLeads,       icon: Users,          color: 'text-violet-400' },
    { label: 'Calls Initiated', value: callsInitiated,   icon: PhoneOutgoing,  color: 'text-blue-400' },
    { label: 'Qualified',       value: qualifiedLeads,   icon: CheckCircle,    color: 'text-emerald-400' },
    { label: 'Conversion',      value: `${conversionRate}%`, icon: TrendingUp, color: 'text-amber-400' },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
      {/* Page title */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Campaign performance overview for the selected tenant.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="border border-border shadow-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4 px-5">
              <CardTitle className="text-xs font-medium text-muted-foreground">{label}</CardTitle>
              <Icon className={cn('w-4 h-4 shrink-0', color)} />
            </CardHeader>
            <CardContent className="px-5 pb-4">
              <div className="text-2xl font-bold tracking-tight">{value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Leads table */}
      <Card className="border border-border shadow-none">
        <CardHeader className="px-5 py-4 border-b border-border">
          <CardTitle className="text-sm font-semibold">Leads Directory</CardTitle>
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
