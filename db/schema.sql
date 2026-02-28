CREATE TABLE IF NOT EXISTS job_posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  business_name TEXT NOT NULL,
  contact_name TEXT,
  contact_email TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT,
  apply_url TEXT,
  apply_email TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TEXT,
  reviewed_by TEXT
);

CREATE INDEX IF NOT EXISTS idx_job_posts_status_created
  ON job_posts(status, created_at DESC);

CREATE TABLE IF NOT EXISTS ad_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  business_name TEXT NOT NULL,
  contact_name TEXT,
  contact_email TEXT NOT NULL,
  headline TEXT NOT NULL,
  body TEXT NOT NULL,
  target_url TEXT NOT NULL,
  placement TEXT NOT NULL DEFAULT 'jobs_board',
  monthly_budget_gbp INTEGER,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected', 'live')),
  payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK(payment_status IN ('unpaid', 'invoiced', 'paid')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TEXT,
  reviewed_by TEXT,
  starts_on TEXT,
  ends_on TEXT
);

CREATE INDEX IF NOT EXISTS idx_ad_requests_status_payment
  ON ad_requests(status, payment_status, created_at DESC);
