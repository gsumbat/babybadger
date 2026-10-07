# Hosting babybadger.app (invite links)

Parents send sitters a link: `https://babybadger.app/i/3f9c2a7b1e0d4c6a8b5f2e1d0c9b8a7f6e5d4c3b`. The part after
`/i/` is the invite's own long random token (migration 28), not the 6-digit code, so nobody can find an invite page
by guessing. The 6-digit code still goes at the end of the parent's text ("Or enter code 274139 in the app") and only
works inside the app after signing in. Three things make it work:

1. **The web page** (wireframe S0b). It's the app's own web build, hosted on Vercel. On a phone without the app it
   shows "Jen invited you to sit for Ava and Leo" and the store buttons.
2. **Universal links (iPhone) and app links (Android).** On a phone with BabyBadger installed, tapping the link opens
   the app straight on the invite instead of the web page. The phone checks two small files on the site
   (`/.well-known/apple-app-site-association` and `/.well-known/assetlinks.json`) and settings inside the app
   (`app/app.json`), which only take effect in a new native build.
3. **Database migration 28** (`supabase/migrations/20261006000028_invite_links.sql`): gives every invite its link
   token, and lets the page ask (by token only) what it may show before anyone signs in. It also locks an invite that
   has an email to that email: "This invite was sent to m•••@email.com. Sign in with that email, or ask Jen to resend
   it." 

Nothing here is deployed yet. These are the steps, in order.

## 1. Run migration 28

Supabase → SQL editor → paste `supabase/migrations/20261006000028_invite_links.sql` → Run. Until it's run, the page
has no link: P24 sends the code-only text ("Get the BabyBadger app, choose “I’m a sitter” and enter code 274139"),
and P3's email can't be saved.

## 2. Create the Vercel project

1. vercel.com → **Add New… → Project** → import the GitHub repo `gsumbat/babybadger` (push first so `vercel.json`
   is on GitHub).
2. **Root Directory:** leave it as the repo root (`./`). The repo's `vercel.json` already says:
   - Install: `cd app && npm ci`
   - Build: `cd app && npx expo export -p web`
   - Output: `app/dist`
   - Framework preset: Other (none)
