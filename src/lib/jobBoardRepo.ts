import type { D1DatabaseLike } from './d1';

export interface JobPost {
	id: number;
	business_name: string;
	contact_name: string | null;
	contact_email: string;
	title: string;
	description: string;
	location: string | null;
	apply_url: string | null;
	apply_email: string | null;
	status: 'pending' | 'approved' | 'rejected';
	created_at: string;
}

export interface AdRequest {
	id: number;
	business_name: string;
	contact_name: string | null;
	contact_email: string;
	headline: string;
	body: string;
	target_url: string;
	placement: string;
	monthly_budget_gbp: number | null;
	status: 'pending' | 'approved' | 'rejected' | 'live';
	payment_status: 'unpaid' | 'invoiced' | 'paid';
	created_at: string;
}

export async function listApprovedJobs(db: D1DatabaseLike): Promise<JobPost[]> {
	const result = await db
		.prepare(
			`SELECT id, business_name, contact_name, contact_email, title, description, location, apply_url, apply_email, status, created_at
       FROM job_posts
       WHERE status = 'approved'
       ORDER BY created_at DESC`
		)
		.all<JobPost>();
	return result.results;
}

export async function listPendingJobs(db: D1DatabaseLike): Promise<JobPost[]> {
	const result = await db
		.prepare(
			`SELECT id, business_name, contact_name, contact_email, title, description, location, apply_url, apply_email, status, created_at
       FROM job_posts
       WHERE status = 'pending'
       ORDER BY created_at ASC`
		)
		.all<JobPost>();
	return result.results;
}

export async function createJobPost(
	db: D1DatabaseLike,
	input: {
		businessName: string;
		contactName?: string;
		contactEmail: string;
		title: string;
		description: string;
		location?: string;
		applyUrl?: string;
		applyEmail?: string;
	}
): Promise<void> {
	await db
		.prepare(
			`INSERT INTO job_posts (business_name, contact_name, contact_email, title, description, location, apply_url, apply_email)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
		)
		.bind(
			input.businessName,
			input.contactName || null,
			input.contactEmail,
			input.title,
			input.description,
			input.location || null,
			input.applyUrl || null,
			input.applyEmail || null
		)
		.run();
}

export async function reviewJobPost(
	db: D1DatabaseLike,
	id: number,
	status: 'approved' | 'rejected',
	reviewedBy: string
): Promise<void> {
	await db
		.prepare(
			`UPDATE job_posts
       SET status = ?, reviewed_at = CURRENT_TIMESTAMP, reviewed_by = ?
       WHERE id = ?`
		)
		.bind(status, reviewedBy, id)
		.run();
}

export async function listLiveAds(db: D1DatabaseLike): Promise<AdRequest[]> {
	const result = await db
		.prepare(
			`SELECT id, business_name, contact_name, contact_email, headline, body, target_url, placement, monthly_budget_gbp, status, payment_status, created_at
       FROM ad_requests
       WHERE status = 'live' AND payment_status = 'paid'
       ORDER BY created_at DESC`
		)
		.all<AdRequest>();
	return result.results;
}

export async function listPendingAds(db: D1DatabaseLike): Promise<AdRequest[]> {
	const result = await db
		.prepare(
			`SELECT id, business_name, contact_name, contact_email, headline, body, target_url, placement, monthly_budget_gbp, status, payment_status, created_at
       FROM ad_requests
       WHERE status IN ('pending', 'approved')
       ORDER BY created_at ASC`
		)
		.all<AdRequest>();
	return result.results;
}

export async function createAdRequest(
	db: D1DatabaseLike,
	input: {
		businessName: string;
		contactName?: string;
		contactEmail: string;
		headline: string;
		body: string;
		targetUrl: string;
		placement?: string;
		monthlyBudgetGbp?: number;
	}
): Promise<void> {
	await db
		.prepare(
			`INSERT INTO ad_requests (business_name, contact_name, contact_email, headline, body, target_url, placement, monthly_budget_gbp)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
		)
		.bind(
			input.businessName,
			input.contactName || null,
			input.contactEmail,
			input.headline,
			input.body,
			input.targetUrl,
			input.placement || 'jobs_board',
			input.monthlyBudgetGbp ?? null
		)
		.run();
}

export async function reviewAdRequest(
	db: D1DatabaseLike,
	id: number,
	action: 'approve' | 'reject' | 'mark-paid-live',
	reviewedBy: string
): Promise<void> {
	if (action === 'approve') {
		await db
			.prepare(
				`UPDATE ad_requests
         SET status = 'approved', reviewed_at = CURRENT_TIMESTAMP, reviewed_by = ?
         WHERE id = ?`
			)
			.bind(reviewedBy, id)
			.run();
		return;
	}

	if (action === 'mark-paid-live') {
		await db
			.prepare(
				`UPDATE ad_requests
         SET status = 'live', payment_status = 'paid', starts_on = DATE('now'), reviewed_at = CURRENT_TIMESTAMP, reviewed_by = ?
         WHERE id = ?`
			)
			.bind(reviewedBy, id)
			.run();
		return;
	}

	await db
		.prepare(
			`UPDATE ad_requests
       SET status = 'rejected', reviewed_at = CURRENT_TIMESTAMP, reviewed_by = ?
       WHERE id = ?`
		)
		.bind(reviewedBy, id)
		.run();
}
