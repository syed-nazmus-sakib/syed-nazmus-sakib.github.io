# Portfolio Handoff

## Current state

The portfolio is a dependency-free static site served directly by GitHub Pages through `.nojekyll`. In October 2026 it was migrated to a design adapted from shahriyar-zaman.github.io (MIT licensed, credited in the footer and in `LICENSE`). See `DEVELOPMENT.md` for the file layout and how to run the site locally.

There are three pages: About (`index.html`), Publications, and Experience. The CV link in the navigation opens the PDF directly.

## Design direction

Serif headings (Newsreader) over a sans body (Inter), a single accent colour, and a text-forward academic layout. Keep it restrained: no gradients or decorative animation.

- The homepage lists six selected papers, each with a venue badge and a figure thumbnail. All ten papers are on the Publications page.
- Publication order on both pages is set by hand, not by date.
- The CV lists the same six selected papers as the homepage.

## Adding a paper

1. Put an optimized figure in `assets/img/publication_preview/`.
2. Add a `<li class="pub">` block to `publications.html`, copying an existing entry.
3. If it is a selected paper, add a `<li class="spub">` block to `index.html` and update the snapshot counts.
4. Add a line to News and Updates on the homepage.

## Open items

- News dates on the homepage are month-level estimates and should be confirmed.
- MemeEconomy has no public link yet.
- No public email address is shown on the site.
- The accent colour is still the maroon of the original design.
