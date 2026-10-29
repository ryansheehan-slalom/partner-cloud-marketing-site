# Partner Cloud Home Page — Content Map

Every content block from the *Empower Your Partners* one-pager (Slalom × Salesforce Partner Cloud) mapped to a `pc*` LWC. Reference these mappings when scaffolding each component; the copy blocks are the source of truth for section content.

**Related:**
- Copilot rules → [.github/copilot-instructions.md](../../.github/copilot-instructions.md)
- Styling patterns → [partner-cloud-styling-reference.html](partner-cloud-styling-reference.html)

---

## Home page composition (order top → bottom)

| # | Section LWC | Reference pattern | Purpose |
|---|---|---|---|
| 1 | `pcSiteHeader` | `ecHtfSiteHeader` | Sticky chrome — logo, nav, "View Demo Site" |
| 2 | `pcHero` | `ecHtfHeroPanel` | Headline + team photo + primary CTA |
| 3 | `pcChallengeSection` | `ecHtfFeatureSection` (feature split) | "The Challenge" — problem statement + 6-item list |
| 4 | `pcSolutionGrid` | `ecHtfFinanceSection` (asset grid) | "The Solution" — 6 offering cards |
| 5 | `pcInsightsPreview` | `ecHtfFinanceSection` (asset grid) | Blog article teaser strip (net-new for site v1) |
| 6 | `pcWhoWeAre` | `ecHtfFeatureSection` (tight variant) | Slalom "about" block |
| 7 | `pcCtaBand` | `ecHtfCtaBand` | "Connect With Us" — Jake's contact + external link |
| 8 | `pcSiteFooter` | `ecHtfSiteFooter` | Dark footer with Slalom × Salesforce mark |

Chrome (`pcSiteHeader`, `pcSiteFooter`) wraps every route; the 6 middle sections compose the home page.

---

## 1. `pcSiteHeader`

**Reference pattern:** `ecHtfSiteHeader` (sticky, glassy, 78px, backdrop-filter blur)
**File:** `force-app/main/default/lwc/pcSiteHeader/`

### Content

| Slot | Copy / behavior |
|---|---|
| Logo (left) | Slalom wordmark + Salesforce cloud mark (partnership lockup) |
| Nav link 1 | Insights → `/insights` |
| Nav link 2 | About → anchor `#who-we-are` or dedicated route |
| Nav link 3 | Connect → anchor `#connect` |
| CTA (right) | "View Demo Site" → external URL (Partner_Portal1 demo) |

### Notes

- Do **not** include the HTF brand switcher (per copilot instruction §9).
- Attribution bar above header **keep**: "Made by Slalom · Salesforce Partner Cloud"
- Add `pcLogo` + `pcFavicon` static resources.

---

## 2. `pcHero`

**Reference pattern:** `ecHtfHeroPanel` (2-col grid `1.05fr 0.95fr`, art panel + float card)
**File:** `force-app/main/default/lwc/pcHero/`

### Content

```
Eyebrow:    SALESFORCE PARTNER CLOUD

H1:         Empower your partners with a [compelling] experience
            that [accelerates growth] and provides [meaningful value].
            (brackets = .pc-hero__title .accent — render in --brand-deep)

Lede:       A strategy-first approach to modernizing partner ecosystems —
            grounded in program insight, intentional design, and Slalom's
            deep Salesforce expertise.

Primary CTA:    "Connect with us" → anchor #connect
Secondary CTA:  "See our approach" → anchor #solution
```

### Right panel

- **Media:** team photo (from the one-pager) at `aspect-ratio: 4 / 3.4`, `--radius-lg`, `--shadow-lg`.
  - Static resource: `pcHeroPhoto`
  - Alt: "A Slalom team collaborating with Salesforce partners"
- **Float card:** anchored bottom-right (per `.hero__floatcard` pattern)
  - Icon: `handshake` (from icon library)
  - Title: "Salesforce Partner"
  - Sub: "Consulting Summit tier"

### Assurance chips (optional row below CTAs)

