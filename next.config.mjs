/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // De kvaliteter <Image quality={...}> må bruge. 75 er standard,
    // 90 bruges til store billeder, der skal se skarpe ud, fx på Log ind.
    qualities: [75, 90],
  },
};

export default nextConfig;
