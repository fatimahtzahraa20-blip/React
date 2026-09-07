create extension if not exists pg_net with schema extensions;
alter table public.contacts
  add column status text not null default 'queued' check (status in ('queued', 'processing', 'accepted', 'failed')),
  add column email_id text,
  add column last_error text,
  add column duration_ms integer,
  add column attempts integer not null default 0,
  add column first_attempt_at timestamptz,
  add column updated_at timestamptz not null default now(),
  add column accepted_at timestamptz,
  add column claim_token uuid,
  add column email_payload jsonb;
create index contacts_created_at_idx on public.contacts(created_at desc);
revoke all on public.contacts from anon, authenticated;
grant select on public.contacts to authenticated;
grant select, update on public.contacts to service_role;
grant insert (name, email) on public.contacts to authenticated;
create policy "Operators read contacts" on public.contacts for select to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'operator');
create policy "Operators insert contacts" on public.contacts for insert to authenticated
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'operator');

-- Credentials live in Vault instead of readable trigger arguments.
create or replace function public.dispatch_contact_email() returns trigger
language plpgsql security definer set search_path = '' as $$
declare endpoint text; webhook_secret text;
begin
  if new.status <> 'queued' then return new; end if;
  if TG_OP = 'UPDATE' and old.status = 'queued' then return new; end if;
  select decrypted_secret into endpoint from vault.decrypted_secrets where name = 'relay_function_url' limit 1;
  select decrypted_secret into webhook_secret from vault.decrypted_secrets where name = 'relay_webhook_secret' limit 1;
  if endpoint is null or webhook_secret is null then
    raise exception 'Email automation is not configured. Add relay_function_url and relay_webhook_secret in Supabase Vault.';
  end if;
  perform net.http_post(
    url := endpoint,
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-webhook-secret', webhook_secret),
    body := jsonb_build_object('type', TG_OP, 'schema', 'public', 'table', 'contacts', 'record', jsonb_build_object('id', new.id)),
    timeout_milliseconds := 20000
  );
  return new;
end;
$$;
revoke all on function public.dispatch_contact_email() from public, anon, authenticated;
create trigger relay_contact_insert after insert on public.contacts
  for each row execute function public.dispatch_contact_email();
create trigger relay_contact_retry after update of status on public.contacts
  for each row when (new.status = 'queued' and old.status <> 'queued')
  execute function public.dispatch_contact_email();

-- Atomic claim and frozen payload prevent parallel sends and keep retries idempotent.
create or replace function public.claim_contact_email(contact_id uuid, token uuid, sender text)
returns setof public.contacts language sql security definer set search_path = '' as $$
  update public.contacts set
    status = 'processing', claim_token = token, attempts = attempts + 1,
    first_attempt_at = coalesce(first_attempt_at, now()), updated_at = now(), last_error = null,
    email_payload = coalesce(email_payload, jsonb_build_object(
      'from', sender, 'to', jsonb_build_array(email), 'subject', 'Welcome aboard!',
      'text', 'Hi ' || name || E',\n\nWelcome to Acme! We''re glad you''re here.\n\nThe Acme team'))
  where id = contact_id and status = 'queued'
    and (first_attempt_at is null or first_attempt_at > now() - interval '23 hours')
  returning *;
$$;
revoke all on function public.claim_contact_email(uuid, uuid, text) from public, anon, authenticated;
grant execute on function public.claim_contact_email(uuid, uuid, text) to service_role;

create or replace function public.retry_contact_email(contact_id uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare contact public.contacts;
begin
  if coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') <> 'operator' then
    raise exception 'Only operators may retry email';
  end if;
  select * into contact from public.contacts where id = contact_id for update;
  if not found then raise exception 'Contact not found'; end if;
  if contact.status = 'accepted' then raise exception 'Email already accepted by provider'; end if;
  if contact.updated_at > now() - interval '1 minute' then raise exception 'Wait one minute before retrying'; end if;
  if contact.first_attempt_at <= now() - interval '23 hours' then
    raise exception 'Retry window expired. Check Resend delivery history before manually sending again.';
  end if;
  update public.contacts set status = 'failed' where id = contact_id;
  update public.contacts set status = 'queued', claim_token = null, last_error = null,
    updated_at = now(), duration_ms = null where id = contact_id;
end;
$$;
revoke all on function public.retry_contact_email(uuid) from public, anon;
grant execute on function public.retry_contact_email(uuid) to authenticated;
