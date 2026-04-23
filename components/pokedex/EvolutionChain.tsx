import Link from 'next/link';
import { SpriteImage } from './SpriteImage';
import type { Pokemon, Evolution } from '@/lib/pokemon/types';
import styles from './EvolutionChain.module.css';

interface EvolutionChainProps {
  chain: Pokemon[];
  evolutions: Evolution[];
  currentId: number;
}

export function EvolutionChain({ chain, evolutions, currentId }: EvolutionChainProps) {
  if (chain.length <= 1) return null;

  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>Evolution chain</h2>
      <div className={styles.chain}>
        {chain.map((pokemon, i) => {
          const evo = i > 0
            ? evolutions.find((e) => e.to_id === pokemon.id)
            : null;

          return (
            <div key={pokemon.id} className={styles.step}>
              {evo && (
                <div className={styles.arrow}>
                  <span className={styles.arrowIcon}>→</span>
                  {evo.trigger && (
                    <span className={styles.trigger}>
                      {evo.trigger === 'level-up' && evo.trigger_value
                        ? `Lv. ${evo.trigger_value}`
                        : evo.trigger.replace(/-/g, ' ')}
                    </span>
                  )}
                </div>
              )}
              <Link
                href={`/pokedex/${pokemon.slug}`}
                className={`${styles.mon}${pokemon.id === currentId ? ` ${styles.current}` : ''}`}
              >
                <SpriteImage
                  src={pokemon.sprite_url}
                  name={pokemon.name}
                  size={64}
                  className={styles.sprite}
                />
                <span className={styles.name}>{pokemon.name}</span>
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}
