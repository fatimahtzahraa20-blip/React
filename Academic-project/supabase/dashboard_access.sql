-- Apply AFTER schema.sql, production_schema.sql and roles.sql.
-- Existing projects: run this file only. No records are deleted.
begin;
create or replace function public.current_app_role() returns public.app_role
language sql stable security definer set search_path = '' as $$
 select role::public.app_role from public.profiles where id=auth.uid();
$$;
create or replace function public.my_faculty_ids() returns setof uuid
language sql stable security definer set search_path = '' as $$
 select id from public.faculty where profile_id=auth.uid();
$$;
revoke all on function public.current_app_role(), public.my_faculty_ids() from public, anon;
grant execute on function public.current_app_role(), public.my_faculty_ids() to authenticated;

-- Never trust a role supplied in editable signup metadata.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
 insert into public.profiles(id,full_name,initials,role)
 values(new.id,coalesce(new.raw_user_meta_data->>'full_name',split_part(new.email,'@',1)),upper(left(coalesce(new.raw_user_meta_data->>'full_name',new.email),2)),'faculty')
 on conflict(id) do nothing;
 return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();
insert into public.profiles(id,full_name,initials,role)
select id,coalesce(raw_user_meta_data->>'full_name',split_part(email,'@',1)),upper(left(email,2)),'faculty' from auth.users on conflict(id) do nothing;

-- Replace policies on application tables so old permissive policies cannot bypass these rules.
do $$ declare t text; p record;
begin
 foreach t in array array['profiles','programmes','faculty','courses','course_offerings','allocations','conflicts','students','theses','academic_sessions','session_programmes','semesters','sections','faculty_programmes','workload_rules','team_scopes','team_permissions','allocation_history','activity_logs','approval_records'] loop
  execute format('alter table public.%I enable row level security',t);
  for p in select policyname from pg_policies where schemaname='public' and tablename=t loop
   execute format('drop policy %I on public.%I',p.policyname,t);
  end loop;
 end loop;
end $$;
create policy profile_read on public.profiles for select to authenticated using(id=auth.uid() or public.current_app_role()='admin');
create policy profile_admin_update on public.profiles for update to authenticated using(public.current_app_role()='admin' and id<>auth.uid()) with check(public.current_app_role()='admin' and id<>auth.uid());
create policy faculty_read on public.faculty for select to authenticated using(public.current_app_role() in ('admin','hod','coordinator') or profile_id=auth.uid());
create policy faculty_update on public.faculty for update to authenticated using(public.current_app_role() in ('admin','hod')) with check(public.current_app_role() in ('admin','hod'));
-- Restrict browser updates to the credit limit; profile links are managed by a trusted administrator in SQL.
revoke update on public.faculty from authenticated;
grant update(max_credits) on public.faculty to authenticated;
create policy allocation_read on public.allocations for select to authenticated using(public.current_app_role() in ('admin','hod','coordinator') or faculty_id in (select public.my_faculty_ids()));
create policy allocation_write on public.allocations for all to authenticated using(public.current_app_role() in ('admin','hod','coordinator')) with check(public.current_app_role() in ('admin','hod','coordinator'));
create policy offering_read on public.course_offerings for select to authenticated using(public.current_app_role() in ('admin','hod','coordinator') or exists(select 1 from public.allocations a where a.course_offering_id=course_offerings.id and a.faculty_id in (select public.my_faculty_ids())));
create policy course_read on public.courses for select to authenticated using(public.current_app_role() in ('admin','hod','coordinator') or exists(select 1 from public.course_offerings o where o.course_id=courses.id));
create policy programme_read on public.programmes for select to authenticated using(public.current_app_role() in ('admin','hod','coordinator','faculty'));
create policy conflict_read on public.conflicts for select to authenticated using(public.current_app_role() in ('admin','hod','coordinator'));
create policy conflict_update on public.conflicts for update to authenticated using(public.current_app_role() in ('admin','hod','coordinator')) with check(public.current_app_role() in ('admin','hod','coordinator'));
create policy thesis_read on public.theses for select to authenticated using(public.current_app_role() in ('admin','hod','coordinator') or supervisor_id in (select public.my_faculty_ids()));
create policy student_read on public.students for select to authenticated using(public.current_app_role() in ('admin','hod','coordinator') or exists(select 1 from public.theses t where t.student_id=students.id));
create policy session_read on public.academic_sessions for select to authenticated using(public.current_app_role() in ('admin','hod','coordinator'));
create policy session_insert on public.academic_sessions for insert to authenticated with check(public.current_app_role() in ('admin','hod') and status='planning' and approved_at is null and approved_by is null);
create policy history_read on public.allocation_history for select to authenticated using(public.current_app_role() in ('admin','hod','coordinator'));
create policy activity_read on public.activity_logs for select to authenticated using(public.current_app_role() in ('admin','hod','coordinator'));
create policy approval_read on public.approval_records for select to authenticated using(public.current_app_role() in ('admin','hod'));
create policy rules_read on public.workload_rules for select to authenticated using(public.current_app_role() in ('admin','hod','coordinator'));
-- Other production tables stay closed until an authorized feature needs them.

