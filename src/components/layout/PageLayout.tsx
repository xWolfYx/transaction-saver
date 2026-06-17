import type { ReactNode } from "react";

interface PageLayoutProps {
	children: ReactNode;
}

export function PageLayout({ children }: PageLayoutProps) {
	return (
		<main className="mx-auto px-4 sm:px-6 py-8 max-w-6xl">{children}</main>
	);
}
