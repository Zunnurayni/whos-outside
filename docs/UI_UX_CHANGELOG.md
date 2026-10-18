# UI & UX Evolution Changelog: Gen Z Social Discovery Upgrade

## Why These Changes Were Made

Social discovery apps for Gen Z cannot behave like static corporate event directories or classified ads. Young adults looking to go out want to know:
1. **Who is outside right now?**
2. **What is the exact vibe?** (Is it spontaneous, casual, high energy, split-bill, first-timer friendly?)
3. **Can I pull up without feeling awkward or getting flaked on?**

The goal of this upgrade was to take the solid Yola-focused foundation of **Who's Outside?** and infuse it with the energy, immediacy, and tactile warmth of apps like **Snap Map**, **Lapse**, and **Partiful**.

---

## Key Design Upgrades

### 1. Vector Icons & Zero-Slop Tactility
- Replaced emojis across navigation bars and buttons with crisp, production-grade vector icons from `lucide-react` (`Compass`, `MapPin`, `Users`, `Flame`, `Sparkles`, `Clock`, `ShieldCheck`).
- Applied spring-physics press states (`active:scale-95`) across buttons, chips, and cards for responsive native feel.
- Adopted strict zero-pill discipline: replaced static pill capsules with clean unboxed metadata using subtle typographic separators (`Jimeta Market · 7:30 PM · ₦3,500`).

### 2. Live "Who's Outside Right Now" Pulse Bar (`OutsidePulseBar.tsx`)
- **New Feature:** Added an interactive horizontal story carousel at the top of the Discover feed.
- Shows live active avatars in Yola with real-time status rings (e.g. *Fatima at Jimeta Market*, *Ibrahim at Pologround*, *Zainab on Rooftop*).
- Tapping any avatar opens a bottom sheet showing their current vibe and spot, with instant actions to **"Wave 👋"** or **"See Their Plan ⚡"**.

### 3. Vibe-First Filter System (`DiscoverClient.tsx`)
- **Segmented Control:** Users can toggle between `All Plans`, `🌙 Tonight`, `🔥 Filling Fast`, and `💸 Free Outings` in 1 tap alongside category chips.
- **Tonight's Spotlight Card:** Redesigned the primary featured plan into an atmospheric gradient card with ambient glow rings, spots-left urgency triggers, and instant crew entry.
- **Interactive Community Events:** Organised fairs and runs now support live, interactive *"I'm interested"* toggles with animated counters.

### 4. Atmospheric Activity Cards (`ActivityCard.tsx`)
- Unique ambient gradient banners tailored to the activity category (food, turf sports, sunset river walks, rooftop music, tech sessions).
- Added `#vibe` tags (e.g. `#Spontaneous`, `#First-timers welcome`, `#Split bill`).
- Integrated dynamic micro-progress bars displaying current crew capacity and spots remaining.

### 5. Social Radar (`MapClient.tsx`)
- Transformed the map into an interactive social radar featuring host avatar pins with category icons.
- Added an animated live pulse indicating the user's location in Yola.
- Interactive pin selection updates the floating activity card at the bottom.

### 6. Activity Detail Screen (`ActivityDetailClient.tsx`)
- Replaced generic stat boxes with a high-contrast 4-box layout (Timing, Cost / Person, Public Venue, Crew Size).
- Visual **Flake-Proof Unlock Meter** showing minimum crew needed to lock in the plan.
- Direct **Safe Meetup Guarantee** explaining that exact table pins are only revealed 45 min before start to confirmed members.
- 1-tap **"Share to Snapchat Story"** sticker export.

### 7. 1-Tap Plan Creation (`CreateClient.tsx`)
- Added **1-Tap Quick Vibe Presets**:
  - 🍢 *Suya run at Jimeta Market*
  - ⚽ *Casual 5-a-side soccer*
  - 🌅 *Sunset walk by River Benue*
  - 🎧 *Rooftop aux & chill beats*
  - 💻 *BCH Hub build & coffee*
- Pre-fills category, title, suggested group size, and cost in 1 click.
- Tactile `+` / `−` group size selector dial.

### 8. My Crews & Live Flake-Proofing (`CrewsClient.tsx`)
- Added interactive **"I'm On My Way 🚀"** check-in button during the 45-minute countdown window.
- Unlocks the secret meeting coordinates upon confirmation (*"Meet at Jimeta Market Main Gate, Table 4"*).
- Interactive host request management to approve or decline join requests with real-time feedback.

### 9. Social Passport (`ProfileClient.tsx`)
- Revamped the profile into a "Social Passport" featuring:
  - 100% attendance rate street cred.
  - Vibe and outdoor badges (*Suya Master*, *Night Owl*, *First Outing*).
  - Snapchat connection toggle.
  - Coordinate privacy settings.