create or replace function public.guard_allocation() returns trigger
language plpgsql security definer set search_path = '' as $$
declare v_offering uuid; v_locked boolean; v_session uuid;
begin
 if auth.uid() is null or coalesce(public.current_app_role()::text,'') not in ('admin','hod','coordinator') then raise exception 'Allocation permission required'; end if;
 if tg_op='UPDATE' and new.course_offering_id<>old.course_offering_id then raise exception 'An allocation cannot be moved to another offering'; end if;
 v_offering:=case when tg_op='DELETE' then old.course_offering_id else new.course_offering_id end;
 select session_id into v_session from public.course_offerings where id=v_offering;
 -- Serialize with session approval before locking the offering.
 perform 1 from public.academic_sessions where id=v_session for update;
 select locked into v_locked from public.course_offerings where id=v_offering for update;
 if v_locked or exists(select 1 from public.academic_sessions where id=v_session and status='approved') then raise exception 'This session is approved. Allocations are locked.'; end if;
 if tg_op='DELETE' then return old; end if;
 return new;
end;
$$;
drop trigger if exists allocation_guard on public.allocations;
create trigger allocation_guard before insert or update or delete on public.allocations for each row execute function public.guard_allocation();

create or replace function public.allocate_course(p_offering_id uuid,p_faculty_id uuid) returns public.allocations
language plpgsql security invoker set search_path = '' as $$
declare v_credits integer; v_result public.allocations;
begin
 if auth.uid() is null or coalesce(public.current_app_role()::text,'') not in ('admin','hod','coordinator') then raise exception 'Allocation permission required'; end if;
 select c.credits into v_credits from public.course_offerings o join public.courses c on c.id=o.course_id where o.id=p_offering_id;
 if v_credits is null then raise exception 'Course offering not found'; end if;
 if not exists(select 1 from public.faculty where id=p_faculty_id) then raise exception 'Faculty not found'; end if;
 insert into public.allocations(course_offering_id,faculty_id,assigned_credits,status) values(p_offering_id,p_faculty_id,v_credits,'allocated')
 on conflict(course_offering_id) do update set faculty_id=excluded.faculty_id,assigned_credits=excluded.assigned_credits,status='allocated'
 returning * into v_result;
 return v_result;
end;
$$;
create or replace function public.record_allocation_change() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
 insert into public.allocation_history(offering_id,previous_faculty_id,new_faculty_id,action,changed_by)
 values(new.course_offering_id,case when tg_op='UPDATE' then old.faculty_id else null end,new.faculty_id,lower(tg_op),auth.uid());
 insert into public.activity_logs(actor_id,action,entity_type,entity_id,new_value)
 values(auth.uid(),'allocation_'||lower(tg_op),'allocation',new.id,to_jsonb(new));
 return new;
end;
$$;
drop trigger if exists allocation_audit on public.allocations;
create trigger allocation_audit after insert or update on public.allocations for each row execute function public.record_allocation_change();

create or replace function public.approve_session(p_session_id uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin
 if auth.uid() is null or coalesce(public.current_app_role()::text,'') not in ('admin','hod') then raise exception 'Only HOD or administrator can approve'; end if;
 perform 1 from public.academic_sessions where id=p_session_id and status<>'approved' for update;
 if not found then raise exception 'Session not found or already approved'; end if;
 if not exists(select 1 from public.course_offerings where session_id=p_session_id) then raise exception 'Add course offerings before approval'; end if;
 if exists(select 1 from public.course_offerings o left join public.allocations a on a.course_offering_id=o.id where o.session_id=p_session_id and (a.id is null or a.status<>'allocated')) then raise exception 'Allocate every offering before approval'; end if;
 if exists(select 1 from public.conflicts c join public.course_offerings o on o.id=c.course_offering_id where o.session_id=p_session_id and not c.resolved) then raise exception 'Resolve session conflicts before approval'; end if;
 update public.academic_sessions set status='approved',approved_at=now(),approved_by=auth.uid() where id=p_session_id;
 update public.course_offerings set status='approved',locked=true where session_id=p_session_id;
 insert into public.approval_records(session_id,action,actor_id) values(p_session_id,'approved',auth.uid());
 insert into public.activity_logs(actor_id,action,entity_type,entity_id,session_id) values(auth.uid(),'session_approved','academic_session',p_session_id,p_session_id);
end;
$$;
create or replace function public.import_allocations(p_rows jsonb) returns integer
language plpgsql security invoker set search_path = '' as $$
declare r jsonb; n integer:=0;
begin
 if auth.uid() is null or coalesce(public.current_app_role()::text,'') not in ('admin','hod','coordinator') then raise exception 'Allocation permission required'; end if;
 if jsonb_typeof(p_rows)<>'array' or jsonb_array_length(p_rows) not between 1 and 500 then raise exception 'Provide 1 to 500 allocation rows'; end if;
 for r in select value from jsonb_array_elements(p_rows) loop
  perform public.allocate_course((r->>'offering_id')::uuid,(r->>'faculty_id')::uuid); n:=n+1;
 end loop;
 return n;
end;
$$;
-- Aggregate functions also respect the caller's row policies.
alter function public.dashboard_summary() security invoker;
alter function public.workload_for_faculty(uuid,uuid) security invoker;
revoke all on function public.allocate_course(uuid,uuid), public.approve_session(uuid), public.import_allocations(jsonb), public.dashboard_summary(), public.workload_for_faculty(uuid,uuid) from public, anon;
grant execute on function public.allocate_course(uuid,uuid), public.approve_session(uuid), public.import_allocations(jsonb), public.dashboard_summary(), public.workload_for_faculty(uuid,uuid) to authenticated;
revoke all on function public.handle_new_user(), public.guard_allocation(), public.record_allocation_change() from public, anon, authenticated;
commit;

-- An existing faculty record must be linked to its Auth profile for personal dashboards.
-- Replace the UUID placeholders, then run the relevant statements separately:
-- update public.faculty set profile_id = '<AUTH_USER_UUID>' where id = '<FACULTY_UUID>';
-- update public.profiles set role = 'admin' where id = '<TRUSTED_ADMIN_AUTH_UUID>';
