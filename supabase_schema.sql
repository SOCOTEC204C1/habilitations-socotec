create extension if not exists "pgcrypto";

create table if not exists public.collaborateurs (
  id         uuid primary key default gen_random_uuid(),
  nom        text not null,
  prenom     text not null,
  poste      text,
  agence     text default '204C1',
  email      text,
  tel        text,
  created_at timestamptz default now()
);

create table if not exists public.habilitations (
  id                uuid primary key default gen_random_uuid(),
  collaborateur_id  uuid not null references public.collaborateurs(id) on delete cascade,
  code              text not null,
  label             text not null,
  categorie         text not null,
  date_obtention    date,
  date_echeance     date,
  created_at        timestamptz default now()
);

create index if not exists idx_habilitations_collab    on public.habilitations(collaborateur_id);
create index if not exists idx_habilitations_echeance  on public.habilitations(date_echeance);

alter table public.collaborateurs enable row level security;
alter table public.habilitations  enable row level security;

create policy "Lecture publique collaborateurs" on public.collaborateurs for select using (true);
create policy "Lecture publique habilitations"  on public.habilitations  for select using (true);
create policy "Ecriture anon collaborateurs"    on public.collaborateurs for all using (true) with check (true);
create policy "Ecriture anon habilitations"     on public.habilitations  for all using (true) with check (true);
