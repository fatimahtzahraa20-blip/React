-- Run AFTER dashboard_access.sql. Adds working record-entry operations.
begin;
create or replace function public.create_academic_record(p_kind text,p_record jsonb)
returns uuid language plpgsql security definer set search_path='' as $$
declare v_role text; v_id uuid; v_programme uuid; v_course uuid; v_session uuid; v_student uuid; v_profile uuid; v_status text;
begin
 v_role:=public.current_app_role()::text;
 if auth.uid() is null or coalesce(v_role,'') not in ('admin','hod','coordinator','faculty') then raise exception 'Academic access required'; end if;
 if v_role='faculty' then
  if p_kind is distinct from 'thesis' then raise exception 'Faculty may create only their own supervised theses'; end if;
  if not exists(select 1 from public.faculty where id=(p_record->>'supervisor_id')::uuid and profile_id=auth.uid()) then raise exception 'Select your own linked faculty record as supervisor'; end if;
 end if;
 if p_record is null or jsonb_typeof(p_record)<>'object' then raise exception 'Provide record details'; end if;
 if p_kind in ('programme','faculty') and v_role not in ('admin','hod') then raise exception 'Only Admin or HOD may manage department records'; end if;
 if p_kind='programme' then
  if nullif(trim(p_record->>'code'),'') is null or nullif(trim(p_record->>'name'),'') is null then raise exception 'Programme code and name are required'; end if;
  insert into public.programmes(code,name) values(upper(trim(p_record->>'code')),trim(p_record->>'name')) returning id into v_id;
 elsif p_kind='student' then
  if nullif(trim(p_record->>'student_no'),'') is null or nullif(trim(p_record->>'full_name'),'') is null then raise exception 'Student number and name are required'; end if;
  select id into v_programme from public.programmes where code=upper(trim(p_record->>'programme'));
  if v_programme is null then raise exception 'Select an existing programme'; end if;
  insert into public.students(student_no,full_name,programme_id) values(trim(p_record->>'student_no'),trim(p_record->>'full_name'),v_programme) returning id into v_id;
 elsif p_kind='faculty' then
  if nullif(trim(p_record->>'full_name'),'') is null then raise exception 'Faculty name is required'; end if;
  if coalesce((p_record->>'max_credits')::integer,0) not between 1 and 60 then raise exception 'Credit limit must be between 1 and 60'; end if;
  if coalesce(p_record->>'employment_type','') not in ('permanent','visiting') then raise exception 'Choose an employment type'; end if;
  if nullif(trim(p_record->>'email'),'') is not null then
   select p.id into v_profile from public.profiles p join auth.users u on u.id=p.id where lower(u.email)=lower(trim(p_record->>'email'));
   if v_profile is null then raise exception 'No account exists for this email. Invite the user first, or leave email empty.'; end if;
  end if;
  insert into public.faculty(full_name,initials,employment_type,max_credits,profile_id)
  values(trim(p_record->>'full_name'),upper(left(trim(p_record->>'full_name'),2)),p_record->>'employment_type',(p_record->>'max_credits')::integer,v_profile) returning id into v_id;
 elsif p_kind='offering' then
  if nullif(trim(p_record->>'code'),'') is null or nullif(trim(p_record->>'title'),'') is null or nullif(trim(p_record->>'semester'),'') is null or nullif(trim(p_record->>'section'),'') is null then raise exception 'Complete all course fields'; end if;
  if coalesce((p_record->>'credits')::integer,0) not between 1 and 6 then raise exception 'Course credits must be between 1 and 6'; end if;
  v_session:=(p_record->>'session_id')::uuid;
  select status::text into v_status from public.academic_sessions where id=v_session for update;
  if v_status is null or v_status='approved' then raise exception 'Select an existing, unapproved session'; end if;
  select id into v_programme from public.programmes where code=upper(trim(p_record->>'programme'));
  if v_programme is null then raise exception 'Programme not found. Create it in Semester planning first.'; end if;
  insert into public.courses(code,title,credits) values(upper(trim(p_record->>'code')),trim(p_record->>'title'),(p_record->>'credits')::integer) on conflict(code) do nothing;
  select id into v_course from public.courses where code=upper(trim(p_record->>'code')) and title=trim(p_record->>'title') and credits=(p_record->>'credits')::integer;
  if v_course is null then raise exception 'This course code already exists with a different title or credit count'; end if;
  if exists(select 1 from public.course_offerings where course_id=v_course and programme_id=v_programme and semester::text=trim(p_record->>'semester') and section=upper(trim(p_record->>'section')) and session_id=v_session) then raise exception 'This offering already exists in the selected session. Find it in Course allocation.'; end if;
  insert into public.course_offerings(course_id,programme_id,semester,section,session_id)
  values(v_course,v_programme,trim(p_record->>'semester'),upper(trim(p_record->>'section')),v_session) returning id into v_id;
 elsif p_kind='thesis' then
  if nullif(trim(p_record->>'student_no'),'') is null or nullif(trim(p_record->>'student_name'),'') is null or nullif(trim(p_record->>'title'),'') is null then raise exception 'Student number, name and thesis title are required'; end if;
  if not exists(select 1 from public.faculty where id=(p_record->>'supervisor_id')::uuid) then raise exception 'Select a valid supervisor'; end if;
  insert into public.students(student_no,full_name) values(trim(p_record->>'student_no'),trim(p_record->>'student_name')) on conflict(student_no) do nothing;
  select id into v_student from public.students where student_no=trim(p_record->>'student_no') and full_name=trim(p_record->>'student_name');
  if v_student is null then raise exception 'Student number already belongs to a different name'; end if;
  insert into public.theses(student_id,supervisor_id,title,deadline) values(v_student,(p_record->>'supervisor_id')::uuid,trim(p_record->>'title'),(p_record->>'deadline')::date) returning id into v_id;
 elsif p_kind='conflict' then
  if nullif(trim(p_record->>'kind'),'') is null or nullif(trim(p_record->>'message'),'') is null then raise exception 'Issue type and description are required'; end if;
  insert into public.conflicts(kind,message) values(trim(p_record->>'kind'),trim(p_record->>'message')) returning id into v_id;
 else raise exception 'Unknown record type';
 end if;
 insert into public.activity_logs(actor_id,action,entity_type,entity_id) values(auth.uid(),p_kind||'_created',p_kind,v_id);
 return v_id;
