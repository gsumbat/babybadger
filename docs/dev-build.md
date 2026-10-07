# iPhone development build

Expo Go can't do background location or push notifications. A development build is BabyBadger's own test app:
it installs on your iPhone like a normal app and loads the code from your Mac, the same way Expo Go does.
You build it once, and again only when native packages change.

## One-time setup (on the Mac, in the project's `app` folder)

```bash
npm install -g eas-cli
eas login                  # the Expo account (jobbadger)
eas init                   # links the project; adds its id to app.json
eas device:create          # registers your iPhone: open the link it shows on the phone
```

## Build

```bash
eas build --profile development --platform ios
```

Sign in with the Apple ID of the Jobbadger LLC developer account when asked, and let EAS create the
certificate, provisioning profile and push key. The build takes about 15–25 minutes; when it's done,
open the link on the iPhone to install it.

## Run

```bash
npx expo start --dev-client
```

Open BabyBadger (not Expo Go) on the iPhone and pick the server from the list, or scan the QR code with the camera.

## Database

Run `supabase/migrations/20261006000005_push.sql` in the Supabase SQL editor once. It turns on `pg_net`
and adds the alert triggers.

## Testing

- Push: sign in as a parent on the iPhone and allow notifications. Clock in or log something as the sitter
  from another phone, the simulator or the web build. The parent's phone gets the alert; tapping it opens the shift.
- Background location: sign in as the sitter, clock in, choose "Allow while using" and then "Change to Always
  Allow" when iOS asks. Lock the phone; the parent's map keeps moving (about every minute or 50 m).

## Invite links (babybadger.app/i/…)

`app.json` has Associated Domains (iOS) and an app-link intent filter (Android) for babybadger.app. They need a new
build (`eas build`), and the site must be live first: see `docs/web-hosting.md`.
