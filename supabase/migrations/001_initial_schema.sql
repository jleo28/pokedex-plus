-- Pokédex++ initial schema
-- Run in Supabase SQL editor: https://supabase.com/dashboard/project/fzeyfnakisofgtjmtthy/sql

-- ─── pokemon ────────────────────────────────────────────────────────────────

create table pokemon (
  id              smallint primary key,
  slug            text unique not null,
  name            text not null,
  generation      smallint not null,
  type_primary    text not null,
  type_secondary  text,
  hp              smallint not null,
  attack          smallint not null,
  defense         smallint not null,
  sp_attack       smallint not null,
  sp_defense      smallint not null,
  speed           smallint not null,
  base_stat_total smallint generated always as (
    hp + attack + defense + sp_attack + sp_defense + speed
  ) stored,
  height_dm       smallint,
  weight_hg       smallint,
  is_legendary    boolean not null default false,
  sprite_url      text not null,
  cry_url         text,
  created_at      timestamptz default now()
);

create index pokemon_generation_idx   on pokemon(generation);
create index pokemon_type_primary_idx on pokemon(type_primary);
create index pokemon_type_secondary_idx on pokemon(type_secondary);
create index pokemon_legendary_idx    on pokemon(is_legendary) where is_legendary = true;

-- ─── evolutions ─────────────────────────────────────────────────────────────

create table evolutions (
  id            serial primary key,
  from_id       smallint not null references pokemon(id),
  to_id         smallint not null references pokemon(id),
  trigger       text not null,
  trigger_value text,
  unique (from_id, to_id)
);

-- ─── user_submissions ───────────────────────────────────────────────────────

create table user_submissions (
  id                      uuid primary key default gen_random_uuid(),
  name                    text not null,
  type_primary            text not null,
  type_secondary          text,
  hp                      smallint not null,
  attack                  smallint not null,
  defense                 smallint not null,
  sp_attack               smallint not null,
  sp_defense              smallint not null,
  speed                   smallint not null,
  predicted_bst           smallint,
  predicted_legendary     boolean,
  predicted_legendary_prob real,
  created_at              timestamptz default now(),
  ip_hash                 text
);

create index user_submissions_created_at_idx on user_submissions(created_at desc);

-- ─── predictions_log ────────────────────────────────────────────────────────

create table predictions_log (
  id                      uuid primary key default gen_random_uuid(),
  input_stats             jsonb not null,
  predicted_bst           smallint,
  predicted_legendary_prob real,
  created_at              timestamptz default now()
);

-- ─── Row-Level Security ──────────────────────────────────────────────────────

alter table pokemon enable row level security;
create policy "public read" on pokemon for select using (true);

alter table evolutions enable row level security;
create policy "public read" on evolutions for select using (true);

alter table user_submissions enable row level security;
create policy "public read recent" on user_submissions
  for select using (created_at > now() - interval '30 days');

alter table predictions_log enable row level security;
-- No select policy — server-only writes via service role.
