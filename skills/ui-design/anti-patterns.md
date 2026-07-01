# UI Anti-Patterns

Principal designers reject these by default. If the user explicitly requests one, implement a restrained version or confirm first.

## Visual noise

| Anti-pattern                                          | Why it fails                               | Do instead                                            |
| ----------------------------------------------------- | ------------------------------------------ | ----------------------------------------------------- |
| Floating gradient orbs / mesh backgrounds             | Reads as AI-generated; adds no information | White or `#f6f9fc` base; optional 1px border sections |
| Gradient text on headlines                            | Dated, hard to read, overused              | Solid text; accent color on one phrase max            |
| Multiple accent colors (purple + cyan + violet)       | No cohesive brand                          | One accent hue + neutrals                             |
| Glassmorphism everywhere (blur + transparency stacks) | Legibility and performance suffer          | Opaque surfaces; blur only on sticky nav if needed    |
| Heavy box-shadow on every element                     | Visual chaos                               | Shadow on elevated cards only                         |
| macOS traffic-light dots on every mockup              | Cliché                                     | Simple border + title bar or real product UI          |

## Layout

| Anti-pattern                                                | Why it fails                           | Do instead                                                |
| ----------------------------------------------------------- | -------------------------------------- | --------------------------------------------------------- |
| Everything centered                                         | Hard to scan long pages                | Center hero only; left-align body sections                |
| Same card grid repeated 4+ times                            | Monotonous, template feel              | Alternate: copy + visual, editorial lists, split sections |
| Metrics strip + badge + hero + CTA banner + gradient footer | Too many "sections that look designed" | Pick 2 proof elements max above the fold                  |
| 3+ primary buttons in one viewport                          | Split attention                        | One primary, one secondary, rest as links                 |

## Typography

| Anti-pattern                                       | Why it fails     | Do instead                                              |
| -------------------------------------------------- | ---------------- | ------------------------------------------------------- |
| 6+ font sizes on one page                          | Broken scale     | 4-tier scale: display, heading, body, caption           |
| ALL CAPS eyebrow + gradient headline + bold slogan | Shouting         | One emphasis level in hero                              |
| Ultra-tight letter-spacing on body text            | Poor readability | Tight tracking on display only (`-0.03em` to `-0.05em`) |

## Motion

| Anti-pattern                          | Why it fails                                 | Do instead                             |
| ------------------------------------- | -------------------------------------------- | -------------------------------------- |
| Ambient floating animations           | Distracting, `prefers-reduced-motion` issues | Static layout; 150ms hover transitions |
| Scroll-jacking                        | Hurts usability                              | Native scroll                          |
| Animating on page load for decoration | Slows LCP perception                         | Animate user-triggered feedback only   |

## Content / UX

| Anti-pattern                                       | Why it fails         | Do instead                                 |
| -------------------------------------------------- | -------------------- | ------------------------------------------ |
| Generic SaaS copy ("supercharge", "revolutionize") | No product truth     | Specific to what the product actually does |
| Fake logos / "Trusted by" with no assets           | Damages trust        | Omit or use real customers                 |
| Feature list with no product screenshot            | Claims without proof | Show the actual UI                         |

## Accessibility failures

- Gray text below `#697386` on white for body copy
- Icon-only buttons without `aria-label`
- `div` with `onClick` instead of `button` / `a`
- Focus rings removed for aesthetics
- Status conveyed by color alone

## Quick sniff test

Before shipping UI, ask:

1. Would this appear in a "AI-generated landing page" meme? → remove the worst offender.
2. Can I squint and still see hierarchy? → if not, fix type scale and spacing.
3. Is there anything I added that isn't serving the primary action? → delete it.

DESIGN CONSTRAINTS:

- Use Tailwind CSS or clean inline styles.
- Palette: [Insert 1 primary color, 1 neutral dark color, 1 neutral light background].
- Typography: Use a bold sans-serif font for headings and a clean, high-readability font for body text.
- Spacing: Use generous whitespace (e.g., py-24 or py-32 in Tailwind) between sections. No cramped layouts.
- Buttons: All Call-to-Action (CTA) buttons must have large padding, rounded corners, and subtle hover animations.
- Grids: Use responsive flexbox or CSS grids (1 column on mobile, 3 columns on desktop for feature cards).
