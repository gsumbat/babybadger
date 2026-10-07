// Sign-in codes (P0b, S0c). Today the 6-digit code goes by email; when phone sign-in arrives (Twilio in Supabase
// Auth), add a 'phone' contact here and the screens keep working: they only pass a Contact around.
import { supabase } from './supabase';

export type Contact = { kind: 'email'; value: string };

export const CODE_LENGTH = 6;
export const RESEND_SECONDS = 60;

export function emailContact(value: string): Contact {
  return { kind: 'email', value: value.trim() };
}

/** Sends a 6-digit code; creates the account the first time. */
export async function sendSignInCode(c: Contact) {
  const { error } = await supabase.auth.signInWithOtp({ email: c.value, options: { shouldCreateUser: true } });
  if (error) throw error;
}

/** Checks the code. A good code signs in (the session listener takes it from there). */
export async function verifySignInCode(c: Contact, code: string) {
  const { error } = await supabase.auth.verifyOtp({ email: c.value, token: code, type: 'email' });
  if (error) throw error;
}
