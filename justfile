# Verify project health: lint, format check, and tests
check: lint test

# Run the discrepancy check locally (reads .env via Bun)
run:
    bun run compare-feeds.ts

# Run locally and send ntfy.sh notification on discrepancies (reads NTFY_CHANNEL from .env)
run-notify:
    bun run compare-feeds.ts

# Run unit tests
test:
    bun test

# Check formatting and lint
lint:
    bunx biome check

# Apply formatting and safe lint fixes
format:
    bunx biome check --write

# Deploy the Worker to CloudFlare
deploy:
    bunx wrangler deploy

# One-time: set Worker secrets in CF (prompts for value)
set-secrets:
    bunx wrangler secret put TEAM_SNAP_ICAL_FEED
    bunx wrangler secret put GOT_SPORT_ICAL_FEED
    bunx wrangler secret put NTFY_CHANNEL
