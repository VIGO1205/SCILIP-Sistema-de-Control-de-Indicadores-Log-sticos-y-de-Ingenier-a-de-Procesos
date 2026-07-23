'use client';

import React, { useState, useTransition, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from '../../components/layout/sidebar';
import Header from '../../components/layout/header';
import { Spinner } from '../../components/ui/spinner';

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia(query);
    setMatches(mql.matches);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [query]);
  return matches;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setIsLoading(false);
  }, [pathname]);

  const navigate = (href: string) => {
    if (href !== pathname) {
      setIsLoading(true);
      setSidebarOpen(false);
      startTransition(() => {
        router.push(href);
      });
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden transition-colors">
      <Sidebar
        onNavigate={navigate}
        currentPath={pathname}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        open={sidebarOpen}
        onToggleOpen={() => setSidebarOpen(!sidebarOpen)}
        onClose={() => setSidebarOpen(false)}
        isDesktop={isDesktop}
      />
      <div
        className="flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out"
        style={{ marginLeft: isDesktop ? (sidebarCollapsed ? 72 : 256) : 0 }}
      >
        <Header
          collapsed={sidebarCollapsed}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto relative">
          {(isLoading || isPending) && (
            <div className="sticky top-0 left-0 w-full h-full bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm flex items-center justify-center z-50">
              <Spinner size="lg" />
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
