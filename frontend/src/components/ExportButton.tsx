import type { Checkout } from "@transaction-saver/shared";
import { downloadCSV } from "../lib/utils";
import { Button } from "./ui/Button";

interface ExportButtonProps {
	checkouts: Checkout[];
	filename?: string;
}

export function ExportButton({
	checkouts,
	filename = "checkouts.csv",
}: ExportButtonProps) {
	if (checkouts.length === 0) return null;

	return (
		<Button
			variant="secondary"
			size="sm"
			icon={
				<svg
					className="w-4 h-4"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					strokeWidth={2}
					aria-hidden={true}
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
					/>
				</svg>
			}
			onClick={() => downloadCSV(checkouts, filename)}
		>
			Export CSV
		</Button>
	);
}
