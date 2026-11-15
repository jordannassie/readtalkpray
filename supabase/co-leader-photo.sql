-- Co-leader name and photo, plus an optional GroupMe link.
-- Run this in the Read Talk Pray database (project eeeprmtermreavivzswn).
-- Safe to run more than once. It does not delete groups or applications.

alter table public.rtp_group_applications add column if not exists co_leader_name text;
alter table public.rtp_group_applications add column if not exists co_leader_photo_url text;
alter table public.rtp_groups add column if not exists co_leader_name text;
alter table public.rtp_groups add column if not exists co_leader_photo_url text;
alter table public.rtp_groups add column if not exists groupme_url text;