- ✓ Strategy-led
- ✓ 360° partner view
- ✓ Slalom-only accelerators

---

## 3. `pcChallengeSection`

**Reference pattern:** `ecHtfFeatureSection` (2-col `1fr 1fr`, gap 56px, `--surface` bg)
**File:** `force-app/main/default/lwc/pcChallengeSection/`

### Content

```
Eyebrow:    THE CHALLENGE

H2:         Partner experiences that get in the way of growth.

Body:       A thriving partner ecosystem boosts adoption, scale, and innovation
            — but achieving that impact requires partner experiences that are
            simple, consistent, and easy to navigate.

Sub-label:  Common challenges we see…
```

### Feature list (6 items — right column, `.pc-feature__list`)

Each item: icon (in `--brand`) + short title + one-line sub.

| # | Icon | Title | Sub |
|---|---|---|---|
| 1 | `doc` | Frustrating deal registration | Long forms drag down pipeline visibility. |
| 2 | `layout` | Cluttered user experiences | Hidden key actions push partners off-platform. |
| 3 | `chart` | Limited tiering visibility | Progress and rewards go unrecognized, weakening loyalty. |
| 4 | `shield` | No channel conflict strategy | Ambiguity erodes partner trust. |
| 5 | `spark` | Weak enablement & onboarding | Adoption and usage stall out. |
| 6 | `users` | Non-sales partner needs ignored | Program value is capped at the deal desk. |

### Closing note (below list)

> With deep experience solving these challenges, Slalom helps organizations modernize partner experiences — whether improving existing tools or implementing new solutions.

Render this as `.pc-feature__note` at 12–14px, `color: var(--ink-3)`.

### Left column (media panel)

- Illustrative graphic OR crop of the team photo.
- Aspect ratio `5 / 4`, `--brand-tint` background, `--radius-lg`, `--shadow`.
- Static resource: `pcChallengeArt`

### Notes

- No primary CTA on this section — it's setup for the Solution grid.
- Ensure `.pc-feature__grid--rev` variant is available if the design later wants art on the right.

---

## 4. `pcSolutionGrid`

**Reference pattern:** `ecHtfFinanceSection` (3-col asset grid, section head + card grid)
**File:** `force-app/main/default/lwc/pcSolutionGrid/`

This is the centerpiece of the home page — six offering cards derived directly from the one-pager checklist.

### Section head

```
Eyebrow:    THE SOLUTION

H2:         A strategy-first approach to partner ecosystem modernization.

Lede:       Using partner-program insight and intentional design to modernize
            ecosystems and remove friction.
```

Anchor: `id="solution"` on the `<section>` so the hero's secondary CTA lands here.

### Card grid (6 cards, `.pc-asset-grid`, 3-col × 2 rows)

Each card follows the asset-card pattern: top zone (icon badge + h3 + bottom border) → body zone (paragraph).

| # | Icon | Title | Description |
|---|---|---|---|
| 1 | `layers` | Strategy-led ecosystem design | Grounded in partner strategy, industry insight, and purposeful UX. |
| 2 | `dollar` | Realized ROI and partner value | Pair deal insights with incentive forecasting and marketing attribution for a 360° view of investment and expected revenue. |
| 3 | `refresh` | Streamlined core partner journeys | Simplified onboarding, enablement, selling motions, and program progression. |
| 4 | `megaphone` | Multi-channel engagement | Combining marketing communications with Slack-based, real-time interactions. |
| 5 | `grid` | Centralized partner hub architecture | Provide partners with a full view of their engagement across the ecosystem. |
| 6 | `bolt` | Slalom-only accelerators | Drive immediate impact with intuitive marketing development visualization and deal intake channels through directory management. |

### Notes

- Icon-badge treatment: `46×46`, `border-radius: 12px`, `background: var(--brand-tint)`, `color: var(--brand-deep)`.
- Apply `.pc-card--hover` behavior (translateY + shadow on hover).
- No chips or CTAs inside cards — keep them dense with copy.
- On mobile (<900px): 2-col; on <640px: 1-col.

---

