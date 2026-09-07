-- Run ONCE in Supabase SQL editor AFTER applying migrations.
-- Replace placeholders locally. Never commit real secrets.
-- Use the same secret as the function WEBHOOK_SECRET.
select vault.create_secret(
  'https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-insert-email',
  'relay_function_url'
);
select vault.create_secret('YOUR_LONG_RANDOM_SECRET', 'relay_webhook_secret');
-- Create a user in Authentication > Users first, then grant access.
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"operator"}'::jsonb
where email = 'YOUR_OPERATOR_EMAIL';
-- Sign out and back in after changing the role.
