# Static Portfolio Handoff

## Current state

The portfolio is a dependency-free static site served directly by GitHub Pages through `.nojekyll`. All Jekyll and Ruby template files have been removed from the repository. See `DEVELOPMENT.md` for the file layout and how to run the site locally.

## Design direction

Keep the site professional, restrained, and academic. No gradients, decorative animation, or oversized typography. Inter is loaded from Google Fonts.

- Profile links are vertical, icon-led, and neutral in color.
- Sidebar labels use `Senior Year`, `Research Assistant`, and `Research Intern` with separated affiliation lines.
- Experience entries use bordered cards with a left accent rule and plain organisation links that colour on hover.
- Publications are ordered accepted first, then preprints. Status lines use one pattern: an `Accepted` or `Preprint` pill followed by the venue.
- The CV lives at `/cv/` with the PDF embedded and a download button. It is linked from the top navigation only.

## Open items

- MemeEconomy is labelled Preprint but has no public link yet.
- No public email address is shown on the site.
- A sidebar rework (Education and Affiliations blocks) was demoed locally but not applied.