## 5. `pcInsightsPreview`

**Reference pattern:** `ecHtfFinanceSection` (asset grid pattern reused, but populated with article previews)
**File:** `force-app/main/default/lwc/pcInsightsPreview/`

Not from the one-pager — this exists because the site is a blog. Shows the latest 3 articles as a teaser strip.

### Section head

```
Eyebrow:    INSIGHTS

H2:         Notes from the ecosystem.

Lede:       Fresh perspectives on modernizing partner programs, from the
            Slalom team building them.
```

### Card grid (3 cards)

Each card: article hero image (top) → tag chip + date + h3 title + excerpt.

Article data source: TBD (see data-flow note below). For static v1, hardcode 3 placeholder articles.

### CTA below grid

- "See all insights" → `/insights` route.
- Rendered as `.pc-btn--ghost`.

### Notes

- Section background: white (not `--surface`) — creates alternating rhythm with the Solution grid above.
- If dynamic content isn't wired for v1, ship with hardcoded `@track` array in the LWC.

---

## 6. `pcWhoWeAre`

**Reference pattern:** `ecHtfFeatureSection` (feature split) with `.pc-section--tight` padding
**File:** `force-app/main/default/lwc/pcWhoWeAre/`

### Content

Anchor: `id="who-we-are"`.

```
Eyebrow:    WHO WE ARE

H2:         Purpose-led. Salesforce-fluent. Ecosystem-focused.

Body:       Slalom is a purpose-led, global business and technology consulting
            company. Our purpose — to help people and organizations dream bigger,
            move faster, and build better tomorrows for all — guides everything
            we do.

Secondary body:
            Salesforce Partner Cloud is where our decades of channel and
            partner-program experience meet the platform's fastest-growing
            ecosystem product line. We help organizations turn partner strategy
            into partner behavior.
```

### Right column (media panel)

- Photo or brand mark composition (Slalom + Salesforce lockup).
- Static resource: `pcWhoWeAreArt`

### CTAs

- Primary: "Learn more at slalom.com/salesforce" → https://slalom.com/salesforce (external, `target="_blank"`)
- (No secondary CTA — keep it clean.)

### Notes

- Use `.pc-section--tight` (`clamp(40px, 5vw, 68px) 0`) so it doesn't overpower the Solution grid.
- Media panel background: `--brand-tint-2` instead of `--brand-tint` for tonal variety.

---

## 7. `pcCtaBand`

**Reference pattern:** `ecHtfCtaBand` (dark band with orbs, flex layout)
**File:** `force-app/main/default/lwc/pcCtaBand/`

Anchor: `id="connect"`.

### Content

```
Eyebrow:    CONNECT WITH US

H2:         Ready to modernize your partner experience?

Body:       Talk to our Salesforce Partner Cloud lead — we'll workshop your
            program challenges and outline the fastest path to impact.
```

### Contact card (inside the band, replaces the standard CTA button row)

Suggested treatment: instead of just buttons, embed a compact contact card so the "Connect With Us" moment feels personal.

```
Avatar:   Jake Seibert headshot (static resource: pcContactAvatar)
Name:     Jake Seibert
Role:     Senior Principal, Salesforce Partner Cloud
Email:    jake.seibert@slalom.com
```

Buttons (below the contact block or beside it):
- Primary: "Email Jake" → `mailto:jake.seibert@slalom.com` — `.pc-btn--on-dark .pc-btn--lg`
- Secondary: "slalom.com/salesforce" → https://slalom.com/salesforce — `.pc-btn--outline-white .pc-btn--lg`

### Decorative orbs (from reference pattern)

- Orb 1: 280px, `right: -60px; top: -60px`, `background: var(--brand)`, opacity 0.18, blur 10px.
- Orb 2: 200px, `right: 120px; bottom: -90px`, `background: var(--brand-2)`, opacity 0.16, blur 8px.

### Notes

- Container: `.pc-cta-band` — `background: var(--dark)`, `border-radius: var(--radius-lg)`, `padding: clamp(40px, 6vw, 72px)`.
- Text color: white; body copy at `rgba(255,255,255,0.8)`.

