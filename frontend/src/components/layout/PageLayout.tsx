import type { ReactNode } from "react";

interface PageLayoutProps {
	children: ReactNode;
}

export function PageLayout({ children }: PageLayoutProps) {
	return (
		<main className="px-2 sm:px-4 py-4">{children}</main>
	);
}
