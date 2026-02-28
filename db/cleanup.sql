DELETE FROM job_posts
WHERE datetime(created_at) < datetime('now', '-30 days');

DELETE FROM ad_requests
WHERE datetime(created_at) < datetime('now', '-30 days');
