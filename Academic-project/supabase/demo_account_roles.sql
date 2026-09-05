-- Optional: assign roles to EXISTING demo Auth accounts created in Supabase.
-- Create the accounts in Authentication > Users first, using the demo credentials
-- in .env.example (or your overrides). This does not create accounts or passwords.
-- Use only in a demonstration database.
begin;
update public.profiles p
set role = demo.role::public.app_role
from auth.users u
join (values
 ('main@gmail.com','admin'),
 ('hod@example.test','hod'),
 ('coordinator@example.test','coordinator'),
 ('lecturer@example.test','faculty')
) as demo(email,role) on lower(u.email)=demo.email
where p.id=u.id;
commit;

select u.email,p.role from public.profiles p join auth.users u on u.id=p.id
where lower(u.email) in ('main@gmail.com','hod@example.test','coordinator@example.test','lecturer@example.test');
-- Link the lecturer's faculty.profile_id to their Auth UUID to show personal data.
