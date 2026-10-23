# Who's Outside? — Launch Playbook

Getting the app in front of Yola people, in three waves. Each wave is small
enough that you can fix anything that breaks before the next one hears about it.

Live app: https://whos-outside.vercel.app/

---

## ⚠️ Do these BEFORE you share the link with anyone

These two are non-negotiable — skip them and you launch broken or exposed.

1. **Rotate the Supabase keys.** The anon + service-role keys were pasted in
   chat earlier, so treat them as public. In Supabase → Project Settings → API,
   roll the keys, then update them in Vercel → Project → Settings →
   Environment Variables and redeploy. The service-role key must **only** live
   in Vercel env vars, never in the client.
2. **Turn "Confirm email" back ON.** Supabase → Authentication → Providers →
   Email → "Confirm email" = on. During testing it was off so you didn't wait
   on emails; for real users, leave it on so people can't sign up as someone
   else's address.

And confirm these are already set (we covered them earlier):

- Supabase → Authentication → URL Configuration
  - **Site URL:** `https://whos-outside.vercel.app`
  - **Redirect URLs:** `https://whos-outside.vercel.app/**`
- Mapbox → Account → the token's **URL restriction** allows
  `https://whos-outside.vercel.app/*` (otherwise the map 403s on the live site).
- You've signed up once and run `select seed_sample_activities();` in the
  Supabase SQL editor, so the feed isn't empty when the first person opens it.

---

## The three waves

### Wave 1 — Test crew (5–10 people you trust)

People who'll tell you the truth and won't mind a rough edge. BCH Hub regulars,
a couple of 3MTT folks you're close to.

Goal: shake out the real-device bugs — sign-up, the map, creating a plan,
joining one. You want 2–3 real plans created by them, not just by you.

Ask them directly for: did sign-up work first try? did the map find you? could
you make a plan in under a minute? what felt confusing?

### Wave 2 — BCH Hub Yola

Once Wave 1 hasn't surfaced anything embarrassing. This is a warm room — they
already know you and the hub. Drop it in the group and pin a starter plan (the
Bitcoin Cash dev meetup seed plan is perfect to anchor it).

Goal: a cluster of people in the same place turns "an app" into "a thing my
friends are on." Aim for one real-world outing that came out of the app.

### Wave 3 — 3MTT Adamawa community

The big one. Only after the hub crowd is active and you've got a few outings
that actually happened to point to. Lead with proof, not promise: "here's what
people did this week," screenshots of real crews.

---

## Copy to send

Pick the one that matches where you're posting. Keep the link as the last line
so it's the easy thing to tap.

### WhatsApp — Wave 1 (test crew)

> Building something and I want your eyes on it first 👀
> *Who's Outside?* — find people to actually go out with in Yola. See what's
> happening, join a crew, show up.
> It's rough, be brutal. Sign up, try making a plan, tell me what breaks.
> 👉 https://whos-outside.vercel.app/

### WhatsApp — Wave 2 (BCH Hub)

> Yo 👋 made a thing for us.
> *Who's Outside?* — it's where you find who's down to link up in Yola. Football
> at Pologround, suya run, hub sessions, riverside walks — see it, join it, go.
> I dropped a few plans already. Jump in, make your own, let's get people outside.
> 👉 https://whos-outside.vercel.app/

### WhatsApp / broadcast — Wave 3 (3MTT & wider)

> Tired of "we should hang out" that never happens? 😅
> *Who's Outside?* turns it into a plan. Discover what's on around Yola, find
> your people, lock a time, show up. Built right here in Adamawa.
> This week people ran [X plans] and actually met up. Your turn 👇
> https://whos-outside.vercel.app/

### Snapchat / status (short)

> who's outside? 👀 new app — find your people in Yola & actually go out.
> link in bio / tap 👉 whos-outside.vercel.app

### One-liner (bio, caption, anywhere)

> Who's Outside? — find your people in Yola and actually go out. whos-outside.vercel.app

---

## Watching what happens

Vercel Analytics is now live (mounted in the app). After you've shared:

- **Vercel → your project → Analytics** shows visitors, which pages they hit,
  where they came from, and device/country. Watch `/discover` vs `/create` —
  if lots visit but few reach `/create`, the "make a plan" step is where people
  drop.
- **Supabase → Table editor** is your ground truth: count rows in `profiles`
  (sign-ups), `activities` (real plans), and `activity_participants` (joins).
  A plan with people joined = the whole point working.

A simple weekly check: new sign-ups, new plans, and did any plan actually fill
and happen. That last number is the one that matters.

---

## If something breaks mid-launch

- **Map is blank / 403:** Mapbox token URL restriction doesn't include the live
  domain. Fix in Mapbox account settings, no redeploy needed.
- **Sign-up email never arrives:** check Supabase → Auth → rate limits; the
  built-in email sender is capped. For real volume, set up a custom SMTP sender
  in Supabase Auth settings.
- **Feed looks empty:** you haven't run `select seed_sample_activities();`, or
  the account that owns the seed plans got deleted. Re-run it from a live profile.
- **Someone's stuck on a screen:** ask for a screenshot + what they tapped.
  Vercel's deploy logs + the browser console tell you the rest.
