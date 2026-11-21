create extension if not exists pgcrypto;
create sequence if not exists public.admission_number_seq start 1;
create table if not exists public.admissions (
 id uuid primary key default gen_random_uuid(),
 application_no text not null unique default ('NH-2027-' || lpad(nextval('public.admission_number_seq')::text,5,'0')),
 academic_year text not null default '2027-2028', name text not null, dob date not null,
 house_name text, father_name text not null, father_job text, mother_name text,
 madrasa_info text, samastha_reg text, school_info text, address text not null,
 phone text not null, whatsapp text, pin text, district text, id_marks text,
 samastha_agree boolean not null default false, photo_path text,
 status text not null default 'Submitted' check(status in ('Submitted','Under Review','Approved','Rejected')),
 created_at timestamptz not null default now()
);
alter table public.admissions enable row level security;
drop policy if exists "Public submit admission" on public.admissions;
create policy "Public submit admission" on public.admissions for insert to anon with check (true);
drop policy if exists "Admin read admissions" on public.admissions;
create policy "Admin read admissions" on public.admissions for select to authenticated using (true);
drop policy if exists "Admin update admissions" on public.admissions;
create policy "Admin update admissions" on public.admissions for update to authenticated using (true) with check (true);
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('student-photos','student-photos',false,3145728,array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;
drop policy if exists "Public upload student photo" on storage.objects;
create policy "Public upload student photo" on storage.objects for insert to anon with check (bucket_id='student-photos');
drop policy if exists "Admin view student photos" on storage.objects;
create policy "Admin view student photos" on storage.objects for select to authenticated using (bucket_id='student-photos');
