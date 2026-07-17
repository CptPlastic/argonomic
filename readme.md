# Agronomic Grower

Investor site for **Agronomic Grower** — mobile thermally controlled plant nursery (US 2024/0407307 A1).

Static GitHub Pages (no Jekyll). Brand mark: **AG**.

## Local preview

```bash
npx serve .
```

## Enable GitHub Pages

1. Push to `main` (or run **Actions → Deploy GitHub Pages → Run workflow**)
2. **Settings → Pages** → Source: **GitHub Actions**
3. Live at `https://CptPlastic.github.io/argonomic/`

The workflow in `.github/workflows/deploy-pages.yml` publishes on every push to `main`.

`.nojekyll` disables Jekyll processing.

## Contents

- Image-led story built around `assets/generated/`
- SoundCloud brief: [Agronomic Grower](https://soundcloud.com/cptplastic/agronomic/s-JwrJ8F9Qyy0)
- Contact form on the main page (`#contact`) — powered by [Formspree](https://formspree.io)
- Booth / kiosk loop: open `kiosk.html` (press `F` for fullscreen)
- Source materials in `refrences/`

### Contact form setup

1. Create a free form at [formspree.io](https://formspree.io) (forward to `hello@agronomicgrower.com`)
2. Copy your form endpoint (`https://formspree.io/f/xxxxxxx`)
3. Paste it into the `action` on the contact form in `index.html`
