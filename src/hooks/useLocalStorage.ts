import { useState, useEffect, useCallback } from 'react';
import { showToast } from '../lib/toast';

const STORAGE_PREFIX = 'checkout-logger-';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
	const storageKey = STORAGE_PREFIX + key;

	const [value, setValue] = useState<T>(() => {
		try {
			const stored = localStorage.getItem(storageKey);
			if (stored === null) return initialValue;
			return JSON.parse(stored) as T;
		} catch {
			showToast.error('Failed to load data from local storage');
			return initialValue;
		}
	});

	const setStoredValue = useCallback(
		(newValue: T | ((prev: T) => T)) => {
			try {
				setValue((prev) => {
					const resolved = newValue instanceof Function ? newValue(prev) : newValue;
					localStorage.setItem(storageKey, JSON.stringify(resolved));
					return resolved;
				});
			} catch {
				showToast.error('Failed to save data to local storage');
			}
		},
		[storageKey],
	);

	useEffect(() => {
		try {
			localStorage.setItem(storageKey, JSON.stringify(value));
		} catch {
			showToast.error('Storage is full — unable to save latest data');
		}
	}, [storageKey, value]);

	return [value, setStoredValue];
}
