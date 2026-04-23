import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPokemonBySlug, getEvolutionChain, getPokemonByIds, getAllPokemon } from '@/lib/pokemon/queries';
import { SpriteImage } from '@/components/pokedex/SpriteImage';
import { TypeBadge } from '@/components/pokedex/TypeBadge';
import { StatBar } from '@/components/pokedex/StatBar';
import { TypeEffectiveness } from '@/components/pokedex/TypeEffectiveness';
import { EvolutionChain } from '@/components/pokedex/EvolutionChain';
import { CryButton } from '@/components/pokedex/CryButton';
import { RelatedPokemon } from '@/components/pokedex/RelatedPokemon';
import styles from './page.module.css';

export const revalidate = 86400;

const STAT_COLORS: Record<string, string> = {
  HP:      'var(--type-poison)',
  Attack:  'var(--type-fighting)',
  Defense: 'var(--type-rock)',
  'Sp.Atk':'var(--type-psychic)',
  'Sp.Def':'var(--type-grass)',
  Speed:   'var(--type-electric)',
};

interface PageProps {
  params: { slug: string };
}

export default async function PokemonDetailPage({ params }: PageProps) {
  const pokemon = await getPokemonBySlug(params.slug);
  if (!pokemon) notFound();

  const [{ evolutions, chain: chainIds }, allPokemon] = await Promise.all([
    getEvolutionChain(pokemon.id),
    getAllPokemon(),
  ]);
  const chainPokemon = chainIds.length > 1 ? await getPokemonByIds(chainIds) : [pokemon];
  const orderedChain = chainIds.map((id) => chainPokemon.find((p) => p.id === id)!).filter(Boolean);

  const stats = [
    { label: 'HP',      value: pokemon.hp },
    { label: 'Attack',  value: pokemon.attack },
    { label: 'Defense', value: pokemon.defense },
    { label: 'Sp.Atk',  value: pokemon.sp_attack },
    { label: 'Sp.Def',  value: pokemon.sp_defense },
    { label: 'Speed',   value: pokemon.speed },
  ];

  return (
    <main className={styles.page}>
      <Link href="/pokedex" className={styles.back}>← Back to Pokédex</Link>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.spriteWrap}>
          <SpriteImage
            src={pokemon.sprite_url}
            name={pokemon.name}
            size={128}
            className={styles.spriteAnimated}
          />
        </div>

        <div className={styles.heroInfo}>
          <span className={styles.dexNumber}>#{String(pokemon.id).padStart(3, '0')}</span>
          <h1 className={styles.name}>{pokemon.name}</h1>

          <div className={styles.types}>
            <TypeBadge type={pokemon.type_primary} />
            {pokemon.type_secondary && <TypeBadge type={pokemon.type_secondary} />}
          </div>

          <div className={styles.heroMeta}>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Gen</span>
              <span className={styles.metaValue}>{pokemon.generation}</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Height</span>
              <span className={styles.metaValue}>{((pokemon.height_dm ?? 0) / 10).toFixed(1)} m</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Weight</span>
              <span className={styles.metaValue}>{((pokemon.weight_hg ?? 0) / 10).toFixed(1)} kg</span>
            </div>
            {pokemon.is_legendary && (
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>&#8203;</span>
                <span className={styles.metaValue}>Legendary</span>
              </div>
            )}
          </div>

          <div className={styles.cryWrap}>
            {pokemon.cry_url && <CryButton cryUrl={pokemon.cry_url} name={pokemon.name} />}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className={styles.statsSection}>
        <h2 className={styles.sectionHeading}>Base stats</h2>
        <div className={styles.statsGrid}>
          {stats.map(({ label, value }) => (
            <StatBar
              key={label}
              label={label}
              value={value}
              color={STAT_COLORS[label]}
            />
          ))}
        </div>
        <div className={styles.bstRow}>
          <span className={styles.bstLabel}>Total</span>
          <span className={styles.bstValue}>{pokemon.base_stat_total}</span>
        </div>
      </section>

      {/* Type effectiveness */}
      <TypeEffectiveness
        type1={pokemon.type_primary}
        type2={pokemon.type_secondary}
      />

      {/* Evolution chain */}
      {orderedChain.length > 1 && (
        <EvolutionChain
          chain={orderedChain}
          evolutions={evolutions}
          currentId={pokemon.id}
        />
      )}

      <section>
        <h2 className={styles.sectionHeading}>Related Pokémon</h2>
        <RelatedPokemon current={pokemon} all={allPokemon} />
      </section>
    </main>
  );
}
