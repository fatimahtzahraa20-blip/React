insert into public.courses(name, code, description, duration_months)
values
  ('Web Development', 'WD-01', 'Modern full-stack web development', 12),
  ('Graphic Design', 'GD-01', 'Visual design and digital media', 6)
on conflict (code) do nothing;

insert into public.batches(course_id, name, timing, start_date, end_date)
select id, 'Morning 2026', '09:00–11:00', '2026-01-05', '2026-12-18'
from public.courses where code = 'WD-01'
on conflict (course_id, name) do nothing;
