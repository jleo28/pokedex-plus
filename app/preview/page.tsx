import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Toggle } from '@/components/ui/Toggle';

export default function PreviewPage() {
  return (
    <main style={{ padding: 'var(--space-8)', display: 'flex', flexDirection: 'column', gap: 'var(--space-8)', maxWidth: 800 }}>
      <section>
        <h2 style={{ fontFamily: 'var(--font-pixel)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)' }}>
          BUTTONS
        </h2>
        <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap', alignItems: 'center' }}>
          <Button variant="primary">CATCH</Button>
          <Button variant="secondary">VIEW DEX</Button>
          <Button variant="ghost">Learn more</Button>
          <Button variant="primary" size="sm">SM</Button>
          <Button variant="primary" size="lg">LG PRIMARY</Button>
          <Button variant="primary" disabled>DISABLED</Button>
        </div>
      </section>

      <section>
        <h2 style={{ fontFamily: 'var(--font-pixel)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)' }}>
          CARDS
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-5)' }}>
          <Card>
            <p style={{ fontFamily: 'var(--font-pixel)', fontSize: 'var(--text-xs)' }}>CHARIZARD</p>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', color: 'var(--ink-soft)' }}>#006</p>
          </Card>
          <Card flat>
            <p style={{ fontFamily: 'var(--font-pixel)', fontSize: 'var(--text-xs)' }}>FLAT CARD</p>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', color: 'var(--ink-soft)' }}>No shadow</p>
          </Card>
        </div>
      </section>

      <section>
        <h2 style={{ fontFamily: 'var(--font-pixel)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)' }}>
          INPUTS
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', maxWidth: 320 }}>
          <Input placeholder="Search Pokémon..." />
          <Input label="NAME" id="name-input" placeholder="Charizard" />
          <Input label="DISABLED" disabled placeholder="Unavailable" />
        </div>
      </section>

      <section>
        <h2 style={{ fontFamily: 'var(--font-pixel)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)' }}>
          BADGES
        </h2>
        <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          <Badge color="var(--type-fire)">fire</Badge>
          <Badge color="var(--type-water)">water</Badge>
          <Badge color="var(--type-grass)">grass</Badge>
          <Badge color="var(--type-electric)">electric</Badge>
          <Badge color="var(--type-psychic)">psychic</Badge>
          <Badge color="var(--type-dragon)">dragon</Badge>
          <Badge color="var(--accent-yellow)" style={{ color: 'var(--ink)' }}>legendary</Badge>
        </div>
      </section>

      <section>
        <h2 style={{ fontFamily: 'var(--font-pixel)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)' }}>
          TOGGLES
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <Toggle label="SOUND OFF" />
          <Toggle label="CRT OVERLAY" defaultChecked />
          <Toggle label="NIGHT MODE" />
        </div>
      </section>
    </main>
  );
}
