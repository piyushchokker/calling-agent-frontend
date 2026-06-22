'use client';

import React from 'react';
import { LayoutDashboard, Megaphone, Users, PhoneCall, LogOut, UserCircle } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { createClient } from '@/utils/supabase/client';
import { logout } from '@/app/login/actions';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/campaigns', icon: Megaphone, label: 'Campaigns' },
  { href: '/dashboard/leads', icon: Users, label: 'Leads' },
];

export function Sidebar() {
  const pathname = usePathname();
  const [email, setEmail] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      if (data?.user?.email) {
        setEmail(data.user.email);
      }
    };
    fetchUser();
  }, []);

  return (
    <aside className="w-52 bg-sidebar border-r border-sidebar-border flex flex-col h-screen shrink-0">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-sidebar-border">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
            <PhoneCall className="w-4 h-4 text-background" />
          </div>
          <span className="text-base font-bold text-sidebar-foreground tracking-wide group-hover:text-foreground transition-colors">
            Agentic Voice
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-4 px-4 py-3.5 rounded-xl text-[15px] font-medium transition-all duration-200',
                isActive
                  ? 'bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )}
            >
              <Icon className={cn('w-5 h-5 shrink-0', isActive ? 'opacity-100' : 'opacity-70')} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer & Profile */}
      <div className="p-3 border-t border-sidebar-border mt-auto flex flex-col gap-1">
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl hover:bg-sidebar-accent transition-colors duration-200 outline-none">
              <UserCircle className="w-4 h-4 shrink-0 opacity-70" />
              <div className="flex flex-col text-left truncate">
                <span className="text-sm font-medium text-sidebar-foreground">Profile</span>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="start" side="top" sideOffset={8}>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">Account</p>
                <p className="text-xs leading-none text-muted-foreground truncate" title={email || 'Loading...'}>
                  {email || 'Loading...'}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => logout()}
              className="text-red-500 focus:text-red-500 focus:bg-red-500/10 cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
