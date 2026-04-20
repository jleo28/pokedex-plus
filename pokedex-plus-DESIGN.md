# Pokédex++ — Design System

**Aesthetic:** Modernized retro. Pixel motifs on a clean modern layout. Not a Game Boy emulator in a browser — the *spirit* of Red/Blue filtered through contemporary web design.

**Design philosophy:** Every retro element must justify itself by either evoking the original games or by serving a functional purpose. If a pixel border doesn't make the UI more readable or more joyful, it gets cut.

---

## 1. Color Palette

Two themes: **Day** (the default, inspired by the white manual covers and bright 90s packaging) and **Night** (the monochrome green of the original DMG Game Boy, repurposed as dark mode).

### Day (default)

| Token | Hex | HSL | Use |
|---|---|---|---|
| `--bg` | `#f4f1ea` | `42 30% 92%` | Page background — warm off-white, like aged manual paper |
| `--surface` | `#ffffff` | `0 0% 100%` | Card backgrounds |
| `--surface-2` | `#ebe7dd` | `42 20% 89%` | Recessed surfaces, inactive tabs |
| `--border` | `#2c2c2c` | `0 0% 17%` | Chunky pixel borders — the signature element |
| `--border-soft` | `#c9c3b5` | `42 15% 75%` | Secondary dividers |
| `--ink` | `#1a1a1a` | `0 0% 10%` | Primary text |
| `--ink-soft` | `#5a5a5a` | `0 0% 35%` | Secondary text |
| `--ink-muted` | `#8a8a8a` | `0 0% 54%` | Tertiary, captions |
| `--accent` | `#dc2626` | `0 72% 51%` | Pokémon Red — primary CTA, "catch" actions |
| `--accent-blue` | `#2563eb` | `221 83% 53%` | Pokémon Blue — secondary CTA, links |
| `--accent-yellow` | `#facc15` | `48 96% 53%` | Pikachu yellow — highlights, warnings, "legendary" |
| `--success` | `#16a34a` | `142 76% 36%` | Confirm states, HP high |
| `--danger` | `#dc2626` | `0 72% 51%` | Destructive actions, HP low |

### Night (dark mode, Game Boy DMG palette, recontextualized)

| Token | Hex | HSL | Use |
|---|---|---|---|
| `--bg` | `#0f380f` | `120 59% 14%` | The darkest DMG green — page background |
| `--surface` | `#1a4d1a` | `120 50% 20%` | Card backgrounds, a shade lighter |
| `--surface-2` | `#306230` | `120 34% 29%` | Recessed surfaces |
| `--border` | `#8bac0f` | `73 86% 36%` | DMG mid-green, functions as our border/ink |
| `--border-soft` | `#4a7a1a` | `86 64% 29%` | Secondary dividers |
| `--ink` | `#9bbc0f` | `72 86% 40%` | DMG brightest green — primary text |
| `--ink-soft` | `#8bac0f` | `73 86% 36%` | Secondary text |
| `--ink-muted` | `#5a8010` | `78 78% 28%` | Tertiary |
| `--accent` | `#9bbc0f` | `72 86% 40%` | Accent IS the brightest green in Night mode |
| `--accent-blue` | `#9bbc0f` | — | Collapses — monochrome palette |
| `--accent-yellow` | `#9bbc0f` | — | Collapses |
| `--success` | `#9bbc0f` | — | Collapses — trust the palette |
| `--danger` | `#f4f1ea` | `42 30% 92%` | Day-mode bg inverts in Night — "danger" shows as a jarring non-green |

**Design note:** Night mode deliberately collapses accents into the 4-color DMG palette. It's a statement mode, not the default. A toggle shows a sun icon (→ Day) or a Game Boy Pocket silhouette (→ Night).

### Type colors (Pokémon types)

Full 18-type palette, authentic to the official game palette but slightly desaturated for web:

```
normal      #a8a77a    fire        #ee8130    water       #6390f0
electric    #f7d02c    grass       #7ac74c    ice         #96d9d6
fighting    #c22e28    poison      #a33ea1    ground      #e2bf65
flying      #a98ff3    psychic     #f95587    bug         #a6b91a
rock        #b6a136    ghost       #735797    dragon      #6f35fc
dark        #705746    steel       #b7b7ce    fairy       #d685ad
```

Used for: type badges, stat bar accents on detail pages, type coverage matrix fills.

---

## 2. Typography

Three families, each with a specific job. No more than three — a common retro-design trap is layering five display fonts and calling it "eclectic."

| Family | Use | Fallback |
|---|---|---|
| **Press Start 2P** | Section labels, headers, UI chrome, buttons | `monospace` |
| **IBM Plex Mono** | Data (stats, numbers, stat bars), code, terminal-like surfaces | `monospace` |
| **Inter** | Body copy, long-form text, anything the user actually reads | `sans-serif` |

**Why not 100% pixel font?** Press Start 2P at body-copy sizes is unreadable and disrespects the user. Use it where it's decoration; use Inter where it's information. This is the central "modernized retro" tension and I'm resolving it in favor of readability.

### Type scale

