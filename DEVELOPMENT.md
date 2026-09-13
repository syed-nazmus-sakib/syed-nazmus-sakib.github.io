# Local development

This portfolio is a dependency-free static site. From the repository root, run:

```sh
python3 -m http.server 4000 --bind 127.0.0.1
```

Then open <http://127.0.0.1:4000/>.

The site files are:

- `index.html` — portfolio content
- `cv/` — curriculum vitae page and PDF
- `assets/css/site.css` — portfolio, CV, and lecture-directory styles
- `assets/js/site.js` — mobile navigation and current year
- `lectures/` — standalone lecture pages
- `images/` — profile, publication, and favicon images
- `404.html`, `robots.txt`, `sitemap.xml` — hosting and SEO support
- `about.html`, `about/` — redirects for the former About URLs
- `.nojekyll` — tells GitHub Pages to serve the repository directly

`main-fig/` holds original PDFs and high-resolution source figures. It is ignored by git on purpose; only the optimized derivatives in `images/publications/` are published.
