-- =====================================================================
--  Nordisk Film Biografer - DUI eksamensprojekt
--  Supabase-skema baseret på Figma-flowet:
--  Vælg by -> Forside -> Film + spilletider -> Sædevalg -> (reservation)
--  -> Log ind/gæst -> Betaling (MobilePay / kort / gavekort) -> Billet
-- =====================================================================

-- ---------- ENUMS ----------------------------------------------------
create type movie_status   as enum ('now_playing', 'coming_soon', 'archived');
create type seat_type      as enum ('standard', 'handicap', 'couple', 'premium');
create type booking_status as enum ('reserved', 'paid', 'failed', 'cancelled', 'expired');
create type payment_method as enum ('mobilepay', 'card', 'giftcard');

-- ---------- BYER & BIOGRAFER ----------------------------------------
create table cities (
  id         bigint generated always as identity primary key,
  name       text not null unique,
  slug       text not null unique
);

create table cinemas (
  id         bigint generated always as identity primary key,
  city_id    bigint not null references cities(id) on delete cascade,
  name       text not null,
  slug       text not null unique,
  address    text,
  image_url  text
);

create table halls (
  id         bigint generated always as identity primary key,
  cinema_id  bigint not null references cinemas(id) on delete cascade,
  name       text not null,                -- fx "Sal 4"
  unique (cinema_id, name)
);

create table seats (
  id          bigint generated always as identity primary key,
  hall_id     bigint not null references halls(id) on delete cascade,
  row_number  int    not null,             -- række 4
  seat_number int    not null,             -- sæde 6
  col         int    not null,             -- kolonnen i salen (1 = længst til venstre). Huller = gange
  type        seat_type not null default 'standard',   -- couple (daybed) bruges ikke længere
  unique (hall_id, row_number, seat_number),
  unique (hall_id, row_number, col)
);

-- Bygger sæderne i en sal ud fra et layout - én tekst pr. række, ét tegn pr. kolonne:
--   S = sæde   H = kørestolsplads
--   . = gang/tom plads
-- Sædenumrene tælles fra venstre i hver række. Eksisterende sæder i salen slettes først.
create or replace function public.seed_hall_seats(p_hall_id bigint, p_layout text[])
returns void language sql as $$
  delete from seats where hall_id = p_hall_id;

  insert into seats (hall_id, row_number, seat_number, col, type)
  select p_hall_id,
         r.rn,
         row_number() over (partition by r.rn order by c.col),
         c.col,
         case c.ch when 'H' then 'handicap' else 'standard' end::seat_type
  from unnest(p_layout) with ordinality as r(line, rn)
  cross join lateral unnest(string_to_array(r.line, null)) with ordinality as c(ch, col)
  where c.ch in ('S', 'H');
$$;
revoke execute on function public.seed_hall_seats(bigint, text[]) from public, anon, authenticated;

-- ---------- FILM & SPILLETIDER --------------------------------------
create table movies (
  id            bigint generated always as identity primary key,
  tmdb_id       int unique,                -- id fra The Movie Database
  title         text not null,
  slug          text not null unique,
  short_description text,
  description   text,                      -- "Om filmen"
  director      text,
  cast_members  text[] default '{}',
  genres        text[] default '{}',       -- chips: Thriller …
  age_rating    text,                      -- "15 år"
  duration_min  int,                       -- 108 -> "1 t 48 min"
  language      text,                      -- "Engelsk tale"
  premiere_date date,
  status        movie_status not null default 'now_playing',
  poster_url    text,
  hero_url      text,
  trailer_url   text,
  rating        numeric(2,1),              -- bjørne-score, fx 5.0 af 6
  review_count  int default 0,
  created_at    timestamptz not null default now()
);

