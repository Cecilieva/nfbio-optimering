-- =====================================================================
--  Nordisk Film Biografer – DUI eksamensprojekt
--  Supabase-skema baseret på Figma-flowet:
--  Vælg by → Forside → Film + spilletider → Sædevalg → (reservation)
--  → Log ind/gæst → Betaling (MobilePay / kort / gavekort) → Billet
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
  type        seat_type not null default 'standard',
  unique (hall_id, row_number, seat_number)
);

-- ---------- FILM & SPILLETIDER --------------------------------------
create table movies (
  id            bigint generated always as identity primary key,
  tmdb_id       int unique,                -- id fra The Movie Database
  title         text not null,
  slug          text not null unique,
  tagline       text,                      -- "Han kan blive hvem som helst. Også dig."
  short_description text,
  description   text,                      -- "Om filmen"
  director      text,
  cast_members  text[] default '{}',
  genres        text[] default '{}',       -- chips: Thriller …
  age_rating    text,                      -- "15 år"
  duration_min  int,                       -- 108 → "1 t 48 min"
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
  format     text not null default '2D',   -- 2D / 3D / IMAX / Dolby
  price_dkk  int  not null default 130,
  unique (hall_id, starts_at)
);
create index on showtimes (movie_id, starts_at);

-- ---------- PROFILER -------------------------------------------------
create table profiles (
  id                  uuid primary key references auth.users(id) on delete cascade,
  full_name           text,
  phone               text,
  points              int not null default 0,
  favorite_cinema_id  bigint references cinemas(id) on delete set null,
  created_at          timestamptz not null default now()
);

-- Opret automatisk en profil når en bruger signer op
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
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
  status          booking_status not null default 'reserved',
  reserved_until  timestamptz not null default now() + interval '10 minutes', -- nedtælling
  payment_method  payment_method,
  total_dkk       int not null default 0,
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

-- Reservér sæder atomisk ("Vi popper dine pladser …")
create or replace function public.reserve_seats(
  p_showtime_id bigint,
  p_seat_ids    bigint[],
  p_guest_email text default null,
  p_guest_name  text default null
) returns bookings
language plpgsql security definer set search_path = public as $$
declare
  v_booking bookings;
  v_price   int;
begin
  -- ryd udløbne reservationer for denne forestilling
  update bookings set status = 'expired'
   where showtime_id = p_showtime_id and status = 'reserved' and reserved_until < now();
  delete from booking_seats bs using bookings b
   where bs.booking_id = b.id and b.showtime_id = p_showtime_id and b.status = 'expired';

  select price_dkk into v_price from showtimes where id = p_showtime_id;
  if v_price is null then raise exception 'Forestillingen findes ikke'; end if;

  insert into bookings (showtime_id, user_id, guest_email, guest_name, total_dkk)
  values (p_showtime_id, auth.uid(), p_guest_email, p_guest_name,
          v_price * coalesce(array_length(p_seat_ids, 1), 0))
  returning * into v_booking;

  insert into booking_seats (booking_id, showtime_id, seat_id)
  select v_booking.id, p_showtime_id, unnest(p_seat_ids);   -- fejler hvis et sæde er taget

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

-- Gennemfør / afvis betaling (simuleret i prototypen) – kræver ejer og aktiv reservation
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
grant execute on function public.reserve_seats    to anon, authenticated;
grant execute on function public.complete_payment to anon, authenticated;
grant execute on function public.attach_booking_owner to anon, authenticated;

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

-- 4 sale pr. biograf
insert into halls (cinema_id, name)
select c.id, 'Sal ' || n from cinemas c, generate_series(1, 4) n;

-- 8 rækker (1–8) × 12 sæder pr. sal; bagerste række er couple, række 1 sæde 1–2 handicap
insert into seats (hall_id, row_number, seat_number, type)
select h.id, r, s,
       case when r = 8 then 'couple'
            when r = 1 and s <= 2 then 'handicap'
            else 'standard' end::seat_type
from halls h, generate_series(1, 8) r, generate_series(1, 12) s;

insert into movies (title, slug, tagline, short_description, director, cast_members,
                    genres, age_rating, duration_min, language, status, rating, review_count)
values
  ('Clayface', 'clayface', 'Han kan blive hvem som helst. Også dig.',
   'Efter en ulykke vansiret af en gangster, får filmstjernen Matt Hagen evnen til at forme sin krop som ler.',
   'James Watkins', array['Tom Rhys Harries','Naomi Ackie','David Dencik','Max Minghella','Eddie Marsan'],
   array['Thriller'], '15 år', 108, 'Engelsk tale', 'now_playing', 5.0, 597),
  ('The Hunger Games: Sunrise on the Reaping', 'sunrise-on-the-reaping', null, null,
   null, '{}', array['Action','Eventyr'], '15 år', null, 'Engelsk tale', 'coming_soon', null, 0);

-- Spilletider de næste 7 dage for Clayface i sal 1 og 4 i alle biografer
insert into showtimes (movie_id, hall_id, starts_at, price_dkk)
select (select id from movies where slug='clayface'), h.id,
       date_trunc('day', now()) + d * interval '1 day' + t,
       135
from halls h,
     generate_series(0, 6) d,
     unnest(array[interval '17 hours', interval '19 hours 30 minutes', interval '21 hours 45 minutes']) t
where h.name in ('Sal 1', 'Sal 4');