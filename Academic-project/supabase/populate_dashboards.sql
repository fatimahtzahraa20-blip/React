-- Fictional development dataset. Apply last, after faculty_crud.sql.
-- No accounts/passwords are created. Existing records are not overwritten.
begin;
create table if not exists public.batches (
 id uuid primary key default gen_random_uuid(),
 code text unique not null,
 programme_id uuid not null references public.programmes(id),
 intake_year integer not null,
 semester integer not null check(semester between 1 and 12)
);
alter table public.students add column if not exists batch_id uuid references public.batches(id);
alter table public.course_offerings add column if not exists batch_id uuid references public.batches(id);
alter table public.batches enable row level security;
drop policy if exists batch_read on public.batches;
create policy batch_read on public.batches for select to authenticated using(
 public.current_app_role() in ('admin','hod','coordinator') or exists(
 select 1 from public.course_offerings o join public.allocations a on a.course_offering_id=o.id
 where o.batch_id=batches.id and a.faculty_id in (select public.my_faculty_ids()))
);
drop policy if exists teaching_student_read on public.students;
create policy teaching_student_read on public.students for select to authenticated using(
 exists(select 1 from public.course_offerings o join public.allocations a on a.course_offering_id=o.id
 where o.batch_id=students.batch_id and a.faculty_id in (select public.my_faculty_ids()))
);
grant select on public.batches to authenticated;

-- Use a trusted existing administrator as the actor for allocation audit triggers.
do $$
declare actor uuid; lecturer uuid; instructor uuid; programme uuid; batch uuid; course uuid; offering uuid; student uuid;
 session_uuid uuid:=md5('academic-populated-session-fa26')::uuid; i integer; j integer; fids uuid[]:='{}';
 names text[]:=array['Dr. Ayesha Khan','Ahmed Ali','Dr. Sana Malik','Dr. Bilal Hassan'];
 students_names text[]:=array['Areeba Shah','Hamza Khan','Maham Ali','Bilal Ahmed','Zainab Malik','Umar Hassan','Fatima Noor','Saad Raza','Sara Ahmed','Hassan Raza','Aiman Tariq','Ali Raza'];
 titles text[]:=array['Programming Fundamentals','Data Structures','Database Systems','Software Engineering','Computer Networks','Artificial Intelligence','Web Engineering','Operating Systems','Information Security','Research Methods','Machine Learning','Advanced Algorithms'];
 previous_claims text:=current_setting('request.jwt.claims',true);
 previous_sub text:=current_setting('request.jwt.claim.sub',true);
begin
 select id into actor from public.profiles where role::text='admin' order by created_at limit 1;
 if actor is null then raise exception 'Create and assign an administrator account before loading academic records'; end if;
 perform set_config('request.jwt.claims',jsonb_build_object('sub',actor,'role','authenticated')::text,true);
 perform set_config('request.jwt.claim.sub',actor::text,true);
 select p.id into lecturer from public.profiles p join auth.users u on u.id=p.id where lower(u.email)='lecturer@example.test' and p.role::text='faculty';
 insert into public.academic_sessions(id,code,title) values(session_uuid,'AC26','Academic Year 2026 - Fall') on conflict(id) do nothing;
 for i in 1..4 loop
  instructor:=md5('academic-populated-instructor-'||i)::uuid;
  if i=1 and lecturer is not null then
   select id into instructor from public.faculty where profile_id=lecturer;
   instructor:=coalesce(instructor,md5('academic-populated-instructor-1')::uuid);
  end if;
  insert into public.faculty(id,full_name,initials,employment_type,max_credits,profile_id)
  values(instructor,names[i],(array['AK','AA','SM','BH'])[i],case when i=2 then 'visiting' else 'permanent' end,12,case when i=1 then lecturer else null end)
  on conflict(id) do nothing;
  if i=1 and lecturer is not null then
   update public.faculty set profile_id=lecturer where id=instructor and profile_id is null;
  end if;
  fids:=array_append(fids,instructor);
 end loop;
 for i in 1..3 loop
  programme:=md5('academic-populated-programme-'||i)::uuid;
  insert into public.programmes(id,code,name) values(programme,(array['CS26','SE26','MS26'])[i],(array['Computer Science','Software Engineering','MS Computer Science'])[i]) on conflict(id) do nothing;
  batch:=md5('academic-populated-batch-'||i)::uuid;
  insert into public.batches(id,code,programme_id,intake_year,semester) values(batch,(array['CS-2024','SE-2024','MS-2025'])[i],programme,case when i=3 then 2025 else 2024 end,case when i=3 then 3 else 5 end) on conflict(id) do nothing;
  for j in 1..12 loop
   student:=md5('academic-populated-student-'||i||'-'||j)::uuid;
   insert into public.students(id,student_no,full_name,programme_id,batch_id)
   values(student,(array['CS','SE','MS'])[i]||'-26-'||lpad(j::text,3,'0'),students_names[j],programme,batch) on conflict(id) do nothing;
  end loop;
 end loop;
 for i in 1..12 loop
  j:=case when i<=6 then 1 when i<=9 then 2 else 3 end;
  programme:=md5('academic-populated-programme-'||j)::uuid;
  batch:=md5('academic-populated-batch-'||j)::uuid;
  course:=md5('academic-populated-course-'||i)::uuid;
  offering:=md5('academic-populated-offering-'||i)::uuid;
  insert into public.courses(id,code,title,credits) values(course,'AC'||(300+i),titles[i],3) on conflict(id) do nothing;
  insert into public.course_offerings(id,course_id,programme_id,semester,section,session_id,batch_id)
  values(offering,course,programme,case when j=3 then '3' else '5' end,'A',session_uuid,batch) on conflict(id) do nothing;
  if i<=9 and not exists(select 1 from public.allocations where course_offering_id=offering) then
   perform public.allocate_course(offering,fids[1+((i-1)%4)]);
  end if;
 end loop;
 for i in 1..3 loop
  insert into public.theses(id,student_id,supervisor_id,title,status,deadline)
  values(md5('academic-populated-thesis-'||i)::uuid,md5('academic-populated-student-3-'||i)::uuid,fids[case when i=1 then 1 else i end],(array['Learning Analytics for Student Support','Energy-Efficient Campus Networks','Secure Cloud Data Sharing'])[i],(array['Research','Proposal','Writing'])[i],current_date+30*i)
  on conflict(id) do nothing;
 end loop;
 perform set_config('request.jwt.claims',coalesce(previous_claims,''),true);
 perform set_config('request.jwt.claim.sub',coalesce(previous_sub,''),true);
end $$;
commit;