create table showtimes (
  id         bigint generated always as identity primary key,
  movie_id   bigint not null references movies(id) on delete cascade,
  hall_id    bigint not null references halls(id) on delete cascade,
  starts_at  timestamptz not null,
  format     text not null default '2D',   -- 2D / 3D / 4DX / 70MM
  price_dkk  int  not null default 130,
  tags       text[] not null default '{}', -- forestillingens kendetegn, fx "Babybio", "Dansk undertekst" ("Ekstra filtrering" på /film)
  unique (hall_id, starts_at)
);
create index on showtimes (movie_id, starts_at);

-- ---------- PROFILER -------------------------------------------------
create table profiles (
  id                  uuid primary key references auth.users(id) on delete cascade,
  full_name           text,
  phone               text,
  birthday            date,                                -- Opret profil, trin 2
  postal_code         text,                                -- Opret profil, trin 2
  gender              text check (gender in ('kvinde', 'mand', 'andet', 'vil-ikke-oplyse')),
  newsletter          boolean not null default false,      -- Opret profil, trin 1
  points              int not null default 0,
  favorite_cinema_id  bigint references cinemas(id) on delete set null,
  created_at          timestamptz not null default now()
);

-- Opret automatisk en profil når en bruger signer op
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  -- Felterne fra "Opret profil" (signUp i lib/actions/auth.js sender dem som raw_user_meta_data)
  insert into public.profiles (id, full_name, phone, birthday, postal_code, gender, newsletter)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'phone',
    (new.raw_user_meta_data ->> 'birthday')::date,
    new.raw_user_meta_data ->> 'postal_code',
    new.raw_user_meta_data ->> 'gender',
    coalesce((new.raw_user_meta_data ->> 'newsletter')::boolean, false)
  );
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- BOOKINGER ------------------------------------------------
create table bookings (
  id              uuid primary key default gen_random_uuid(),
  showtime_id     bigint not null references showtimes(id) on delete cascade,
  user_id         uuid references auth.users(id) on delete set null,  -- null = gæst
  guest_email     text,
  guest_name      text,
  status          booking_status not null default 'reserved', -- reserved (i gang) eller paid (købt). Udløbne slettes
  reserved_until  timestamptz not null default now() + interval '10 minutes', -- nedtælling
  payment_method  payment_method,
  total_dkk       int not null default 0,
  child_count     int not null default 0,              -- antal børnebilletter
  senior_count    int not null default 0,              -- antal pensionistbilletter
  ticket_code     text unique default upper(substr(md5(random()::text), 1, 8)),
  error_code      text,                                -- fx "MP-408"
  created_at      timestamptz not null default now()
  -- ejer (user_id eller guest_email) sættes efter reservationen via attach_booking_owner()
);

create table booking_seats (
  booking_id  uuid   not null references bookings(id) on delete cascade,
  showtime_id bigint not null references showtimes(id) on delete cascade,
  seat_id     bigint not null references seats(id) on delete cascade,
  primary key (booking_id, seat_id),
  unique (showtime_id, seat_id)          -- samme sæde kan ikke bookes to gange
);

-- Optagede sæder til sædevalget (ingen persondata)
create view taken_seats with (security_invoker = false) as
select bs.showtime_id, bs.seat_id
from booking_seats bs
join bookings b on b.id = bs.booking_id
where b.status = 'paid'
   or (b.status = 'reserved' and b.reserved_until > now());

-- Prisen for en booking: voksenpris for hvert sæde minus fradraget for børn og pensionister.
-- Fradragene er de samme som i lib/ticket-types.js (Barn 45 kr., Pensionist 30 kr.)
create or replace function public.ticket_total(p_price int, p_seats int, p_child int, p_senior int)
returns int
language sql immutable as $$
  select p_price * p_seats - 45 * p_child - 30 * p_senior
$$;

-- Reservér sæder atomisk ("Vi popper dine pladser …").
-- p_child_count og p_senior_count: hvor mange af billetterne der er til børn og pensionister.
-- Alle gamle udgaver slettes først, så der kun findes én reserve_seats
do $$
declare f regprocedure;
begin
  for f in select oid::regprocedure from pg_proc
            where proname = 'reserve_seats' and pronamespace = 'public'::regnamespace
  loop
    execute 'drop function ' || f;
  end loop;
