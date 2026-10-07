import { Redirect, useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';

// babybadger://billing/success | cancel | portal: where Stripe sends the browser back (through the billing-return
// Edge Function). Usually the in-app browser catches the link and closes itself; this route handles the link when
// the phone opens the app with it instead (and closes the popup on the web preview).
WebBrowser.maybeCompleteAuthSession();

export default function BillingReturn() {
  const { status } = useLocalSearchParams<{ status: string }>();
  return <Redirect href={status === 'success' ? '/parent/trial-started' : '/parent/subscription'} />;
}
