-- Run after populate_dashboards.sql in SQL Editor.
-- These emails must match the HOD, Coordinator and Lecturer sign-in shortcuts.
-- Repairs demo-account roles and links only the development dataset's instructor/assignments.
begin;
do $$
declare missing text; admin_id uuid; lecturer_id uuid; instructor_id uuid;
 seeded_instructor uuid:=md5('academic-populated-instructor-1')::uuid;
 previous_claims text:=current_setting('request.jwt.claims',true);
 previous_sub text:=current_setting('request.jwt.claim.sub',true);
 row_data record;
begin
 select string_agg(expected.email,', ') into missing
 from (values ('hod@example.test'),('coordinator@example.test'),('lecturer@example.test')) expected(email)
 where not exists(select 1 from auth.users u where lower(u.email)=expected.email);
 if missing is not null then raise exception 'Create these Auth accounts first (or edit the email mapping in this script): %',missing; end if;
 if not exists(select 1 from public.course_offerings where id=md5('academic-populated-offering-1')::uuid) then raise exception 'Run populate_dashboards.sql first to load the academic records'; end if;

 insert into public.profiles(id,full_name,initials,role)
 select u.id,accounts.full_name,accounts.initials,accounts.role::public.app_role
 from auth.users u join (values
 ('hod@example.test','Dr. Bilal Hassan','BH','hod'),
 ('coordinator@example.test','Sana Malik','SM','coordinator'),
 ('lecturer@example.test','Dr. Ayesha Khan','AK','faculty')
 ) accounts(email,full_name,initials,role) on lower(u.email)=accounts.email
 on conflict(id) do update set role=excluded.role;

 select id into admin_id from public.profiles where role::text='admin' order by created_at limit 1;
 if admin_id is null then raise exception 'An administrator profile is required'; end if;
 perform set_config('request.jwt.claims',jsonb_build_object('sub',admin_id,'role','authenticated')::text,true);
 perform set_config('request.jwt.claim.sub',admin_id::text,true);
 select id into lecturer_id from auth.users where lower(email)='lecturer@example.test';
 select id into instructor_id from public.faculty where profile_id=lecturer_id;
 if instructor_id is null then
  if not exists(select 1 from public.faculty where id=seeded_instructor) then raise exception 'No instructor is linked to this lecturer. Link the intended faculty.profile_id to the lecturer Auth ID first.'; end if;
  if exists(select 1 from public.faculty where id=seeded_instructor and profile_id is not null and profile_id<>lecturer_id) then raise exception 'The seeded instructor is already linked to another account; no ownership was changed'; end if;
  update public.faculty set profile_id=lecturer_id where id=seeded_instructor;
  instructor_id:=seeded_instructor;
 end if;
 -- If the lecturer already had a different instructor record, move only the
 -- fictional assignments that still belong to the original seeded instructor.
 if instructor_id<>seeded_instructor then
  for row_data in select o.id from public.course_offerings o join public.allocations a on a.course_offering_id=o.id
   where o.id in (md5('academic-populated-offering-1')::uuid,md5('academic-populated-offering-5')::uuid,md5('academic-populated-offering-9')::uuid)
   and a.faculty_id=seeded_instructor and not o.locked
  loop perform public.allocate_course(row_data.id,instructor_id); end loop;
  update public.theses set supervisor_id=instructor_id
  where id=md5('academic-populated-thesis-1')::uuid and supervisor_id=seeded_instructor;
 end if;
 -- Give this account a postgraduate teaching group as well, if still unassigned.
 if exists(select 1 from public.course_offerings o where o.id=md5('academic-populated-offering-10')::uuid and not o.locked
 and not exists(select 1 from public.allocations a where a.course_offering_id=o.id)) then
  perform public.allocate_course(md5('academic-populated-offering-10')::uuid,instructor_id);
 end if;
 perform set_config('request.jwt.claims',coalesce(previous_claims,''),true);
 perform set_config('request.jwt.claim.sub',coalesce(previous_sub,''),true);
end $$;
commit;

-- Check the repaired accounts and the lecturer's linked teaching assignments.
select u.email,p.role,f.full_name as linked_instructor,
 (select count(*) from public.allocations a where a.faculty_id=f.id) as instructor_course_count,
 (select count(*) from public.theses t where t.supervisor_id=f.id) as supervised_thesis_count
from auth.users u join public.profiles p on p.id=u.id
left join public.faculty f on f.profile_id=p.id
where lower(u.email) in ('hod@example.test','coordinator@example.test','lecturer@example.test');
-- HOD/Coordinator access department data by role; they do not require instructor links.