end $$;
create or replace function public.reserve_seats(
  p_showtime_id    bigint,
  p_seat_ids       bigint[],
  p_guest_email    text default null,
  p_guest_name     text default null,
  p_child_count    int  default 0,
  p_senior_count   int  default 0
) returns bookings
language plpgsql security definer set search_path = public as $$
declare
  v_booking bookings;
  v_price   int;
  v_seats   int := coalesce(array_length(p_seat_ids, 1), 0);
begin
  if p_child_count < 0 or p_senior_count < 0 or p_child_count + p_senior_count > v_seats then
    raise exception 'Antallet af billetter passer ikke med sæderne';
  end if;

  -- slet alle udløbne reservationer, så tabellen kun har igangværende og betalte køb (sæderne slettes med)
  delete from bookings
   where status = 'reserved' and reserved_until < now();

  select price_dkk into v_price from showtimes where id = p_showtime_id;
  if v_price is null then raise exception 'Forestillingen findes ikke'; end if;

  insert into bookings (showtime_id, user_id, guest_email, guest_name, total_dkk, child_count, senior_count)
  values (p_showtime_id, auth.uid(), p_guest_email, p_guest_name,
          public.ticket_total(v_price, v_seats, p_child_count, p_senior_count),
          p_child_count, p_senior_count)
  returning * into v_booking;

  insert into booking_seats (booking_id, showtime_id, seat_id)
  select v_booking.id, p_showtime_id, unnest(p_seat_ids);   -- fejler hvis et sæde er taget

  return v_booking;
end $$;

-- Skift billettyper på en reservation med de samme sæder (fx en voksen bliver til et barn).
-- Prisen regnes ud igen. Kun en reservation uden ejer, eller ens egen, kan ændres
create or replace function public.update_booking_tickets(
  p_booking_id     uuid,
  p_child_count    int default 0,
  p_senior_count   int default 0
) returns bookings
language plpgsql security definer set search_path = public as $$
declare
  v_booking bookings;
  v_price   int;
  v_seats   int;
begin
  select s.price_dkk, (select count(*) from booking_seats bs where bs.booking_id = b.id)
    into v_price, v_seats
    from bookings b join showtimes s on s.id = b.showtime_id
   where b.id = p_booking_id;

  if p_child_count < 0 or p_senior_count < 0 or p_child_count + p_senior_count > coalesce(v_seats, 0) then
    raise exception 'Antallet af billetter passer ikke med sæderne';
  end if;

  update bookings
     set total_dkk    = public.ticket_total(v_price, v_seats, p_child_count, p_senior_count),
         child_count  = p_child_count,
         senior_count = p_senior_count
   where id = p_booking_id
     and status = 'reserved'
     and reserved_until > now()
     and (user_id is null or user_id = auth.uid())
  returning * into v_booking;

  if v_booking.id is null then
    raise exception 'Reservationen findes ikke, er udløbet eller tilhører en anden';
  end if;
  return v_booking;
end $$;

-- Knyt ejer (indlogget bruger eller gæst) til en reservation bagefter
create or replace function public.attach_booking_owner(
  p_booking_id  uuid,
  p_guest_email text default null,
  p_guest_name  text default null
) returns bookings
language plpgsql security definer set search_path = public as $$
declare v_booking bookings;
begin
  if auth.uid() is null and coalesce(trim(p_guest_email), '') = '' then
    raise exception 'Log ind eller angiv en e-mail for at fortsætte som gæst';
  end if;

  update bookings
     set user_id     = auth.uid(),
         guest_email = case when auth.uid() is null then p_guest_email else null end,
         guest_name  = case when auth.uid() is null then p_guest_name  else null end
   where id = p_booking_id
     and status = 'reserved'
     and reserved_until > now()
     and user_id is null                    -- en andens booking kan ikke overtages
  returning * into v_booking;

  if v_booking.id is null then
    raise exception 'Reservationen findes ikke, er udløbet eller tilhører en anden';
  end if;
  return v_booking;
