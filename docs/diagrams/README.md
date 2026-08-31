# Diagrams

Source for the architecture diagram in the root [README](../../README.md).

| File | What it is |
| --- | --- |
| `railway-stack.html` | The diagram. Self-contained HTML with inline SVG, opens in any browser. |
| `railway-stack-dark.html` | Dark variant. Colour-only derivative, identical geometry. |
| `railway-stack.png`, `railway-stack-dark.png` | 2x exports, 2400x1502. |

The root README embeds `railway-stack.png` with plain markdown image syntax.

## Why PNG and not the SVG

GitHub serves README images through a proxy that blocks external requests, so an
SVG referencing Google Fonts would render with substituted typography. The PNG
is rasterised in a browser that has already loaded them.

## Why the dark PNG is not wired up

A `<picture>` element with `prefers-color-scheme` would let the diagram follow
the reader's GitHub theme, and it works correctly on github.com. It does not
render in VS Code's markdown preview: the preview rewrites relative paths for
markdown `![](...)` syntax only, and passes raw HTML `src` through untouched,
where its content security policy then blocks the local file. That makes the
diagram invisible to anyone editing the README, which is a worse trade than a
light diagram on a dark page.

The dark export is kept current anyway, so the swap is one edit whenever that
calculation changes:

```html
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/diagrams/railway-stack-dark.png">
  <img alt="..." src="docs/diagrams/railway-stack.png">
</picture>
```

## Regenerating

The HTML is the source of truth. Edit `railway-stack.html`, then re-derive the
dark variant and re-export both. Drawn with the
[diagram-design](https://github.com/cathrynlavery/diagram-design) skill:
architecture type, `doc-inline` preset, default editorial palette.

Two labels carry version numbers (`Next.js 15 · React 19` on the storefront,
`Medusa 2.19 · admin /app` on the backend), so a major upgrade means editing the
diagram alongside the version badge at the top of the root README.

The layout obeys a set of connector rules that are easy to break by hand: every
elbow is a rounded right angle, no two connectors overlap or share an attach
point, and no label mask touches a stroke. Verify with the skill's own checkers
rather than by eye:

```bash
python <skill>/scripts/self_check.py docs/diagrams/railway-stack.html
python <repo>/scripts/verify-geometry.py docs/diagrams/railway-stack.html
```