```
--text-xs:   0.75rem   /12px/   captions, tl-date, metadata
--text-sm:   0.875rem  /14px/   UI labels, badges
--text-base: 1rem      /16px/   body copy
--text-lg:   1.125rem  /18px/   subheadings
--text-xl:   1.5rem    /24px/   section headers (Press Start 2P sized down)
--text-2xl:  2rem      /32px/   page titles
--text-hero: 3rem      /48px/   hero on landing only
```

**Press Start 2P caveat:** its optical size is huge. A `--text-base` rendered in Press Start 2P visually reads as `--text-xl`. Budget accordingly — always drop one size step when switching from Inter to PS2P in the same spot.

### Weights

- Inter: 400 (body), 500 (emphasis), 600 (headings, links)
- IBM Plex Mono: 400, 500
- Press Start 2P: only ships at 400. That's fine; its weight comes from its pixel grid.

---

## 3. Spacing Scale

Based on an 8px grid (a nod to sprite tile sizes). Every value is a multiple of 4px to keep half-steps available.

```
--space-0:  0
--space-1:  0.25rem  /4px/
--space-2:  0.5rem   /8px/
--space-3:  0.75rem  /12px/
--space-4:  1rem     /16px/
--space-5:  1.5rem   /24px/
--space-6:  2rem     /32px/
--space-8:  3rem     /48px/
--space-10: 4rem     /64px/
--space-12: 6rem     /96px/
```

Layout padding rule: sections get `--space-8` vertical, `--space-5` horizontal. Cards get `--space-5` internal padding. Tight grids use `--space-3` gaps.

---

## 4. Component Primitives

### Button

Three variants. All buttons have **chunky pixel borders** — the signature element.

```
┌──────────────┐
│  CATCH  ▸    │    <- primary: 3px solid --border, 2px offset shadow
└──────────────┘       background --accent, text white, PS2P font
     ▒▒▒▒▒▒▒▒▒        on hover: shadow offsets to 0,0 (button "presses in")
```

- **Primary** — `--accent` bg, white text, 3px `--border`, 2px drop-shadow. Hover: shadow collapses to 0, button translates `+2px +2px`.
- **Secondary** — `--surface` bg, `--ink` text, 3px `--border`, 2px drop-shadow. Same press behavior.
- **Ghost** — No border, no bg, `--ink` text, pixel-underline on hover.

### Card

```
┌─────────────────────────┐
│ ┌─sprite─┐  CHARIZARD   │    <- 2px --border, pixel-corner notches
│ │  [::]  │  #006        │       (top-right corner clipped 4×4px)
│ └────────┘  fire/flying │
│                         │
│ ▓▓▓▓▓▓▓▓▓░░░░░ HP 78    │    <- stat bars: IBM Plex Mono numerals,
│ ▓▓▓▓▓▓▓▓▓▓▓░░░ ATK 84   │       type-colored fills, pixel-step
└─────────────────────────┘       animation on appear
```

- Pokédex card: sprite (pixel-rendered, `image-rendering: pixelated`), name in PS2P, stats in IBM Plex Mono.
- Stats use horizontal bars with 10 discrete segments (not smooth). Bars animate in on card mount with a stepped easing (`steps(10, end)`), 400ms total — reads as "filling up" in discrete jumps, reinforcing the pixel language.

### Input

Text inputs, searches, filters — all get the chunky border treatment. Focus state: border color shifts to `--accent-blue`, and a 2px outline offsets to create a "selected" pixel-art feel. No smooth rings, no glow.

### Modal / Dialog

Used for detail views (optional — also supports dedicated routes) and team-slot pickers.

- Full-screen dim overlay (`rgba(0,0,0,0.7)`)
- Modal body: 4px `--border`, `--surface` bg, `--space-8` padding, max-width 640px
- Entry animation: scale from 0.9 → 1.0 over 150ms with a `steps(4)` easing — snappy, not smooth

### Toggle (for CRT overlay, sound, Day/Night)

Classic pixel switch: a rectangular track, a square knob, no rounded corners. 2px border on both track and knob.

### Badge (type pills, "legendary", "shiny available")

Rectangular, 2px border, `--space-1` vertical / `--space-2` horizontal padding, PS2P font at `--text-xs`, uppercase, letter-spaced. Type badges use the type color as background with a darker border.

---

## 5. Motion

**Principle:** every animation is either discrete-stepped (to reinforce the pixel language) or smoothly modern (for things that would look broken if stepped, like scroll-triggered fades). Never mix within a single element.

### Discrete-stepped (use `steps()` easing)

- Stat bars filling
- Button press-in
- Sprite idle bobs (detail page only — sprite rises 2px, holds, drops 2px, loops every 1.2s)
- Type badge appear animation
- Modal scale-in

### Smooth (use cubic-bezier)

