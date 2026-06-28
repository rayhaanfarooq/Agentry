# Design System

## Design Goals

- Calm
- Technical
- Premium
- Minimal
- Trustworthy
- Data-first

## Shared Principles

- Software is the hero, not abstract art.
- Whitespace should do more work than color.
- Borders are preferred over heavy shadows.
- Motion should be subtle and mostly interaction-driven.
- Pages should feel like developer infrastructure, not AI marketing.

## Typography

- Primary font
  - `Inter`
- Monospace font
  - `JetBrains Mono` in the dashboard
- Heading style
  - confident
  - tight tracking
  - minimal flourish
- Body style
  - understated
  - readable
  - generous line height

## Dashboard Visual Language

- Base palette
  - white
  - slate neutrals
  - subtle blue accents
- CSS token direction
  - `--background`
  - `--foreground`
  - `--primary`
  - `--accent`
  - `--border`
- Layout treatment
  - soft gradient page background
  - white surfaces
  - thin borders
  - rounded panels

## Landing Page Visual Language

- Palette
  - white and light slate backgrounds
  - deep navy as the brand anchor
  - restrained blue accents
- Tone
  - closer to infrastructure companies than AI startups
- Product storytelling
  - demos and dashboard-like frames over illustrations

## Spacing

- Prefer large vertical rhythm.
- Let cards breathe.
- Avoid dense dashboards unless data volume requires it.

## Borders And Radius

- Buttons
  - approximately `10px`
- Dashboard cards
  - approximately `16px`
- Larger panels and landing components
  - approximately `18px` to `26px`
- Borders should stay thin and neutral.

## Buttons

- Primary
  - dark navy or slate background
  - white text
  - subtle hover lightening
- Secondary / outline
  - white surface
  - quiet border
  - light hover fill

## Cards

- Light background
- Thin border
- Soft shadow only when necessary
- Large padding
- Clear hierarchy through spacing and typography

## Badges And Status

- Use badges for:
  - status
  - environment
  - metadata
  - counts
- Status colors:
  - success: green
  - warning: amber
  - failure: red
  - neutral: slate

## Icons

- Use Lucide.
- Prefer outlined icons.
- Icons should support content, not dominate it.

## Motion

- Allowed
  - fade in
  - tiny translate
  - hover border shifts
  - subtle button transitions
- Avoid
  - parallax
  - animated gradients
  - constant movement
  - loud hover scaling

## Dashboard-Specific Guidance

- Prefer tables, timelines, inspectors, and panels over decorative charts.
- Trace Explorer should optimize for fast debugging comprehension.
- Raw JSON views should feel deliberate and readable, not like fallback clutter.

## Landing-Page-Specific Guidance

- Sticky navigation is acceptable.
- Product demo frames should be reusable and consistent.
- Code examples should look real enough to support trust.

## Read Next

- [frontend.md](./frontend.md)
- [project-vision.md](./project-vision.md)