end $$;

-- Slip en reservation igen (når man går tilbage og vælger andre sæder).
-- Kun en reservation uden ejer, eller ens egen, kan slippes
create or replace function public.release_booking(p_booking_id uuid)
returns void
language plpgsql security definer set search_path = public as $$
begin
  -- reservationen slettes, og dens sæder slettes med (on delete cascade)
  delete from bookings
   where id = p_booking_id
     and status = 'reserved'
     and ((user_id is null and guest_email is null) or user_id = auth.uid());
end $$;

-- Gennemfør / afvis betaling (simuleret i prototypen) - kræver ejer og aktiv reservation
create or replace function public.complete_payment(
  p_booking_id uuid,
  p_method     payment_method,
  p_success    boolean default true,
  p_error_code text default null
) returns bookings
language plpgsql security definer set search_path = public as $$
declare v_booking bookings;
begin
  update bookings
     set payment_method = p_method,
         status     = case when p_success then 'paid'::booking_status else status end,
         error_code = case when p_success then null else p_error_code end
   where id = p_booking_id
     and status = 'reserved'
     and reserved_until > now()
     and (user_id is not null or guest_email is not null)
     and (user_id = auth.uid() or user_id is null)
  returning * into v_booking;

  if v_booking.id is null then
    raise exception 'Reservationen er udløbet, betalt eller mangler login/gæsteoplysninger';
  end if;

  if p_success and v_booking.user_id is not null then
    update profiles set points = points + v_booking.total_dkk / 10
     where id = v_booking.user_id;
  end if;
  return v_booking;
end $$;

-- ---------- ROW LEVEL SECURITY --------------------------------------
alter table cities        enable row level security;
alter table cinemas       enable row level security;
alter table halls         enable row level security;
alter table seats         enable row level security;
alter table movies        enable row level security;
alter table showtimes     enable row level security;
alter table profiles      enable row level security;
alter table bookings      enable row level security;
alter table booking_seats enable row level security;

-- Offentligt katalog: alle må læse
create policy "public read" on cities    for select using (true);
create policy "public read" on cinemas   for select using (true);
create policy "public read" on halls     for select using (true);
create policy "public read" on seats     for select using (true);
create policy "public read" on movies    for select using (true);
create policy "public read" on showtimes for select using (true);

-- Profiler: kun egen
create policy "own profile read"   on profiles for select using (auth.uid() = id);
create policy "own profile update" on profiles for update using (auth.uid() = id);

-- Bookinger: indloggede ser egne (gæster får bookingen retur fra reserve_seats)
create policy "own bookings" on bookings for select using (auth.uid() = user_id);
create policy "own booking seats" on booking_seats for select
  using (exists (select 1 from bookings b where b.id = booking_id and b.user_id = auth.uid()));

grant select on taken_seats to anon, authenticated;
grant execute on function public.reserve_seats(bigint, bigint[], text, text, int, int) to anon, authenticated;
grant execute on function public.complete_payment to anon, authenticated;
grant execute on function public.attach_booking_owner to anon, authenticated;
grant execute on function public.release_booking to anon, authenticated;
grant execute on function public.update_booking_tickets to anon, authenticated;

-- =====================================================================
--  TESTDATA
-- =====================================================================
insert into cities (name, slug) values
  ('København', 'koebenhavn'), ('Aarhus', 'aarhus'),
  ('Odense', 'odense'), ('Aalborg', 'aalborg');

