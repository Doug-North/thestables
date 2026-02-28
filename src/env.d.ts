/// <reference path="../.astro/types.d.ts" />

import type { D1DatabaseLike } from './lib/d1';

declare namespace App {
	interface Locals {
		runtime?: {
			env?: {
				DB?: D1DatabaseLike;
				ADMIN_EMAIL_ALLOWLIST?: string;
			};
		};
	}
}
