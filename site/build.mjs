// Builds the marketing site (babybadger.app "/", /privacy, /terms) into the Expo web export.
//
//   cd app && npx expo export -p web && node ../site/build.mjs dist
//
// 1. The app's own entry page (dist/index.html) becomes dist/app-shell.html. vercel.json sends every app
//    route that has no file of its own (e.g. /parent/shift/<id>) to it, so the app still opens there.
// 2. site/public/* (styles, images, favicons, robots.txt, sitemap.xml) is copied into dist.
// 3. site/pages/*.html are filled from site.config.mjs and the partials, and written to dist
//    (index.html = the marketing home page, privacy.html, terms.html).
// No dependencies: plain Node 18+.
import { createHash } from 'node:crypto';
import { cpSync, existsSync, readFileSync, readdirSync, renameSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import * as config from './site.config.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const dist = resolve(process.cwd(), process.argv[2] ?? join(here, '..', 'app', 'dist'));
const read = (p) => readFileSync(p, 'utf8');

// ---- 1. keep the app's entry page reachable as /app-shell ----
const indexPath = join(dist, 'index.html');
const shellPath = join(dist, 'app-shell.html');
if (!existsSync(indexPath)) throw new Error(`No ${indexPath}: run "npx expo export -p web" first.`);
const isExpoPage = (html) => html.includes('id="root"') || html.includes('/_expo/');
if (isExpoPage(read(indexPath))) renameSync(indexPath, shellPath);
else if (!existsSync(shellPath)) throw new Error('dist/index.html is not the Expo page and there is no app-shell.html');

// ---- 2. static files ----
cpSync(join(here, 'public'), dist, { recursive: true });

// ---- 3. pages ----
const version = createHash('sha1').update(read(join(here, 'public', 'styles.css'))).digest('hex').slice(0, 8);
const partials = Object.fromEntries(
  readdirSync(join(here, 'partials')).map((f) => [f.replace(/\.html$/, ''), read(join(here, 'partials', f)).trimEnd()]),
);

const phoneIcon = '<svg class="ic" aria-hidden="true"><use href="#i-phone"/></svg>';
function storeButton(url, label, soonLabel) {
  return url
    ? `<a class="store" href="${url}">${phoneIcon}${label}</a>`
    : `<span class="store soon-store" role="link" aria-disabled="true">${phoneIcon}${soonLabel}</span>`;
}
const anyStore = config.STORE_URLS.ios || config.STORE_URLS.android;

const tokens = {
  SITE_URL: config.SITE_URL,
  SUPPORT_EMAIL: config.SUPPORT_EMAIL,
  COMPANY: config.COMPANY,
  TRIAL_URL: config.TRIAL_URL,
  SIGN_IN_URL: config.SIGN_IN_URL,
  TRIAL_DAYS: String(config.PRICING.trialDays),
  PRICE_MONTHLY: config.PRICING.monthly,
  PRICE_YEARLY: config.PRICING.yearly,
  PRICE_YEARLY_MONTHLY: config.PRICING.yearlyPerMonth,
  VERSION: version,
  STORE_IOS: storeButton(config.STORE_URLS.ios, 'Download for iPhone', 'Coming soon to the App Store'),
  STORE_ANDROID: storeButton(config.STORE_URLS.android, 'Download for Android', 'Coming soon to Google Play'),
  STORE_HINT: anyStore
    ? ''
    : `<p class="dl-hint">The apps are almost here. Parents can <a href="${config.TRIAL_URL}">start on the web</a> today.</p>`,
};

// {{img name=badger-wave w=84 h=110 class="x" alt="..." eager}} -> <picture> with AVIF, WebP and PNG fallback
function img(args) {
  const attrs = {};
  for (const m of args.matchAll(/(\w+)(?:=("[^"]*"|\S+))?/g)) attrs[m[1]] = m[2] === undefined ? true : m[2].replace(/^"|"$/g, '');
  const { name, w, h } = attrs;
  const alt = typeof attrs.alt === 'string' ? attrs.alt : '';
  const cls = ['pic', attrs.class].filter(Boolean).join(' ');
  const size = String(attrs.class ?? '').trim() ? ` style="width:${w}px;height:${h}px"` : '';
  const loading = attrs.eager ? 'eager" fetchpriority="high' : 'lazy';
  const hidden = alt ? '' : ' aria-hidden="true"';
  return (
    `<picture class="${cls}"${size}${hidden}>` +
    `<source type="image/avif" srcset="/img/${name}.avif">` +
    `<source type="image/webp" srcset="/img/${name}.webp">` +
    `<img src="/img/${name}.png" width="${w}" height="${h}" alt="${alt}" loading="${loading}" decoding="async">` +
    `</picture>`
  );
}

function render(html) {
  for (let i = 0; i < 3; i++) html = html.replace(/\{\{> (\w+)\}\}/g, (_, n) => {
    if (!(n in partials)) throw new Error(`Unknown partial ${n}`);
    return partials[n];
  });
  html = html.replace(/\{\{img ([^}]+)\}\}/g, (_, a) => img(a));
  html = html.replace(/\{\{(\w+)\}\}/g, (_, k) => {
    if (!(k in tokens)) throw new Error(`Unknown token ${k}`);
    return tokens[k];
  });
  return html;
}

for (const f of readdirSync(join(here, 'pages'))) {
  writeFileSync(join(dist, f), render(read(join(here, 'pages', f))));
}
console.log(`site: wrote ${readdirSync(join(here, 'pages')).join(', ')} + public files into ${dist}; app entry -> app-shell.html`);
