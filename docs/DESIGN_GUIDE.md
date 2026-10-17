# Design guide

Who's Outside? has its own visual identity: youthful and expressive, dark-capable, with a restrained ghost-yellow accent and violet as the brand secondary. It is **not** a Snapchat clone. This guide is the single source of truth for anyone building UI in the repo.

---

## Principles

1. **Mobile-first, phone-shaped.** The app lives in a centred column capped at `480px`. Design for a ~400px screen first.
2. **Restraint with the accent.** Ghost-yellow (`--accent`) is a spotlight, not a wash. Use it for the primary action, the ghost mark, the "filling fast" moment. Violet (`--violet`) carries most interactive colour.
3. **One system, two themes.** Every colour is a token with a light and dark value. Never hardcode a colour that only reads in one theme.
4. **Real content, never lorem ipsum.** Use Yola venues, Naira prices, real neighbourhood names.
5. **Cards mark objects, not everything.** Border + radius + shadow set off a thing. If every block has them, hierarchy disappears.
6. **Safety reads as calm, not alarm.** Privacy and safety copy is reassuring and plain.

---

## Colour tokens

Defined in `src/app/globals.css` on `:root`, redefined for dark. Tailwind maps to them in `tailwind.config.ts` (`bg-surface`, `text-fg-soft`, etc).

| Token | Light | Dark | Role |
| --- | --- | --- | --- |
| `--bg` | `#faf7f2` | `#141210` | Page background (warm off-white / near-black) |
| `--surface` | `#ffffff` | `#1f1b17` | Cards, bars |
| `--surface-2` | `#f2ede4` | `#2a251f` | Insets, chips, icon tiles |
| `--fg` | `#1a1714` | `#f6f1e9` | Primary text |
| `--fg-soft` | `#6b6256` | `#b3a894` | Secondary text |
| `--fg-faint` | `#9c9284` | `#7d7465` | Captions, demo flags |
| `--line` | `#e6ded1` | `#322b23` | Borders, dividers |
| `--accent` | `#ffd400` | `#ffd400` | Ghost-yellow — primary CTA, spotlight |
| `--accent-ink` | `#1a1714` | `#1a1714` | Text on accent |
| `--violet` | `#6c4cf0` | `#9d84ff` | Brand secondary, links, host chips |
| `--violet-soft` | `#efeafe` | `#241d3d` | Violet backgrounds |
| `--good` | `#1f9d5a` | — | Confirmed, locked, success |
| `--warn` | `#d9802b` | — | Filling fast, pending |
| `--crit` | `#d1455b` | — | Errors, notification dot |

The neutrals carry a slight warm bias (toward the accent) on purpose — a pure grey would read as unconsidered.

### Semantic vs accent
`--good / --warn / --crit` are **state** colours and are separate from the accent. A "filling fast" pill is warn, not accent. Don't use them as decoration.

---

## Typography

Two faces, loaded via Google Fonts `<link>` in `src/app/layout.tsx`:

| Role | Family | Token | Use |
| --- | --- | --- | --- |
| Display | **Space Grotesk** (500–700) | `--font-display` | Headings, titles, stat numbers, card titles |
| Body | **Plus Jakarta Sans** (400–800) | `--font-body` | Everything else |

Both have real fallback stacks (`system-ui, sans-serif`). Headings get `text-wrap: balance` and tight tracking (`-0.01em`). Uppercase labels (eyebrows) get `0.06–0.09em` letter-spacing. Numbers that line up in columns use `tabular-nums`.

**Type scale** (rough): hero `1.7rem`, screen title `1.15rem`, section head `1.05–1.18rem`, card title `1.04rem`, body `0.92rem`, meta `0.8rem`, caption `0.72–0.76rem`.

---

## Radii, shadow, spacing

- `--r-lg: 22px` (spotlight, detail hero), `--r-md: 16px` (cards), `--r-sm: 11px` (info boxes, pills-as-tiles).
- `--shadow` is a soft two-layer card shadow, lighter in light mode.
- Lay groups out with flex/grid + `gap`, not per-element margins.
- **Gutter:** every screen keeps `max(18px, env(safe-area-inset-left/right))` on the sides so content clears system bars on notched phones.

---

## Components

All in `src/components/`:

| Component | File | Notes |
| --- | --- | --- |
| `Button` | `ui/Button.tsx` | `primary` (accent), `secondary`, `violet`, `ghostline`; `sm`/`md`; `full` |
| `Pill` | `ui/Pill.tsx` | `default`, `cat` (violet), `good`, `warn`, `ghost` (accent) |
| `Avatar` / `AvatarStack` | `ui/Avatar.tsx` | Initials on a per-person colour; stack overlaps with ring |
| `Toast` | `ui/Toast.tsx` | `useToast().show(msg, icon)` — demo feedback |
| `ThemeToggle` | `ui/ThemeToggle.tsx` | Cycles system → dark → light, persists to localStorage |
| `TopBar` | `layout/TopBar.tsx` | `home` / `title` / `detail` variants |
| `TabBar` | `layout/TabBar.tsx` | 5 tabs, raised accent Create button |
| `AppShell` / `Pad` | `layout/AppShell.tsx` | Phone column, safe-area band, gutter helper |
| `ActivityCard` | `activity/ActivityCard.tsx` | The reusable plan card |
| `CategoryChips` | `activity/CategoryChips.tsx` | Horizontal filter row |
| `SnapShareButton` | `snap/SnapShareButton.tsx` | Creative Kit deep-link share |

### Making a new component
1. Use tokens via Tailwind utilities (`bg-surface`, `text-fg-soft`) — never raw hex.
2. If it's interactive, it's a `"use client"` component.
3. Keep repeated elements consistent: same padding, radius, baseline.
4. Give focus a visible state (the global `:focus-visible` ring handles most cases).

---

## Dark mode

The page renders in the viewer's theme. Three states are handled:
- **System default** (no attribute) → `@media (prefers-color-scheme: dark)`.
- **Explicit dark** → `:root[data-theme="dark"]`.
- **Explicit light** → overrides a dark OS setting.

Rules: declare every token on bare `:root` first; both dark blocks only *redefine* tokens and set `color-scheme: dark`. Never put a colour's only definition inside a media/attribute block. `body` always sets an explicit background.

---

## Voice & copy

- Write from the user's side. "Who's outside?" not "Browse activities."
- Active, specific, warm. "Request to join · ₦3,500", then a toast "Request sent to Fatima 🎉".
- No corporate filler. No em-dashes in UI copy.
- Safety copy reassures: "Meet at the public venue, not anyone's address."
- Emoji are part of the identity here (category markers, the ghost) — used with intent, not as decoration everywhere.

---

## Accessibility

- Contrast: body text meets AA on both themes. Don't put `--fg-faint` on `--surface-2` for anything important.
- Every control has an `aria-label` where the label isn't visible text.
- `prefers-reduced-motion` disables transitions globally (in `globals.css`).
- Tap targets ≥ 40px. Toggles, mini-buttons, and icon buttons all meet this.
- Never rely on colour alone — pair state colour with an icon or label.

---

## Self-hosting fonts (optional)

If you need the app to work fully offline or behind a firewall, replace the Google Fonts `<link>` with `@font-face` declarations using the two families as base64 `data:` URIs or files in `/public/fonts`. Keep the same CSS variable names so nothing else changes.