---

## 8. `pcSiteFooter`

**Reference pattern:** `ecHtfSiteFooter` (dark bg, 4-col grid, uppercase caps)
**File:** `force-app/main/default/lwc/pcSiteFooter/`

### Top grid (`1.4fr 1fr 1fr 1fr`)

**Column 1 — brand block**
- Slalom + Salesforce lockup (white-inverted via `filter: brightness(0) invert(1)`).
- Tagline: "Salesforce Partner Cloud, built by Slalom."
- Sub-line: `partner.slalomdxp.com`

**Column 2 — Solutions**
- Strategy design
- Partner journeys
- Multi-channel engagement
- Slalom accelerators

**Column 3 — Insights**
- Latest articles
- Case studies (placeholder)
- Newsletter signup (placeholder)

**Column 4 — Company**
- About Slalom → https://slalom.com
- Contact Jake → `mailto:jake.seibert@slalom.com`
- slalom.com/salesforce → external
- LinkedIn → placeholder

### Bottom strip

- Copyright: "© 2026 Slalom. All rights reserved."
- Right-aligned mini-links: Privacy · Terms · Accessibility (all placeholder).

### Notes

- Column heads: Archivo 700 · 13px · uppercase · `letter-spacing: 0.1em`.
- Link color: `rgba(255,255,255,0.78)`, hover white.

---

## Content anchors summary

For CTAs and nav to work smoothly, apply these `id` values on each `<section>`:

| Component | Anchor |
|---|---|
| `pcHero` | `id="home"` (optional; hero is already top) |
| `pcChallengeSection` | `id="challenge"` |
| `pcSolutionGrid` | `id="solution"` |
| `pcInsightsPreview` | `id="insights-preview"` |
| `pcWhoWeAre` | `id="who-we-are"` |
| `pcCtaBand` | `id="connect"` |

Each `<section>` must also carry `aria-labelledby` pointing at its H2's `id` (per copilot instruction §13).

---

## Static resources checklist

To build this home page, provision these static resources up front:

- [ ] `pcLogo` — Slalom + Salesforce partnership lockup (SVG, both light + white variants)
- [ ] `pcFavicon` — .ico + .png (32×32, 180×180)
- [ ] `pcHeroPhoto` — team photo from the one-pager (min 1200×1020)
- [ ] `pcChallengeArt` — illustration or cropped photo for §3 media panel
- [ ] `pcWhoWeAreArt` — Slalom/Salesforce brand mark composition for §6
- [ ] `pcContactAvatar` — Jake Seibert headshot (round, 200×200 min)

---

## Data-flow note (deferred)

Sections 2–7 render **static content** hardcoded via `@api` props on the LWC (or `@track` state in the constructor). This is deliberate for v1 because we cannot modify `ContentfulService` (per copilot instruction §1).

Section 5 (`pcInsightsPreview`) needs article data. Options in priority order:

1. **v1:** Hardcode 3 placeholder articles as a `@track` array. Ship the visual.
2. **v2:** Introduce a Partner-Cloud-specific data layer (net-new Apex + LWC service — never touches `ContentfulService`).
3. **v3:** Once the data question is resolved separately, wire in real article content.

Do not attempt to import from `c/contentfulService` or `c/ecHtfContentService` to fetch article data.

---

## Build order recommendation

Ship in these small batches so each PR is reviewable on its own:

1. **PR A** — Chrome: `pcSiteHeader` + `pcSiteFooter` + static resources + `pcIconLibrary` scaffold.
2. **PR B** — Hero + Challenge: `pcHero` + `pcChallengeSection`.
3. **PR C** — Solution grid: `pcSolutionGrid` (the centerpiece).
4. **PR D** — Supporting sections: `pcWhoWeAre` + `pcCtaBand`.
5. **PR E** — Blog preview: `pcInsightsPreview` (hardcoded until data layer lands).
6. **PR F** — Assembly: `PartnerCloud1` LWR site bundle with Home route composing all sections in order.
