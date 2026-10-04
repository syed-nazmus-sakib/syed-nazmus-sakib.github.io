# Local development

This portfolio is a dependency-free static site. From the repository root, run:

```sh
python3 -m http.server 4000 --bind 127.0.0.1
```

Then open <http://127.0.0.1:4000/>.

The site files are:

- `index.html` — About page: bio, news, selected publications, experience summary, skills, awards
- `publications.html` — all papers with figures, links, and expandable abstracts
- `experience.html` — research and industry roles, selected projects, awards
- `cv/Syed_Nazmus_Sakib.pdf` — the CV, linked from the navigation; `cv/index.html` redirects to it
- `assets/css/style.css` — the single stylesheet; the accent colour is the `--accent` variable at the top
- `assets/js/main.js` — mobile menu, page-contents rail, abstract toggles, publication filter, news scroll
- `assets/img/` — portrait, favicon, and `publication_preview/` figures
- `lectures/` — standalone lecture pages with their own styling; `lectures/index.html` uses the site design
- `404.html`, `robots.txt`, `sitemap.xml` — hosting and SEO support
- `about.html`, `about/` — redirects for the former About URLs
- `.nojekyll` — tells GitHub Pages to serve the repository directly

Pages in subfolders (`lectures/index.html`, `404.html`) use root-absolute asset paths. The three top-level pages use relative paths.

`main-fig/` holds original PDFs and high-resolution source figures, and `cv/*.tex` holds the CV sources. Both are ignored by git on purpose; only the optimized figures and the built PDF are published.

The design is adapted from shahriyar-zaman.github.io under the MIT License. See `LICENSE`.
