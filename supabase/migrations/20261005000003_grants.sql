-- Explicit Data API access, so the project works with "Automatically expose new tables" turned OFF
-- (Supabase's recommended setting). Only signed-in users get table access; row-level security
-- still decides which rows they see. Signed-out visitors (anon) get nothing.

grant usage on schema public to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;
grant execute on all functions in schema public to authenticated;

revoke all on all tables in schema public from anon;
revoke execute on all functions in schema public from anon, public;
-- Helpers used inside RLS policies must stay callable by signed-in users.
grant execute on all functions in schema public to authenticated;

-- Server-side jobs (service role key) keep full access; it already bypasses RLS.
grant usage on schema public to service_role;
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;
grant execute on all functions in schema public to service_role;
