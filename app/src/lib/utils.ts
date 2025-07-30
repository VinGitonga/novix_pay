export function safeClone<T>(obj: T): T {
	if (obj === null || typeof obj !== "object") {
		return obj;
	}

	if (obj instanceof Date) {
		return new Date(obj.getTime()) as T;
	}

	if (Array.isArray(obj)) {
		return obj.map((item) => safeClone(item)) as T;
	}

	const cloned: Record<string, unknown> = {};
	for (const key in obj as Record<string, unknown>) {
		// Skip __proto__ and other dangerous properties
		if (key === "__proto__" || key === "constructor" || key === "prototype") {
			continue;
		}
		if (Object.prototype.hasOwnProperty.call(obj, key)) {
			cloned[key] = safeClone((obj as Record<string, unknown>)[key]);
		}
	}
	return cloned as T;
}