insert into cinemas (city_id, name, slug, address) values
  ((select id from cities where slug='koebenhavn'), 'Palads',       'palads',      'Axeltorv 9, 1609 København V'),
  ((select id from cities where slug='koebenhavn'), 'Imperial',     'imperial',    'Ved Vesterport 4, 1612 København V'),
  ((select id from cities where slug='aarhus'),     'Aarhus C',     'aarhus-c',    'Sankt Knuds Torv 15, 8000 Aarhus C'),
  ((select id from cities where slug='odense'),     'Odense',       'odense',      'Kongensgade 35, 5000 Odense C'),
  ((select id from cities where slug='aalborg'),    'Aalborg City', 'aalborg-city','Kennedy Arkaden 1, 9000 Aalborg');

-- 4 sale pr. biograf (Figma "Sal/1" … "Sal/7"). Alle har Bio 1 og Bio 5 (4DX).
-- Den 3. og 4. sal skifter mellem biograferne, så salene varierer: Bio 3 + Bio 7 eller Bio 6 + Bio 4.
insert into halls (cinema_id, name)
select c.id, n.name
from (select id, row_number() over (order by id) as nr from cinemas) c
cross join lateral (values
  ('Bio 1'), ('Bio 5'),
  (case when c.nr % 2 = 1 then 'Bio 3' else 'Bio 6' end),
  (case when c.nr % 2 = 1 then 'Bio 7' else 'Bio 4' end)
) n(name);

-- Sæderne i hver sal - tegnet efter Figma (se seed_hall_seats for tegnene)
select public.seed_hall_seats(h.id, l.layout)
from halls h
join (values
  ('Bio 1', array[
    '..SSSSSSSSSSSSSSSSHH...',
    '..SSSSSSSSSSSSSSSSSSS..',
    '..SSSSSSSSSSSSSSSSSSS..',
    '..SSSSSSSSSSSSSSSSSSS..',
    '..SSSSSSSSSSSSSSSSSSS..',
    '..SSSSSSSSSSSSSSSSSSS..',
    '..SSSSSSSSSSSSSSSSSSS..',
    'SSSSSSS.........SSSSSSS']),
  ('Bio 3', array[
    'SSSSSSSSS',
    'SSSSSSSSS',
    'SSSSSSSSS',
    '.HHSSSSSS']),
  ('Bio 4', array[
    'SSSSSSSSS',
    'SSSSSSSSS',
    'SSSSSSSSS',
    'SSSSSSHH.']),
  ('Bio 5', array[
    'SSSS..SSSS..SSSS',
    'SSSS..SSSS..SSSS',
    'SSSS..SSSS..SSSS',
    'SSSS..SSSS..SSSS',
    'SSSS..SSSS..SSSS',
    'SSSS..SSSS..SSSS',
    'SSSS..SSSS..SSSS',
    'SSSH..HSSH..HSSS']),
  ('Bio 6', array[
    '..SSSSS..',
    'SSSSSSSSS',
    'SSSSSSSSS',
    'SSSSSSSSS',
    '.HHSSSSSS']),
  ('Bio 7', array[
    'SSSSSSSSSSS',
    'SSSSSSSSSSS',
    'SSSSSSSSSSS',
    'SSSSSSSSSHH'])
) l(name, layout) on l.name = h.name;

insert into movies (title, slug, short_description, director, cast_members,
                    genres, age_rating, duration_min, language, status, rating, review_count)
values
  ('Clayface', 'clayface',
   'Efter en ulykke vansiret af en gangster, får filmstjernen Matt Hagen evnen til at forme sin krop som ler.',
   'James Watkins', array['Tom Rhys Harries','Naomi Ackie','David Dencik','Max Minghella','Eddie Marsan'],
   array['Thriller'], '15 år', 108, 'Engelsk tale', 'now_playing', 5.0, 597),
  ('The Hunger Games: Sunrise on the Reaping', 'sunrise-on-the-reaping', null,
   null, '{}', array['Action','Eventyr'], '15 år', null, 'Engelsk tale', 'coming_soon', null, 0);