end;
$$;
revoke all on function public.create_academic_record(text,jsonb) from public,anon;
grant execute on function public.create_academic_record(text,jsonb) to authenticated;

-- Supervisors may update research progress, but cannot change student or supervisor links.
drop policy if exists thesis_progress_update on public.theses;
create policy thesis_progress_update on public.theses for update to authenticated
using(public.current_app_role() in ('admin','hod','coordinator') or supervisor_id in (select public.my_faculty_ids()))
with check(public.current_app_role() in ('admin','hod','coordinator') or supervisor_id in (select public.my_faculty_ids()));
revoke update on public.theses from authenticated;
grant update(status,updated_at) on public.theses to authenticated;

-- Permit the same course/semester/section in different academic sessions.
do $$ declare c record;
begin
 for c in select con.conname from pg_constraint con
 where con.conrelid='public.course_offerings'::regclass and con.contype='u'
 and (select array_agg(a.attname::text order by a.attname) from unnest(con.conkey) k join pg_attribute a on a.attrelid=con.conrelid and a.attnum=k)
 = array['course_id','programme_id','section','semester']::text[]
 loop execute format('alter table public.course_offerings drop constraint %I',c.conname); end loop;
end $$;
create unique index if not exists offering_session_unique on public.course_offerings(course_id,programme_id,semester,section,session_id) where session_id is not null;
create unique index if not exists offering_legacy_unique on public.course_offerings(course_id,programme_id,semester,section) where session_id is null;
commit;

-- Add missing example students without duplicating existing records.
create or replace function public.load_example_students() returns void
language plpgsql security invoker set search_path='' as $$
declare i integer;
begin
 if auth.uid() is null or coalesce(public.current_app_role()::text,'')<>'admin' then raise exception 'Administrator access required'; end if;
 for i in 1..8 loop
  if not exists(select 1 from public.students where student_no='DEMO-BS-'||lpad(i::text,3,'0')) then
   perform public.create_academic_record('student',jsonb_build_object('student_no','DEMO-BS-'||lpad(i::text,3,'0'),'full_name','Example ? '||(array['Areeba Shah','Hamza Khan','Maham Ali','Bilal Ahmed','Zainab Malik','Umar Hassan','Fatima Noor','Saad Raza'])[i],'programme','DEMO-CS'));
  end if;
 end loop;
end;
$$;
revoke all on function public.load_example_students() from public,anon;
grant execute on function public.load_example_students() to authenticated;

-- Explicit administrator-only sample data loader. Does not overwrite existing records.
create or replace function public.load_academic_examples() returns void
language plpgsql security invoker set search_path='' as $$
declare s uuid; f1 uuid; f2 uuid; o uuid; i integer;
begin
 if auth.uid() is null or coalesce(public.current_app_role()::text,'')<>'admin' then raise exception 'Only an administrator may load examples'; end if;
 perform pg_advisory_xact_lock(481026);
 if exists(select 1 from public.programmes where code='DEMO-CS') or exists(select 1 from public.academic_sessions where code='DM26') then perform public.load_example_students(); return; end if;
 perform public.create_academic_record('programme',jsonb_build_object('code','DEMO-CS','name','Example Computer Science Programme'));
 insert into public.academic_sessions(code,title) values('DM26','Example academic session') returning id into s;
 f1:=public.create_academic_record('faculty',jsonb_build_object('full_name','Example · Dr. Ayesha Khan','employment_type','permanent','max_credits',12));
 f2:=public.create_academic_record('faculty',jsonb_build_object('full_name','Example · Ahmed Ali','employment_type','visiting','max_credits',9));
 for i in 1..6 loop
  o:=public.create_academic_record('offering',jsonb_build_object('code','DEMO-CS'||i,'title',(array['Programming Fundamentals','Data Structures','Database Systems','Software Engineering','Computer Networks','Artificial Intelligence'])[i],'credits',3,'programme','DEMO-CS','semester','5','section','A','session_id',s));
  if i<=3 then perform public.allocate_course(o,f1); elsif i=4 then perform public.allocate_course(o,f2); end if;
 end loop;
 perform public.create_academic_record('thesis',jsonb_build_object('student_no','DEMO-MS-001','student_name','Example · Sara Ahmed','title','Example: Learning Analytics for Student Support','supervisor_id',f1,'deadline',current_date+60));
 perform public.create_academic_record('thesis',jsonb_build_object('student_no','DEMO-MS-002','student_name','Example · Hassan Raza','title','Example: Energy-Efficient Campus Networks','supervisor_id',f2,'deadline',current_date+90));
 perform public.load_example_students();
end;
$$;
revoke all on function public.load_academic_examples() from public,anon;
grant execute on function public.load_academic_examples() to authenticated;
