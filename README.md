# BabyBadger

Parent, sitter and (later) kid apps for knowing your kids are safe during a babysitting shift. The sitter's location is shared **only between clock-in and clock-out**, and the database enforces that.

This first build covers the core shift loop:

| Parent | Sitter |
|---|---|
| Create a family, add kids (with foods to avoid) | Join with the parent's 6-digit invite code |
| Invite a sitter (single-use code, 7 days) | Read and sign the family's monitoring notice |
| Book a shift with tasks | Home: next shift, clock-in opens 15 min before |
| Home: live / starting soon / ended / setup states | Clock in: location sharing starts (background in real builds) |
| Live shift: map, tasks, log timeline (realtime) | Tick tasks, log food, nap, activity, diaper, note, photo |
| Shift report: time worked, route, logs, note | Clock out with a note: sharing stops |

Design: wireframes and the Cloud Nursery design system live in the BabyBadger design canvas; colors are in `app/src/theme.ts`.

## Repo layout

```
app/        Expo (SDK 57) + Expo Router + TypeScript
supabase/   SQL migrations (schema, row-level security, RPCs) and an RLS test that runs on plain Postgres
```

## 1. Set up Supabase (about 10 minutes)

1. Create a project at [supabase.com](https://supabase.com). On the create screen: generate a database password and save it; pick the Americas region; keep **Enable Data API** on; turn **Automatically expose new tables** off (the migrations grant access themselves); **Enable automatic RLS** can be on or off (every table turns RLS on itself).
2. **SQL editor** → run the three files in `supabase/migrations/` in order: `…01_core.sql`, `…02_storage.sql`, `…03_grants.sql`.
   (Or with the Supabase CLI: `supabase link` then `supabase db push`.)
3. **Authentication → Providers → Email**: keep Email on. Under **Email templates → Magic link**, make sure the template includes the code: `{{ .Token }}` (the app signs in with a 6-digit code).
4. **Database → Replication**: the migration adds `locations`, `logs`, `shifts` and `shift_tasks` to `supabase_realtime`; check they're listed.
5. Optional: **Database → Cron** → schedule `select public.auto_close_shifts();` every 15 minutes (closes shifts left running 2 h past their end).
6. **Project settings → API**: copy the Project URL and the publishable key.

## 2. Run the app

```bash
cd app
cp .env.example .env.local      # paste the URL and publishable key
npm install
npx expo start                  # scan the QR code with Expo Go
```

Try the loop with two phones (or one phone and the web build with `w`):
1. Phone A: sign in → **I'm a parent** → create family → add a kid → **Invite** → share the code.
2. Phone B: sign in with another email → **I'm a sitter** → enter the code → sign the notice.
3. Phone A: **Book a shift** starting within 15 minutes.
4. Phone B: **Clock in** → log a snack, tick a task, add a photo.
5. Phone A: watch the map and timeline update live → after B clocks out, read the report.

**Expo Go limits:** maps and foreground location work; *background* location (sharing while the phone is locked) needs a development build: `npx eas-cli@latest build --profile development` (or `npx expo run:ios` / `run:android` with Xcode / Android Studio). Until then the sitter app warns her to keep the shift screen open.

## 3. Checks

```bash
cd app && npm run typecheck && npx eslint src && npm test     # app
bash supabase/tests/run.sh                                     # RLS scenarios on a throwaway Postgres 16
```

The RLS test covers: strangers can't see a family; a sitter can't see kids before signing; invite codes are single use; parents can't book a sitter who hasn't signed; no location or logs before clock-in or after clock-out; a sitter can't post a location as someone else or edit her own shift times; another family's parent sees nothing.

## Privacy rules (enforced in the database)

- `locations` and `logs` accept inserts only from the shift's sitter while that shift is `active`.
- Parents read locations and logs only for their own family's shifts.
- A sitter sees a family's kids only after accepting the invite **and** signing the notice; clock-in is refused until she has signed.
- Shift status changes only through `clock_in` / `clock_out` RPCs (clock-in opens 15 minutes before the start).

## Not in this build yet (designed, next up)

Kid app and kid calling, GPS trackers, house rules, marketplace and sitter pool, calendars, Stripe pay and invoices, subscriptions, push notifications, phone-number sign-in. Monitoring-notice text is placeholder (`[LEGAL REVIEW]`).
