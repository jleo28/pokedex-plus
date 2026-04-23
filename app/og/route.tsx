import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: '#f4f1ea',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '80px',
          fontFamily: 'monospace',
          border: '16px solid #2c2c2c',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0px', marginBottom: '24px' }}>
          <span style={{ fontSize: '96px', fontWeight: 'bold', color: '#2c2c2c', letterSpacing: '-2px' }}>
            Pokédex
          </span>
          <span style={{ fontSize: '96px', fontWeight: 'bold', color: '#cc0000', letterSpacing: '-2px' }}>
            ++
          </span>
        </div>
        <p style={{ fontSize: '32px', color: '#6b6457', margin: '0 0 48px', maxWidth: '700px', lineHeight: '1.4' }}>
          386 Pokémon · Team Builder · ML Predictions
        </p>
        <div style={{ display: 'flex', gap: '16px' }}>
          {['Pokédex', 'Team', 'Lab', 'Compare'].map((label) => (
            <div
              key={label}
              style={{
                padding: '12px 24px',
                border: '3px solid #2c2c2c',
                fontSize: '20px',
                color: '#2c2c2c',
                background: '#e8e3d8',
              }}
            >
              {label}
            </div>
          ))}
        </div>
        <p style={{ position: 'absolute', bottom: '40px', right: '80px', fontSize: '20px', color: '#9c9484', margin: 0 }}>
          pokedexpp.vercel.app
        </p>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
