-- Private bucket for shift photos. Path convention: <shift_id>/<uuid>.jpg
insert into storage.buckets (id, name, public) values ('shift-photos', 'shift-photos', false)
on conflict (id) do nothing;

create policy "sitter uploads during active shift" on storage.objects for insert to authenticated
  with check (bucket_id = 'shift-photos' and public.is_my_active_shift(((storage.foldername(name))[1])::uuid));

create policy "family and sitter read shift photos" on storage.objects for select to authenticated
  using (bucket_id = 'shift-photos' and (
    public.is_my_shift(((storage.foldername(name))[1])::uuid)
    or public.is_parent_of(public.shift_family(((storage.foldername(name))[1])::uuid))
  ));