- Page transitions (screen-wipe from right, 350ms, `ease-out`)
- Scroll-triggered fades (match jleo.me's 550ms ease)
- Theme toggle (color crossfade, 300ms)
- Chart redraws in `/lab`

### Durations

```
--motion-instant:  100ms   /hover states, focus rings/
--motion-fast:     200ms   /button press, badge appear/
--motion-base:     350ms   /page transitions, modal/
--motion-slow:     550ms   /scroll fades, chart reveals/
```

### Easings

```
--ease-step:    steps(8, end)                  /pixel-art animations/
--ease-snap:    cubic-bezier(0.2, 0.9, 0.3, 1) /page transitions/
--ease-smooth:  cubic-bezier(0.4, 0, 0.2, 1)   /everything else/
```

### CRT overlay (optional, toggleable)

When enabled: fixed full-screen pseudo-element, `pointer-events: none`, two layered backgrounds:
1. Horizontal scanlines: `repeating-linear-gradient(0deg, rgba(0,0,0,0.08) 0, rgba(0,0,0,0.08) 1px, transparent 1px, transparent 3px)`
2. Subtle vignette: radial-gradient, darker at corners

No flicker animation by default (nauseating). A secondary toggle inside settings exposes "CRT flicker" for the true believers.

---

## 6. Sound

**All sound is opt-in, defaulted off, with a persistent mute toggle in the top-right corner next to the theme switch.** State persists in `localStorage`. Autoplay is never triggered.

Three sound families:

| Sound | Trigger | Source |
|---|---|---|
| UI beep | Button clicks, menu navigation | Generated with Web Audio API (cheap, no asset) |
| Confirm chime | Adding Pokémon, saving team | Short 8-bit jingle, self-hosted WAV, <10KB |
| Pokémon cry | Detail page "play cry" button | PokeAPI provides cry URLs for Gen 1–5; self-host at build time |

No ambient background music. A portfolio site that plays Lavender Town on loop is a crime.

---

## 7. Reference Sites / Mood Board

Sites to steal from, organized by what they do well:

**Modernized retro done right:**
- `v0.dev` — pixel accents on a modern grid, restraint
- `lowtechmagazine.com` — 8-bit dithering used *purposefully* (to save bandwidth)
- `ishadeed.com` — not pixel, but exemplary "clean layout with personality"

**Pokémon-specific inspiration:**
- `pokedex.org` (Nolan Lawson's offline-first Pokédex) — layout reference, especially detail view
- `pokeapi.co` — their own site's restraint; they resist the urge to go full theme-park
- Official `pokemon.com/us/pokedex/` — for how the OFFICIAL site handles type coverage. Borrow the hierarchy, not the execution.

**Pixel art UI inspiration:**
- Celeste's main menu — chunky borders, minimal palette, readable
- Stardew Valley's UI — shows how pixel UI can hold dense information without becoming soup
- Balatro's card design — pixel shadows, chromatic aberration done tastefully

**What NOT to do (anti-references):**
- `neopets.com` (current version) — too busy, too many animated GIFs
- Any "retro gaming" website with auto-playing chiptunes
- Fan Pokédexes with 14 Google Ads and a side-scrolling Bulbasaur marquee

---

## 8. Responsive Strategy

**Desktop-first.** Design canvas: 1440×900. Primary breakpoints:

```
--bp-desktop:  1024px   /full layout/
--bp-tablet:   768px    /compress 2-col grids, shrink sprite sizes/
--bp-mobile:   480px    /stack everything, CRT overlay disabled, type matrix → list/
```

Rules that differ at mobile (≤480px):
- Chunky borders shrink from 3px → 2px (they eat relative space on small screens)
- Press Start 2P headers drop one size step
- CRT overlay auto-disables (detected via `pointer: coarse` media query)
- 18×18 type coverage matrix collapses to a vertical "weak to / resists" list
- Sprite zoom on detail pages is 2x instead of 4x

Mobile is the courtesy tier. It works, it looks intentional, but the wow moment is desktop.

---

## 9. Accessibility Non-Negotiables

Retro aesthetics can't become an accessibility excuse.

- All text hits WCAG AA contrast (4.5:1 for body, 3:1 for large). I've checked the palette above — Day and Night both pass.
- All motion respects `prefers-reduced-motion`. Stat bars fill instantly, page transitions become crossfades, sprite idle bobs stop.
- Sound is off by default. Users opt in.
- Focus states are visible on every interactive element. Pixel-style focus (2px offset outline in `--accent-blue`) is actually *more* visible than the default browser ring.
- Alt text on every sprite. The Pokémon's name, not "Pokémon sprite."
- Keyboard navigation works everywhere, including the team builder drag-and-drop (which must have a keyboard alternative).

---

## 10. Signature Moments

The three things this site does that nothing else does, that recruiters should remember:

1. **The `/lab` route** — a functioning ML mini-portfolio embedded in a Pokédex. Feature importances rendered as pixel-art bar charts. The legendary classifier's confusion matrix using type colors. Residual plots with CRT scanlines. This is the "oh, they can *actually* do ML" moment.

2. **The team builder's type coverage matrix** — 18×18 grid that fills and animates as you add Pokémon. Recruiters share this with friends. "Look what this kid made."

3. **Day/Night toggle** — flipping to Night mode doesn't just invert colors. It collapses the entire palette into the 4-color DMG green monochrome. It's a statement: "I understand what the Game Boy was, and I can make the web look like it."

If these three land, the rest is execution.
