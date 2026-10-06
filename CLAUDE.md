# BabyBadger: notes for Claude

BabyBadger is a parent + sitter app (and later a kid app) for George, a UX manager in Tampa. Parents see the
sitter's location, tasks and logs only while the sitter is clocked in. George designed every screen first; the
code copies those designs.

## The rule that matters most: wireframes are the spec

- Every app screen copies one wireframe. `docs/screens.md` maps each route to its wireframe ID (P = parent,
  S = sitter, K = kid) and lists what is left out on purpose.
- Start a screen from its generated layout in `app/src/wireframes/<ID>.tsx` (made from the wireframe HTML by
  `tools/wf2rn/convert.py`), then wire real data in. Keep sizes, spacing, colors, fonts, copy and icons.
- Never invent UI. If a wireframe shows a feature that isn't built, leave it out and add it to
  `docs/screens.md`. If a screen needs something no wireframe covers, ask George to add it to the design canvas first.
- Icons come from the wireframes (`app/src/components/wfIcons.ts`), not a generic icon set.
- Baloo 2 titles: don't give a single-line Baloo title a `lineHeight` smaller than its natural height (it shifts
  on iOS); use the equal negative `marginVertical` the converter writes. Wrapped titles keep their lineHeight.
- Dates are US format (MM/DD/YYYY). Copy is plain and short.
- Times are always picked with the phone's time wheel (hour, minute, AM/PM), never typed: use `TimeField` from
  `app/src/components/TimeField.tsx` (the wireframes' dropdown box), or wrap a custom box in `TimeWheel` when the
  wireframe draws the time differently (S45). Never a plain TextInput for a time.
- Dropdowns use `SelectField` from `app/src/components/SelectField.tsx` (the wireframes' select box).
- Text and TextInput come from `@/components/Text` (caps iOS text scaling so sizes match the wireframes).
- Every UI change goes into both the app and the canvas wireframe, in the same step.

## Where the designs live

- Design canvas (HTML wireframes, ~160 app screens): https://claude.ai/artifact/PANVcTEaKBGCxCqCPGeda5
- Harbor design system: https://claude.ai/artifact/437LNxZXqwzqLb2TJYukGQ
- FigJam board (flows and wireframe images): fileKey `7yFfuIvjZAxgkRTn0sDaZK`
- Build plan (phases, integrations, checklist): https://claude.ai/code/artifact/de6d3c48-b2c6-49c9-aff2-066087ae9f61
- To regenerate layouts you need the wireframe `.dc.html` files from the canvas; `tools/wf2rn/build_all.sh <dir> ID-Name ...`.

## Stack

- `app/`: Expo SDK 57, Expo Router (`src/app`), TypeScript, React Native 0.86. Supabase JS client.
  expo-location + expo-task-manager for background location (needs a development build, not Expo Go).
  react-native-keyboard-controller for forms. react-native-svg for icons.
- `supabase/`: SQL migrations (run in order in the Supabase SQL editor) and an RLS test on plain Postgres.
  Privacy rules live in the database: location and logs only from the shift's sitter while the shift is active;
  parents read only their family; sitters see kids only after accepting the invite and signing the notice.
- Supabase project: `https://odsszoefdgepjdfvpwnn.supabase.co` (keys in `app/.env.local`, never committed).
  Email sign-in with a 6-digit code. Built-in email is rate limited; custom SMTP (Resend) is planned.

## Commands

```bash
cd app
npx expo start            # Expo Go on George's iPhone
npm run typecheck && npx eslint src && npm test
bash ../supabase/tests/run.sh   # RLS scenarios (needs Postgres 16 locally)
```

Run typecheck, lint and tests before every commit. Commit to `main` on github.com/gsumbat/babybadger.

## Status (Oct 6, 2026)

- Core shift loop works: family, kids, invite code, consent, booking, clock in/out, live map, tasks, logs, report.
- All 25 built screens are ported from their wireframes (list in docs/screens.md).
- Push alerts to parents (clock-in, clock-out, each log; P12 "Food and tasks" switch): migration 05 sends them
  through pg_net and Expo's push service. Setup: `docs/dev-build.md`.
- Next: George's first iOS development build (EAS, Jobbadger LLC Apple account, bundle id
  `com.jobbadger.babybadger`); then the rest of phase 1 (house rules, messages, places, phone sign-in).

## Working with George

He's a designer, not a developer: explain steps in plain words, give exact commands, and show screens side by
side with their wireframes when you change UI. He tests on his iPhone in Expo Go.
