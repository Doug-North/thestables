export default {
	async scheduled(_event, env) {
		await env.DB.prepare("DELETE FROM job_posts WHERE datetime(created_at) < datetime('now', '-30 days')").run();
		await env.DB.prepare("DELETE FROM ad_requests WHERE datetime(created_at) < datetime('now', '-30 days')").run();
	}
};
