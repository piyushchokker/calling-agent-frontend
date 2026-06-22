'use client';

import React from 'react';
import { User, Bell, Shield, Key } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

export default function SettingsPage() {
  const { selectedCompanyId, companies } = useAppStore();
  const currentCompany = companies.find(c => c.id === selectedCompanyId);

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage your account and workspace preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Navigation Sidebar for Settings */}
        <div className="md:col-span-1 flex flex-col gap-1">
          <Button variant="secondary" className="w-full justify-start gap-3 px-3 shadow-none text-foreground font-medium h-9">
            <User className="w-4 h-4 text-foreground/70" />
            Workspace
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 px-3 text-muted-foreground hover:text-foreground h-9">
            <Shield className="w-4 h-4" />
            Security
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 px-3 text-muted-foreground hover:text-foreground h-9">
            <Bell className="w-4 h-4" />
            Notifications
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 px-3 text-muted-foreground hover:text-foreground h-9">
            <Key className="w-4 h-4" />
            API Keys
          </Button>
        </div>

        {/* Settings Content Area */}
        <div className="md:col-span-3 space-y-6">
          <Card className="border border-border shadow-none">
            <CardHeader className="px-5 pt-5 pb-4 border-b border-border">
              <CardTitle className="text-base">Workspace Information</CardTitle>
              <CardDescription className="text-sm">
                View the details for the currently selected tenant.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-5 pt-5 pb-5 space-y-5">
              <div className="space-y-1.5">
                <Label className="text-muted-foreground">Current Tenant Name</Label>
                <Input 
                  readOnly 
                  value={currentCompany ? currentCompany.name : 'No tenant selected'} 
                  className="bg-muted/30 focus-visible:ring-0 cursor-default"
                />
              </div>
              
              <div className="space-y-1.5">
                <Label className="text-muted-foreground">Tenant ID</Label>
                <Input 
                  readOnly 
                  value={selectedCompanyId || 'None'} 
                  className="bg-muted/30 focus-visible:ring-0 cursor-default font-mono text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-muted-foreground">AI Agent Instructions</Label>
                <Textarea 
                  readOnly
                  value={currentCompany?.prompt_instructions || 'No special instructions provided for this tenant.'}
                  className="bg-muted/30 focus-visible:ring-0 cursor-default min-h-[120px] resize-none text-sm"
                />
              </div>
              
              <div className="pt-2 flex justify-end">
                <Button disabled className="px-6 font-medium">
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border shadow-none">
            <CardHeader className="px-5 pt-5 pb-3">
              <CardTitle className="text-base text-destructive">Security Notice</CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your application uses environment variable API keys for backend communication. API keys are managed via the <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-xs text-foreground">.env.local</code> file. Do not share your Tenant API key with anyone.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
