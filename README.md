# Red Bank Breakers U8 Team

Tools and services for managing the Red Bank Breakers soccer team. Today this is a single utility, but the project is architected to grow to include more services for automating aspects of team management for the Breakers.

## Calendar Discrepancy Checker

The team plays in the [MOSA](https://mosa.gotsportsites.com) league, which uses [GotSport](https://gotsport.com) for scheduling. GotSport does not reliably notify coaches when games are rescheduled — the league admin may click "Save" instead of "Save and Send a Message," or the change may go through a "Game Change Request" flow that only produces an in-app notification, never an email. This is a [well-documented problem](https://apps.apple.com/us/app/gotsport-team/id1515498498) across leagues that use the platform.

The team also uses [TeamSnap](https://www.teamsnap.com) for day-to-day coordination. Both platforms publish iCal feeds for the schedule, and those feeds should agree. `compare-feeds.ts` fetches both and reports any future games where the start times differ — surfacing silent GotSport reschedules before the team shows up at the wrong time.

Run locally:

```sh
just run
```

Deployed as a CloudFlare Worker, it runs every morning at 08:25 ET and pushes a notification to [ntfy.sh](https://ntfy.sh) when a future-game discrepancy is found.

## Forking for your own team

### Dependencies

- [Bun](https://bun.sh), [just](https://github.com/casey/just), and a CloudFlare account
- Run `bun install` from the repo root to pull in `ical.js` and `wrangler`

### TeamSnap feed URL

- In the TeamSnap web app, open your team's **Schedule** page and copy the link from the **Export Calendar (iCal)** button
- Paste it into `.env` as `TEAM_SNAP_ICAL_FEED`

### GotSport feed URL

- Install the **GotSport Team** mobile app, open your team, and tap **Calendar → Subscribe / Export** to copy the iCal URL
- Paste it into `.env` as `GOT_SPORT_ICAL_FEED`

### Local environment

- Create a `.env` file at the repo root with the two feed URLs above (already in `.gitignore`)
- Run `just run` to confirm the CLI works against your feeds

### CloudFlare authentication

- Run `bunx wrangler login` to authenticate via browser OAuth (one-time, signs up if needed)
- Edit the `name` in `wrangler.toml` to something unique like `<your-team>-schedule-checker`

### ntfy.sh setup

- Pick a long, hard-to-guess channel name (anyone with the name can read it) and add `NTFY_CHANNEL=<your-channel>` to `.env`
- Install the [ntfy mobile app](https://ntfy.sh/) or open the web app and subscribe to your channel to receive alerts

### Deploy

- Run `just set-secrets` once to upload the two feed URLs and your channel name to CloudFlare
- Run `just deploy` to publish the Worker; it will start firing daily on its own
