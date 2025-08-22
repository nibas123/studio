
'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarTrigger,
  SidebarContent,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { Timer, History, LayoutDashboard } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';

const navItems = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/summary', label: 'Summary', icon: Timer },
    { href: '/history', label: 'History', icon: History },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-primary text-primary-foreground rounded-lg p-1.5">
                <Timer className="size-5" />
              </div>
              <h1 className="text-lg font-semibold text-primary">TimeFlow</h1>
            </div>
            <SidebarTrigger className="text-primary" />
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
                 <SidebarMenuItem key={item.href}>
                    <Link href={item.href}>
                        <SidebarMenuButton tooltip={item.label} isActive={pathname === item.href}>
                            <item.icon />
                            <span>{item.label}</span>
                        </SidebarMenuButton>
                    </Link>
                 </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
