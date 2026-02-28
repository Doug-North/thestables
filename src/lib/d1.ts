export interface D1StatementLike {
	bind: (...values: unknown[]) => D1BoundStatementLike;
	all: <T = Record<string, unknown>>() => Promise<{ results: T[] }>;
	first: <T = Record<string, unknown>>() => Promise<T | null>;
	run: () => Promise<unknown>;
}

export interface D1BoundStatementLike {
	all: <T = Record<string, unknown>>() => Promise<{ results: T[] }>;
	first: <T = Record<string, unknown>>() => Promise<T | null>;
	run: () => Promise<unknown>;
}

export interface D1DatabaseLike {
	prepare: (query: string) => D1StatementLike;
}

interface RuntimeEnvLike {
	DB?: D1DatabaseLike;
	ADMIN_EMAIL_ALLOWLIST?: string;
}

interface LocalsLike {
	runtime?: {
		env?: RuntimeEnvLike;
	};
}

export function getDbFromLocals(locals: LocalsLike): D1DatabaseLike | null {
	return locals.runtime?.env?.DB ?? null;
}

export function requireDbFromLocals(locals: LocalsLike): D1DatabaseLike {
	const db = getDbFromLocals(locals);
	if (!db) {
		throw new Error('Cloudflare D1 binding `DB` is missing.');
	}
	return db;
}

export function getAdminEmailAllowlist(locals: LocalsLike): string {
	return locals.runtime?.env?.ADMIN_EMAIL_ALLOWLIST ?? '';
}
