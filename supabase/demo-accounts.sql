-- Optional explicit demo flag for a profile. Demo Mode itself stays in rtp_settings.show_demo_groups.
-- Run this in the Read Talk Pray database (project eeeprmtermreavivzswn).
-- Safe to run more than once. It does not delete accounts or change admin access.
-- Seeded map groups are already flagged in the app and do not need this column.

alter table public.rtp_profiles add column if not exists is_demo boolean not null default false;
