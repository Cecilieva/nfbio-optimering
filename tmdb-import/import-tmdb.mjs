// ---------------------------------------------------------------
//  Importér film fra TMDB → Supabase (movies + testspilletider)
//  Kør:  node import-tmdb.mjs
//  Kræver Node 18+ og en .env-fil (se .env.example)
// ---------------------------------------------------------------
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const {
  TMDB_READ_ACCESS_TOKEN,
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  MAX_MOVIES = '20',
  CREATE_SHOWTIMES = 'true',
} = process.env;

if (!TMDB_READ_ACCESS_TOKEN || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Mangler værdier i .env – se .env.example');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const IMG = 'https://image.tmdb.org/t/p';

// ---------- TMDB-hjælpere ---------------------------------------
async function tmdb(path, params = {}) {
  const url = new URL(`https://api.themoviedb.org/3${path}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${TMDB_READ_ACCESS_TOKEN}`, accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`TMDB ${res.status} på ${path}: ${await res.text()}`);
  return res.json();
}

async function list(endpoint, pages = 2) {
  const out = [];
  for (let page = 1; page <= pages; page++) {
    const data = await tmdb(endpoint, { language: 'da-DK', region: 'DK', page });
    out.push(...data.results);
    if (page >= data.total_pages) break;
  }
  return out;
}

function slugify(s) {
  return s
    .toLowerCase()
    .replace(/æ/g, 'ae').replace(/ø/g, 'oe').replace(/å/g, 'aa')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Dansk censur fra TMDB ("A", "7", "11", "15") → tekst til chips
function danishRating(releaseDates) {
  const dk = releaseDates?.results?.find((r) => r.iso_3166_1 === 'DK');
  const cert = dk?.release_dates?.map((d) => d.certification).find(Boolean);
  if (!cert) return null;
  if (cert === 'A') return 'Tilladt for alle';
  return `${cert} år`;
}

const LANG = { en: 'Engelsk tale', da: 'Dansk tale', sv: 'Svensk tale', no: 'Norsk tale',
  fr: 'Fransk tale', de: 'Tysk tale', es: 'Spansk tale', ja: 'Japansk tale', ko: 'Koreansk tale' };

function pickTrailer(videos) {
  const yt = (videos?.results ?? []).filter((v) => v.site === 'YouTube');
  const best =
    yt.find((v) => v.type === 'Trailer' && v.iso_639_1 === 'da') ??
    yt.find((v) => v.type === 'Trailer' && v.official) ??
    yt.find((v) => v.type === 'Trailer') ??
    yt[0];
  return best ? `https://www.youtube.com/watch?v=${best.key}` : null;
}

async function details(id, status) {
  const m = await tmdb(`/movie/${id}`, {
    language: 'da-DK',
    append_to_response: 'credits,videos,release_dates',
    include_video_language: 'da,en,null',
  });

  // Mangler dansk resumé? Brug det engelske.
  let overview = m.overview;
  if (!overview) overview = (await tmdb(`/movie/${id}`, { language: 'en-US' })).overview;

  return {
    tmdb_id: m.id,
    title: m.title,
    slug: slugify(m.title),
    tagline: m.tagline || null,
    short_description: overview ? overview.split(/(?<=\.)\s/)[0] : null,
    description: overview || null,
    director: m.credits?.crew?.find((c) => c.job === 'Director')?.name ?? null,
    cast_members: (m.credits?.cast ?? []).slice(0, 6).map((c) => c.name),
    genres: (m.genres ?? []).map((g) => g.name),
    age_rating: danishRating(m.release_dates),
    duration_min: m.runtime || null,
    language: LANG[m.original_language] ?? null,
    premiere_date: m.release_date || null,
    status,
    poster_url: m.poster_path ? `${IMG}/w500${m.poster_path}` : null,
    hero_url: m.backdrop_path ? `${IMG}/w1280${m.backdrop_path}` : null,
    trailer_url: pickTrailer(m.videos),
    // TMDB giver 0–10 → omregnet til 0–6 bjørne
    rating: m.vote_average ? Math.round((m.vote_average / 10) * 6 * 10) / 10 : null,
    review_count: m.vote_count ?? 0,
  };
}

// ---------- Spilletider til nye film ----------------------------
async function createShowtimes(movies) {
  const { data: halls, error } = await supabase.from('halls').select('id, name');
  if (error) throw error;

  // Clayface-testdata bruger Sal 1 og 4 → nye film fordeles på Sal 2 og 3
  const freeHalls = halls.filter((h) => h.name === 'Sal 2' || h.name === 'Sal 3');
  const slots = ['13:15', '15:45', '18:00', '20:30', '22:00'];
  const rows = [];

  movies.forEach((movie, i) => {
    freeHalls.forEach((hall, j) => {
      if ((i + j) % 2 !== 0) return;                    // hver film i ca. halvdelen af salene
      for (let day = 0; day < 7; day++) {
        const [h, min] = slots[(i + day) % slots.length].split(':').map(Number);
        const d = new Date();
        d.setDate(d.getDate() + day);
        d.setHours(h, min, 0, 0);
        rows.push({ movie_id: movie.id, hall_id: hall.id, starts_at: d.toISOString(),
                    price_dkk: 135, format: '2D' });
      }
    });
  });

  // Samme sal + tidspunkt springes over i stedet for at fejle
  const { error: e2, count } = await supabase
    .from('showtimes')
    .upsert(rows, { onConflict: 'hall_id,starts_at', ignoreDuplicates: true, count: 'exact' });
  if (e2) throw e2;
  console.log(`🎟️  ${count ?? rows.length} spilletider oprettet`);
}

// ---------- Kør -------------------------------------------------
async function main() {
  const max = Number(MAX_MOVIES);
  console.log('🎬 Henter film fra TMDB …');

  const nowPlaying = await list('/movie/now_playing');
  const upcoming = await list('/movie/upcoming', 1);

  const queue = [
    ...nowPlaying.slice(0, max).map((m) => [m.id, 'now_playing']),
    ...upcoming
      .filter((u) => !nowPlaying.some((n) => n.id === u.id))
      .slice(0, Math.ceil(max / 2))
      .map((m) => [m.id, 'coming_soon']),
  ];

  const rows = [];
  const seenSlugs = new Set();
  for (const [id, status] of queue) {
    try {
      const row = await details(id, status);
      // Non-Latin titles (e.g. Korean, Hindi) slugify to "" → no working film page, so skip them
      if (!row.slug) {
        console.warn(`  ⚠️  Sprang "${row.title}" over: titlen giver ingen gyldig slug`);
        continue;
      }
      if (seenSlugs.has(row.slug)) row.slug = `${row.slug}-${row.tmdb_id}`;
      seenSlugs.add(row.slug);
      rows.push(row);
      console.log(`  ✓ ${row.title}`);
    } catch (err) {
      console.warn(`  ⚠️  Sprang film ${id} over: ${err.message}`);
    }
  }

  // upsert på slug → eksisterende film (fx Clayface) bliver opdateret i stedet for dubleret
  const { data: saved, error } = await supabase
    .from('movies')
    .upsert(rows, { onConflict: 'slug' })
    .select('id, title, status');
  if (error) throw error;
  console.log(`💾 ${saved.length} film gemt i Supabase`);

  if (CREATE_SHOWTIMES === 'true') {
    await createShowtimes(saved.filter((m) => m.status === 'now_playing'));
  }
  console.log('✅ Færdig');
}

main().catch((err) => {
  console.error('❌', err.message ?? err);
  process.exit(1);
});
