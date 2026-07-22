'use client';

import React, { useState, useTransition, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from '../../components/layout/sidebar';
import Header from '../../components/layout/header';
import { Spinner } from '../../components/ui/spinner';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    setIsLoading(false);
  }, [pathname]);

  const navigate = (href: string) => {
    if (href !== pathname) {
      setIsLoading(true);
      startTransition(() => {
        router.push(href);
      });
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar
        onNavigate={navigate}
        currentPath={pathname}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <div
        className="flex-1 flex flex-col transition-all duration-300 ease-in-out overflow-hidden"
        style={{ marginLeft: sidebarCollapsed ? 72 : 256 }}
      >
        <Header collapsed={sidebarCollapsed} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto relative">
          {(isLoading || isPending) && (
            <div className="sticky top-0 left-0 w-full h-full bg-white/70 backdrop-blur-sm flex items-center justify-center z-50">
              <Spinner size="lg" />
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
