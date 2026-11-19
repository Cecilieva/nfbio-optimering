/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // De kvaliteter <Image quality={...}> må bruge. 75 er standard,
    // 90 bruges til store billeder, der skal se skarpe ud, fx på Log ind.
    qualities: [75, 90],
    // Filmbilleder fra TMDB, fx de store "Kommer snart"-kort på forsiden
    remotePatterns: [new URL("https://image.tmdb.org/t/p/**")],
  },
};

export default nextConfig;