-- Spilletider de næste 7 dage for Clayface i alle biografer.
-- Salen skifter med dag og tidspunkt, så filmen ikke altid går i den samme sal.
insert into showtimes (movie_id, hall_id, starts_at, price_dkk)
select (select id from movies where slug='clayface'), h.id,
       date_trunc('day', now()) + d * interval '1 day' + t.tid,
       135
from (select id, row_number() over (partition by cinema_id order by id) - 1 as idx from halls) h,
     generate_series(0, 6) d,
     unnest(array[interval '17 hours', interval '19 hours 30 minutes', interval '21 hours 45 minutes'])
       with ordinality t(tid, nr)
where h.idx = (d + t.nr) % 4;

-- Aktuelle film, hvis premiere er mere end 30 dage siden, får en premiere i løbet af de sidste 20 dage.
-- Så har de stadig spilletider (se blokken nedenfor). Kørt i Supabase 20. nov 2026.
update movies
set premiere_date = current_date - (id % 20)::int
where status = 'now_playing' and premiere_date + 29 < current_date;

-- Spilletider for alle aktuelle og kommende film: 30 dage fra premieren.
-- Kl. 17.00 og 21.45 er 2D (135 kr.), kl. 19.30 er 4DX (175 kr.).
-- Tiderne skubbes 5 min pr. film. Salene fordeles bagefter (se blokken nedenfor).
-- Kør den igen efter import af nye film - tider, der allerede findes, springes over.
insert into showtimes (movie_id, hall_id, starts_at, format, price_dkk)
select m.id, h.id,
       ((m.premiere_date + d) + t + (m.id / 4) * interval '5 minutes') at time zone 'Europe/Copenhagen',
       case when t = time '19:30' then '4DX' else '2D' end,
       case when t = time '19:30' then 175 else 135 end
from movies m
join (select id, row_number() over (partition by cinema_id order by id) - 1 as idx from halls) h
  on h.idx = m.id % 4
cross join generate_series(0, 29) d
cross join unnest(array[time '17:00', time '19:30', time '21:45']) t
where m.status in ('now_playing', 'coming_soon')
  and m.premiere_date is not null
  and m.premiere_date + 29 >= current_date
on conflict (hall_id, starts_at) do nothing;

-- Fordel spilletiderne på salene, så salen skifter med dag og klokkeslæt.
-- Film, der starter samtidig i samme biograf, får hver sin sal. Kørt i Supabase 20. nov 2026.
begin;

-- Reglen "én film pr. sal pr. starttid" slås fra, mens vi bytter rundt (ellers fejler byt mellem to sale)
alter table showtimes drop constraint showtimes_hall_id_starts_at_key;

-- Flyt hver spilletid til en sal i samme biograf.
-- Salen skifter med dag + time, og film, der starter samtidig, får hver sin sal.
with ranked as (
  select s.id, s.starts_at, h.cinema_id,
         row_number() over (partition by h.cinema_id, s.starts_at order by s.movie_id, s.id) - 1 as rank_in_slot
  from showtimes s
  join halls h on h.id = s.hall_id
),
cinema_halls as (
  select id as hall_id, cinema_id,
         row_number() over (partition by cinema_id order by id) - 1 as idx,
         count(*) over (partition by cinema_id) as n
  from halls
),
target as (
  select r.id, ch.hall_id
  from ranked r
  join cinema_halls ch
    on ch.cinema_id = r.cinema_id
   and ch.idx = (r.rank_in_slot
                 + extract(doy  from r.starts_at at time zone 'Europe/Copenhagen')::int
                 + extract(hour from r.starts_at at time zone 'Europe/Copenhagen')::int) % ch.n
)
update showtimes s
set hall_id = t.hall_id
from target t
where t.id = s.id
  and s.hall_id <> t.hall_id;

