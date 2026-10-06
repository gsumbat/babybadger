-- S1 invite preview: send each kid's birthdate so the app shows ages the same way everywhere ("7 yrs 7 mos").
-- Same function as migration 11, with 'birthdate' added next to the old whole-year 'age'.
create or replace function public.preview_invite(p_code text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare inv invites; res jsonb;
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  inv := open_invite_by_code(p_code);
  if is_parent_of(inv.family_id) then raise exception 'you are a parent in this family'; end if;
  update invites set opened_at = coalesce(opened_at, now()) where id = inv.id;
  select jsonb_build_object(
    'family_id', f.id,
    'family_name', f.name,
    'invited_by', coalesce((select full_name from profiles where id = inv.created_by), ''),
    'rate', inv.rate,
    'pay_schedule', inv.pay_schedule,
    'kids', coalesce((
      select jsonb_agg(jsonb_build_object('name', k.name, 'color', k.color, 'birthdate', k.birthdate,
                                          'age', case when k.birthdate is null then null else date_part('year', age(k.birthdate))::int end)
                       order by k.created_at)
      from kids k where k.family_id = inv.family_id and (inv.kid_ids is null or k.id = any (inv.kid_ids))
    ), '[]'::jsonb)
  ) into res
  from families f where f.id = inv.family_id;
  return res;
end $$;
