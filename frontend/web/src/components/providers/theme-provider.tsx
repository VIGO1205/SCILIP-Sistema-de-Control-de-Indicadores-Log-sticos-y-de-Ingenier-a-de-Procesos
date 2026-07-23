'use client';

import React, { useEffect, useState } from 'react';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const html = document.documentElement;

    html.classList.remove('dark');
    html.classList.add('light');
    html.setAttribute('data-tremor-theme', 'light');

    setMounted(true);
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

  return <>{children}</>;
}
