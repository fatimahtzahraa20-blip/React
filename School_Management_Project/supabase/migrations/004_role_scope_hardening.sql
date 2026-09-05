-- Restrict student/teacher data to their enrolled or assigned batches.
-- Restrict teacher student lists to assigned batches.
drop policy if exists "students visible to staff or self" on public.students;
drop policy if exists "students visible by role scope" on public.students;
create policy "students visible by role scope"
on public.students for select to authenticated
using (
  public.is_admin()
  or profile_id = auth.uid()
  or exists (
    select 1 from public.teachers teacher
    join public.teacher_batches teacher_batch on teacher_batch.teacher_id = teacher.id
    where teacher.profile_id = auth.uid()
      and teacher_batch.batch_id = students.batch_id
  )
);


drop policy if exists "published assignments visible" on public.assignments;
create policy "role scoped assignments visible"
on public.assignments for select to authenticated
using (
  public.is_admin()
  or created_by = auth.uid()
  or (
    status = 'published'
    and public.has_role('student')
    and exists (
      select 1 from public.students student
      where student.profile_id = auth.uid()
        and student.batch_id = assignments.batch_id
    )
  )
  or (
    status = 'published'
    and public.has_role('teacher')
    and exists (
      select 1
      from public.teachers teacher
      join public.teacher_batches teacher_batch on teacher_batch.teacher_id = teacher.id
      where teacher.profile_id = auth.uid()
        and teacher_batch.batch_id = assignments.batch_id
    )
  )
);

drop policy if exists "assignment files readable" on public.assignment_files;
create policy "assignment files follow assignment access"
on public.assignment_files for select to authenticated
using (
  exists (
    select 1 from public.assignments assignment
    where assignment.id = assignment_files.assignment_id
  )
);

drop policy if exists "assignment files readable by authenticated" on storage.objects;
create policy "role scoped assignment storage reads"
on storage.objects for select to authenticated
using (
  bucket_id = 'assignment-files'
  and exists (
    select 1
    from public.assignment_files file_record
    join public.assignments assignment on assignment.id = file_record.assignment_id
    where file_record.storage_path = storage.objects.name
  )
);

drop policy if exists "attendance marked by staff" on public.attendance;
create policy "attendance marked by assigned staff"
on public.attendance for insert to authenticated
with check (
  marked_by = auth.uid()
  and (
    public.is_admin()
    or exists (
      select 1
      from public.teachers teacher
      join public.teacher_batches teacher_batch on teacher_batch.teacher_id = teacher.id
      where teacher.profile_id = auth.uid()
        and teacher_batch.batch_id = attendance.batch_id
    )
  )
);

drop policy if exists "attendance updated by staff" on public.attendance;
create policy "attendance updated by assigned staff"
on public.attendance for update to authenticated
using (
  public.is_admin()
  or exists (
    select 1
    from public.teachers teacher
    join public.teacher_batches teacher_batch on teacher_batch.teacher_id = teacher.id
    where teacher.profile_id = auth.uid()
      and teacher_batch.batch_id = attendance.batch_id
  )
)
with check (
  public.is_admin()
  or exists (
    select 1
    from public.teachers teacher
    join public.teacher_batches teacher_batch on teacher_batch.teacher_id = teacher.id
    where teacher.profile_id = auth.uid()
      and teacher_batch.batch_id = attendance.batch_id
  )
);
