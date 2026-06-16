import type { ReactNode } from 'react';

interface PageLayoutProps {
  children: ReactNode;
}

export function PageLayout({ children }: PageLayoutProps) {
  return <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>;
}
