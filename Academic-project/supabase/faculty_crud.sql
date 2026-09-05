-- Apply after the existing academic_workflows.sql and role_crud.sql migrations.
-- Enables thesis CRUD for the linked supervisor only.
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

create or replace function public.manage_academic_record(p_kind text,p_id uuid,p_operation text,p_record jsonb default '{}')
returns void language plpgsql security definer set search_path='' as $$
declare r text; v_table text; v_before jsonb; v_session uuid; v_locked boolean;
begin
 r:=public.current_app_role()::text;
 if auth.uid() is null or coalesce(r,'') not in ('admin','hod','coordinator','faculty') then raise exception 'Management access required'; end if;
 if p_operation is null or p_operation not in ('update','delete') then raise exception 'Unsupported operation'; end if;
 if p_kind is null or p_kind not in ('faculty','student','offering','thesis','conflict','programme','session') then raise exception 'Unsupported record type'; end if;
 if r='faculty' and p_kind<>'thesis' then raise exception 'Faculty may manage only their own supervised theses'; end if;
 if r='coordinator' and p_kind not in ('student','offering','thesis','conflict') then raise exception 'Coordinator cannot manage this record type'; end if;
 v_table:=case p_kind when 'faculty' then 'faculty' when 'student' then 'students' when 'offering' then 'course_offerings' when 'thesis' then 'theses' when 'conflict' then 'conflicts' when 'programme' then 'programmes' when 'session' then 'academic_sessions' end;
 if p_kind='offering' then
  select session_id into v_session from public.course_offerings where id=p_id;
  perform 1 from public.academic_sessions where id=v_session for update;
 end if;
 execute format('select to_jsonb(t) from public.%I t where id=$1 for update',v_table) into v_before using p_id;
 if v_before is null then raise exception 'Record no longer exists'; end if;
 if r='faculty' and not exists(select 1 from public.faculty where id=(v_before->>'supervisor_id')::uuid and profile_id=auth.uid()) then raise exception 'You can only edit or delete theses you supervise'; end if;
 if p_kind='offering' and (coalesce((v_before->>'locked')::boolean,false) or exists(select 1 from public.academic_sessions where id=v_session and status='approved')) then raise exception 'Approved offerings are locked'; end if;
 if p_kind='session' and v_before->>'status'='approved' then raise exception 'Approved sessions are locked'; end if;
 if p_operation='delete' then
  if p_kind='student' and exists(select 1 from public.theses where student_id=p_id) then raise exception 'This student has thesis records. Remove those records first.'; end if;
  if p_kind='faculty' and (exists(select 1 from public.allocations where faculty_id=p_id) or exists(select 1 from public.theses where supervisor_id=p_id)) then raise exception 'Reassign this lecturer''s courses and theses before deleting'; end if;
  if p_kind='offering' and (exists(select 1 from public.allocations where course_offering_id=p_id) or exists(select 1 from public.conflicts where course_offering_id=p_id) or exists(select 1 from public.allocation_history where offering_id=p_id)) then raise exception 'An offering with allocations, conflicts or history cannot be deleted'; end if;
  if p_kind='programme' and (exists(select 1 from public.course_offerings where programme_id=p_id) or exists(select 1 from public.students where programme_id=p_id) or exists(select 1 from public.semesters where programme_id=p_id) or exists(select 1 from public.team_scopes where programme_id=p_id) or exists(select 1 from public.faculty_programmes where programme_id=p_id)) then raise exception 'This programme is in use and cannot be deleted'; end if;
  if p_kind='session' and (exists(select 1 from public.course_offerings where session_id=p_id) or exists(select 1 from public.sections where session_id=p_id) or exists(select 1 from public.session_programmes where session_id=p_id) or exists(select 1 from public.approval_records where session_id=p_id)) then raise exception 'This session has academic records and cannot be deleted'; end if;
  execute format('delete from public.%I where id=$1',v_table) using p_id;
 else
  if p_record is null or jsonb_typeof(p_record)<>'object' then raise exception 'Provide updated fields'; end if;
  case p_kind
   when 'faculty' then
    if nullif(trim(p_record->>'full_name'),'') is null or coalesce((p_record->>'max_credits')::integer,0) not between 1 and 60 then raise exception 'Provide a name and a credit limit between 1 and 60'; end if;
    update public.faculty set full_name=trim(p_record->>'full_name'),max_credits=(p_record->>'max_credits')::integer where id=p_id;
   when 'student' then
    if nullif(trim(p_record->>'full_name'),'') is null or nullif(trim(p_record->>'student_no'),'') is null then raise exception 'Student number and name are required'; end if;
    update public.students set full_name=trim(p_record->>'full_name'),student_no=trim(p_record->>'student_no') where id=p_id;
   when 'offering' then
    if nullif(trim(p_record->>'semester'),'') is null or nullif(trim(p_record->>'section'),'') is null then raise exception 'Semester and section are required'; end if;
    update public.course_offerings set semester=trim(p_record->>'semester'),section=upper(trim(p_record->>'section')) where id=p_id;
   when 'thesis' then
    if nullif(trim(p_record->>'title'),'') is null or nullif(p_record->>'deadline','') is null then raise exception 'Title and deadline are required'; end if;
    update public.theses set title=trim(p_record->>'title'),deadline=(p_record->>'deadline')::date,updated_at=now() where id=p_id;
   when 'conflict' then
    if nullif(trim(p_record->>'kind'),'') is null or nullif(trim(p_record->>'message'),'') is null then raise exception 'Issue type and description are required'; end if;
    update public.conflicts set kind=trim(p_record->>'kind'),message=trim(p_record->>'message') where id=p_id;
   when 'programme' then
    if nullif(trim(p_record->>'code'),'') is null or nullif(trim(p_record->>'name'),'') is null then raise exception 'Code and name are required'; end if;
    update public.programmes set code=upper(trim(p_record->>'code')),name=trim(p_record->>'name') where id=p_id;
   when 'session' then
    if nullif(trim(p_record->>'title'),'') is null then raise exception 'Title is required'; end if;
    update public.academic_sessions set title=trim(p_record->>'title') where id=p_id;
  end case;
 end if;
 insert into public.activity_logs(actor_id,action,entity_type,entity_id,previous_value,new_value)
 values(auth.uid(),p_kind||'_'||p_operation,p_kind,p_id,v_before,case when p_operation='update' then p_record else null end);
end;
$$;
revoke all on function public.manage_academic_record(text,uuid,text,jsonb) from public,anon;
grant execute on function public.manage_academic_record(text,uuid,text,jsonb) to authenticated;

commit;