3. **Environment Variables** (Production and Preview), the same values as in `app/.env.local`:
   - `EXPO_PUBLIC_SUPABASE_URL` = `https://odsszoefdgepjdfvpwnn.supabase.co`
   - `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` = the publishable (anon) key
   Both are public keys (they're inside the app anyway). Never add the service-role key.
4. **Deploy.** When it's done, open `https://<project>.vercel.app/i/123456`: you should see "We can’t find this invite"
   (a 6-digit code never opens a page).

What `vercel.json` does besides the build:
- `/` is the marketing site (see "The marketing site" below); `/privacy` and `/terms` are its legal pages.
- `/i/<token>` serves the invite page. Any other path without a file of its own (e.g. `/parent/shift/<id>`) falls
  back to the app's entry page (`/app-shell`), except `/.well-known/…`, `/img/…` and the site's own files.
- The two `/.well-known` files are served as `application/json`, with no redirect (Apple requires both).

## The marketing site (babybadger.app "/")

Plain HTML + CSS in `site/`, copied from wireframes WEB1 (desktop) and WEB2 (mobile). No framework, no JavaScript.

| What | Where |
|---|---|
| Pages (home, privacy, terms) | `site/pages/*.html` |
| Shared header, footer, icons, `<head>` | `site/partials/*.html` |
| Styles, images (AVIF + WebP + PNG), favicons, robots.txt, sitemap.xml | `site/public/` |
| Store links, support email, company name, prices, trial length | `site/site.config.mjs` |
| Build step | `site/build.mjs` |

Vercel's build runs `npx expo export -p web` (the app, into `app/dist`) and then `node ../site/build.mjs dist`, which
renames the app's `dist/index.html` to `dist/app-shell.html`, copies `site/public` into `dist`, and writes the
pages (`dist/index.html` = the marketing page). App routes with their own file (`/sign-in`, `/welcome`, `/parent/…`)
are served as before.

- **Store buttons:** paste the links into `STORE_URLS` in `site/site.config.mjs` (and in `app/src/lib/invite-links.ts`).
  Empty = "Coming soon to the App Store / Google Play", not clickable.
- **"Coming soon" tags** on unbuilt features are plain `<span class="soon">Coming soon</span>` in
  `site/pages/index.html` (and `site/partials/feats.html`); delete them as features ship.
- **Privacy and Terms** are drafts with a "Draft — under legal review" banner at the top; remove the banner
  (`draft-banner`) once a lawyer has signed off.
- Test locally: `cd app && npx expo export -p web && node ../site/build.mjs dist`, then serve `app/dist` with the
  rewrites above.

## 3. Connect the domain babybadger.app

1. Vercel project → **Settings → Domains** → add `babybadger.app`, then add `www.babybadger.app` and choose
   "Redirect to babybadger.app". Keep **babybadger.app (no www) as the main domain**: the link files must load from
   `https://babybadger.app/.well-known/...` without a redirect.
2. Vercel then shows the DNS records to add. At the registrar where you bought babybadger.app (DNS settings for the
   domain), add exactly what Vercel shows; usually:

   | Type  | Host / Name | Value                  |
   |-------|-------------|------------------------|
   | A     | `@`         | `76.76.21.21`          |
   | CNAME | `www`       | `cname.vercel-dns.com` |

   Remove any other A / AAAA / CNAME records for `@` and `www` (parking pages). `.app` domains are HTTPS-only;
   Vercel issues the certificate by itself once DNS points at it (minutes, sometimes up to an hour).

## 4. Supabase: allow the site

Supabase → **Authentication → URL Configuration**:
- **Redirect URLs** → Add URL: `https://babybadger.app` and `https://babybadger.app/**`.
- Leave Site URL as it is (sign-in uses the 6-digit email code, not a link).

## 5. Android fingerprint (assetlinks.json)

`app/public/.well-known/assetlinks.json` has a placeholder (`TODO:REPLACE_WITH_SHA256…`). Get the real one:

```bash
cd app
eas credentials -p android
# choose the "production" build profile → the keystore section shows "SHA256 Fingerprint" (AB:CD:…)
```

Paste it in place of the placeholder (keep the quotes and colons). Once the app is on Google Play with Play App
Signing, also add Google's key: Play Console → the app → **Test and release → App integrity → App signing** → "SHA-256
certificate fingerprint" — the list can hold both:

```json
"sha256_cert_fingerprints": ["AA:BB:…(EAS upload key)", "CC:DD:…(Play app signing key)"]
```

Commit and push; Vercel redeploys.

iPhone needs nothing else: `apple-app-site-association` already names `ZHR7DW76TD.com.jobbadger.babybadger` and the
`/i/*` paths.

## 6. New native build (EAS)

`app/app.json` now has `ios.associatedDomains: ["applinks:babybadger.app"]` and an Android intent filter for
`https://babybadger.app/i/…`. These are native settings: Expo Go and current builds ignore them. Make a new build:

```bash
cd app
eas build --profile development --platform ios     # your test build
# later, for the stores:
eas build --profile production --platform all
```

When EAS asks to update the iOS capabilities (Associated Domains), say yes. If it doesn't, turn on "Associated
Domains" for `com.jobbadger.babybadger` at developer.apple.com → Identifiers, then build again.

## 7. Store buttons

When the apps are live, put the links in `STORE_URLS` in `app/src/lib/invite-links.ts`. Until then the buttons read
"Coming soon to the App Store" / "Coming soon to Google Play".

## Check it

```bash
# Both must be 200, Content-Type application/json, and no "Location:" (no redirect)
curl -I https://babybadger.app/.well-known/apple-app-site-association
curl -I https://babybadger.app/.well-known/assetlinks.json
```

- Apple's copy (it caches for a day or so; may lag after changes):
  `https://app-site-association.cdn-apple.com/a/v1/babybadger.app`
- Google's checker:
  `https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://babybadger.app&relation=delegate_permission/common.handle_all_urls`
- Android phone with the new build: `adb shell pm get-app-links com.jobbadger.babybadger` should say `verified`.
- iPhone with the new build: send yourself a link in Messages and long-press it: "Open in BabyBadger" should be there.
  (Typing the link into Safari's address bar never opens the app; tapping it in Messages, Mail or Notes does.)
- On a computer: open a real invite link (P24 → Copy link) — it shows "Jen invited you to sit for …".

## Test locally

```bash
cd app && npx expo export -p web      # builds app/dist
```

Then serve `app/dist` with any static server and open `/i/<token>` (the page file is `i/[token].html`). In the dev
server (`npx expo start --web`), `/i/<token>?flow=app` shows the phone app's side (S0c → S0d → S1) in the browser.
