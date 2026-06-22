import toast, { type ToastPosition } from "react-hot-toast";

const defaultOptions = {
	position: "bottom-right" as ToastPosition,
	duration: 3000,
};

export const showToast = {
	success: (message: string) => toast.success(message, defaultOptions),
	error: (message: string) => toast.error(message, defaultOptions),
	info: (message: string) => toast(message, defaultOptions),
};
