import { MetadataRoute } from 'next';
import { getAllPokemon } from '@/lib/pokemon/queries';

const BASE = 'https://pokedexpp.vercel.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pokemon = await getAllPokemon();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE,           lastModified: new Date(), changeFrequency: 'monthly',  priority: 1 },
    { url: `${BASE}/pokedex`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/team`,    lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/compare`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/lab`,     lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/lab/predict`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/submit`,  lastModified: new Date(), changeFrequency: 'weekly', priority: 0.5 },
  ];

  const pokemonRoutes: MetadataRoute.Sitemap = pokemon.map((p) => ({
    url: `${BASE}/pokedex/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  return [...staticRoutes, ...pokemonRoutes];
}
