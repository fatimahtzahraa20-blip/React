-- Ensure students can submit only to published assignments for their own batch.

drop policy if exists "students create own submissions" on public.assignment_submissions;
create policy "students create own submissions"
on public.assignment_submissions for insert to authenticated
with check (
  exists (
    select 1
    from public.students student
    join public.assignments assignment on assignment.id = assignment_submissions.assignment_id
    where student.id = assignment_submissions.student_id
      and student.profile_id = auth.uid()
      and student.batch_id = assignment.batch_id
      and assignment.status = 'published'
  )
);

drop policy if exists "submissions updated by owner or staff" on public.assignment_submissions;
drop policy if exists "students update own submissions" on public.assignment_submissions;
create policy "students update own submissions"
on public.assignment_submissions for update to authenticated
using (
  exists (
    select 1 from public.students student
    where student.id = assignment_submissions.student_id
      and student.profile_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.students student
    join public.assignments assignment on assignment.id = assignment_submissions.assignment_id
    where student.id = assignment_submissions.student_id
      and student.profile_id = auth.uid()
      and student.batch_id = assignment.batch_id
      and assignment.status = 'published'
  )
);

drop policy if exists "staff review submissions" on public.assignment_submissions;
create policy "staff review submissions"
on public.assignment_submissions for update to authenticated
using (public.is_admin() or public.has_role('teacher'))
with check (public.is_admin() or public.has_role('teacher'));


