// Everything on babybadger.app that may change lives here. Edit, commit, push: Vercel rebuilds the site.

// TODO: paste the store links when the apps are live (same links as STORE_URLS in app/src/lib/invite-links.ts).
// Empty = the download buttons show "Coming soon" and can't be clicked.
export const STORE_URLS = {
  ios: '', // e.g. https://apps.apple.com/us/app/babybadger/id0000000000
  android: '', // e.g. https://play.google.com/store/apps/details?id=com.jobbadger.babybadger
};

// TODO (George): confirm the support address (same as SUPPORT_EMAIL in app/src/lib/billing-logic.ts).
export const SUPPORT_EMAIL = 'help@babybadger.app';

// Legal name in the footer, Privacy Policy and Terms (the Apple/Google developer account is JobBadger LLC).
export const COMPANY = 'JobBadger LLC';

export const SITE_URL = 'https://babybadger.app';

// Where the site sends people into the web app (Expo export, same domain).
export const TRIAL_URL = '/welcome'; // P1 Welcome: "I'm a parent" starts a new family
export const SIGN_IN_URL = '/sign-in';

// Must match the app (docs/billing.md, app/src/lib/billing-logic.ts).
export const PRICING = {
  trialDays: 30,
  monthly: '$11.99',
  yearly: '$119.88',
  yearlyPerMonth: '$9.99',
};