-- Slå reglen til igen (tjekker samtidig, at ingen sal har to film på samme tid)
alter table showtimes add constraint showtimes_hall_id_starts_at_key unique (hall_id, starts_at);

-- Bookede sæder, der hører til den gamle sal, passer ikke længere - de fjernes
delete from booking_seats bs
using showtimes s, seats se
where bs.showtime_id = s.id
  and se.id = bs.seat_id
  and se.hall_id <> s.hall_id;

commit;

-- 3D og 70MM: den sene forestilling (kl. 21.45) bliver 3D eller 70MM for udvalgte film.
-- Kl. 17.00 forbliver 2D og kl. 19.30 forbliver 4DX. 3D koster 155 kr., 70MM koster 165 kr.
-- Filmene findes på deres slug. Tiden er skubbet lidt pr. film, så "efter kl. 21" rammer den sene forestilling.
update showtimes s
set format    = case when m.slug in ('0-0', 'katten-med-hatten', 'den-store-diamantjagt') then '3D' else '70MM' end,
    price_dkk = case when m.slug in ('0-0', 'katten-med-hatten', 'den-store-diamantjagt') then 155 else 165 end
from movies m
where m.id = s.movie_id
  and m.slug in ('0-0', 'katten-med-hatten', 'den-store-diamantjagt', 'sunrise-on-the-reaping', 'rose')
  and extract(hour from s.starts_at at time zone 'Europe/Copenhagen') >= 21;

-- Nye biografer: sale, sæder og spilletider til de biografer, der ikke har nogen spilletider endnu.
-- De gamle biografer røres ikke. Kan køres igen, hvis der kommer flere biografer.
begin;

-- De biografer, der mangler spilletider
create temp table new_cinemas on commit drop as
select c.id from cinemas c
where not exists (select 1 from halls h join showtimes s on s.hall_id = h.id where h.cinema_id = c.id);

-- 1. Fire sale pr. ny biograf (samme fordeling som de andre: Bio 1, Bio 5 og Bio 3 + 7 eller Bio 6 + 4)
insert into halls (cinema_id, name)
select c.id, n.name
from (select id, row_number() over (order by id) as nr from cinemas) c
cross join lateral (values
  ('Bio 1'), ('Bio 5'),
  (case when c.nr % 2 = 1 then 'Bio 3' else 'Bio 6' end),
  (case when c.nr % 2 = 1 then 'Bio 7' else 'Bio 4' end)
) n(name)
where c.id in (select id from new_cinemas)
  and not exists (select 1 from halls h where h.cinema_id = c.id);

-- 2. Sæderne i de nye sale (samme tegninger som de andre sale)
select public.seed_hall_seats(h.id, l.layout)
from halls h
join (values
  ('Bio 1', array[
    '..SSSSSSSSSSSSSSSSHH...',
    '..SSSSSSSSSSSSSSSSSSS..',
    '..SSSSSSSSSSSSSSSSSSS..',
    '..SSSSSSSSSSSSSSSSSSS..',
    '..SSSSSSSSSSSSSSSSSSS..',
    '..SSSSSSSSSSSSSSSSSSS..',
    '..SSSSSSSSSSSSSSSSSSS..',
    'SSSSSSS.........SSSSSSS']),
  ('Bio 3', array[
    'SSSSSSSSS',
    'SSSSSSSSS',
    'SSSSSSSSS',
    '.HHSSSSSS']),
  ('Bio 4', array[
    'SSSSSSSSS',
    'SSSSSSSSS',
    'SSSSSSSSS',
    'SSSSSSHH.']),
  ('Bio 5', array[
    'SSSS..SSSS..SSSS',
    'SSSS..SSSS..SSSS',
    'SSSS..SSSS..SSSS',
    'SSSS..SSSS..SSSS',
    'SSSS..SSSS..SSSS',
    'SSSS..SSSS..SSSS',
    'SSSS..SSSS..SSSS',
    'SSSH..HSSH..HSSS']),
  ('Bio 6', array[
    '..SSSSS..',
    'SSSSSSSSS',
    'SSSSSSSSS',
    'SSSSSSSSS',
    '.HHSSSSSS']),
  ('Bio 7', array[
    'SSSSSSSSSSS',
    'SSSSSSSSSSS',
    'SSSSSSSSSSS',
    'SSSSSSSSSHH'])
) l(name, layout) on l.name = h.name
where h.cinema_id in (select id from new_cinemas)
  and not exists (select 1 from seats s where s.hall_id = h.id);

