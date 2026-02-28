import { getAdminEmailAllowlist } from './d1';

export function isAdminRequest(request: Request, locals: unknown): boolean {
	return getAuthorizedAdminIdentity(request, locals) !== null;
}

function normalizeEmail(value: string): string {
	return value.trim().toLowerCase();
}

export function getRequestEmail(request: Request): string | null {
	const headerEmail =
		request.headers.get('cf-access-authenticated-user-email') ||
		request.headers.get('x-auth-request-email');
	if (!headerEmail) return null;
	const normalized = normalizeEmail(headerEmail);
	return normalized.includes('@') ? normalized : null;
}

export function getAuthorizedAdminEmail(request: Request, locals: unknown): string | null {
	const rawAllowlist = getAdminEmailAllowlist(locals as never);
	const allowlist = rawAllowlist
		.split(',')
		.map((value) => normalizeEmail(value))
		.filter(Boolean);
	if (allowlist.length === 0) return null;

	const requestEmail = getRequestEmail(request);
	if (!requestEmail) return null;

	return allowlist.includes(requestEmail) ? requestEmail : null;
}

export interface AdminIdentity {
	email: string;
	source: 'cloudflare-access';
}

export function getAuthorizedAdminIdentity(request: Request, locals: unknown): AdminIdentity | null {
	const ssoEmail = getAuthorizedAdminEmail(request, locals);
	if (ssoEmail) {
		return { email: ssoEmail, source: 'cloudflare-access' };
	}
	return null;
}
