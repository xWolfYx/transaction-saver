import toast from "react-hot-toast";

interface UndoToastOptions {
	duration?: number;
}

export function showUndoToast(
	message: string,
	onUndo: () => void,
	options?: UndoToastOptions,
): string {
	const duration = options?.duration ?? 8000;
	return toast(
		(t) => {
			const handleUndo = () => {
				onUndo();
				toast.dismiss(t.id);
			};
			return (
				<div className="flex items-center gap-3" role="alert">
					<span className="text-slate-900 text-sm font-medium">{message}</span>
					<button
						type="button"
						onClick={handleUndo}
						className="shrink-0 rounded-md bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
					>
						Undo
					</button>
				</div>
			);
		},
		{
			duration,
			style: {
				padding: "10px 16px",
				boxShadow: "0 4px 24px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.08)",
			},
		},
	);
}