-- 3. Spilletider: samme opskrift som de andre biografer (30 dage fra premieren, kl. 17.00, 19.30 og 21.45)
insert into showtimes (movie_id, hall_id, starts_at, format, price_dkk)
select m.id, h.id,
       ((m.premiere_date + d) + t + (m.id / 4) * interval '5 minutes') at time zone 'Europe/Copenhagen',
       case when t = time '19:30' then '4DX' else '2D' end,
       case when t = time '19:30' then 175 else 135 end
from movies m
join (select id, cinema_id, row_number() over (partition by cinema_id order by id) - 1 as idx from halls) h
  on h.idx = m.id % 4
cross join generate_series(0, 29) d
cross join unnest(array[time '17:00', time '19:30', time '21:45']) t
where h.cinema_id in (select id from new_cinemas)
  and m.status in ('now_playing', 'coming_soon')
  and m.premiere_date is not null
  and m.premiere_date + 29 >= current_date
on conflict (hall_id, starts_at) do nothing;

-- 4. Fordel de nye spilletider på salene, så salen skifter med dag og klokkeslæt
alter table showtimes drop constraint showtimes_hall_id_starts_at_key;

with ranked as (
  select s.id, s.starts_at, h.cinema_id,
         row_number() over (partition by h.cinema_id, s.starts_at order by s.movie_id, s.id) - 1 as rank_in_slot
  from showtimes s
  join halls h on h.id = s.hall_id
  where h.cinema_id in (select id from new_cinemas)
),
cinema_halls as (
  select id as hall_id, cinema_id,
         row_number() over (partition by cinema_id order by id) - 1 as idx,
         count(*) over (partition by cinema_id) as n
  from halls
),
target as (
  select r.id, ch.hall_id
  from ranked r
  join cinema_halls ch
    on ch.cinema_id = r.cinema_id
   and ch.idx = (r.rank_in_slot
                 + extract(doy  from r.starts_at at time zone 'Europe/Copenhagen')::int
                 + extract(hour from r.starts_at at time zone 'Europe/Copenhagen')::int) % ch.n
)
update showtimes s
set hall_id = t.hall_id
from target t
where t.id = s.id
  and s.hall_id <> t.hall_id;

alter table showtimes add constraint showtimes_hall_id_starts_at_key unique (hall_id, starts_at);

-- 5. 3D og 70MM på den sene forestilling (samme film og priser som i de andre biografer)
update showtimes s
set format    = case when m.slug in ('0-0', 'katten-med-hatten', 'den-store-diamantjagt') then '3D' else '70MM' end,
    price_dkk = case when m.slug in ('0-0', 'katten-med-hatten', 'den-store-diamantjagt') then 155 else 165 end
from movies m
where m.id = s.movie_id
  and m.slug in ('0-0', 'katten-med-hatten', 'den-store-diamantjagt', 'sunrise-on-the-reaping', 'rose')
  and extract(hour from s.starts_at at time zone 'Europe/Copenhagen') >= 21;

commit;


-- Udløbne reservationer slettes automatisk hvert minut (Supabase pg_cron).
-- Så har bookings kun igangværende og betalte køb. Sæderne slettes med (on delete cascade).
create extension if not exists pg_cron;
select cron.schedule(
  'slet-udloebne-reservationer',
  '* * * * *',
  $$delete from public.bookings where status = 'reserved' and reserved_until < now()$$
);
