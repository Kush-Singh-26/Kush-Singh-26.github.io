# Kush Singh — Portfolio & Blog

Personal portfolio and technical blog, built with [Kosh](https://github.com/Kush-Singh-26/kosh)
(a Go static site generator) and deployed to GitHub Pages.

Covers computer vision, NLP, ML fundamentals, and math notes, alongside a landing
page with projects, skills, and a timeline.

## Stack

- **Generator:** Kosh (`kosh build`) — markdown, taxonomies, search (Go+WASM), RSS,
  sitemap, knowledge graph, PWA, and server-side rendered LaTeX/D2/Mermaid diagrams.
- **Theme:** [`kosh-theme-blog`](https://github.com/Kush-Singh-26/kosh-theme-blog),
  mounted at `themes/blog` (symlinked locally, cloned in CI).
- **Hosting:** GitHub Pages via `.github/workflows/deploy.yml`.

## Layout

```
content/          Markdown posts, _index.md, resume.pdf, robots.txt
data/             portfolio.yaml (landing page content)
static/           images and other passthrough assets
themes/blog       blog theme (symlink to kosh-theme-blog)
kosh.yaml         site configuration
public/           build output (gitignored)
.kosh-cache/      BoltDB build cache (gitignored)
```

## Local development

The theme is symlinked, so clone it next to this repo first:

```bash
git clone git@github.com:Kush-Singh-26/kosh-theme-blog.git ../kosh-theme-blog
ln -s ../kosh-theme-blog themes/blog   # if themes/blog is missing

kosh serve --dev
```

`--dev` builds, watches for changes, and serves with incremental rebuilds.

## Build

```bash
kosh build
# production build with an absolute base URL:
kosh build --baseurl https://kush-singh-26.github.io/
```

Output goes to `public/`. Use `kosh clean` to rebuild or `kosh clean --cache` for
a cold rebuild.

## Deployment

Pushing to `main`, a `kosh-updated` / `theme-updated` `repository_dispatch`, or a
manual run triggers the workflow: it installs Kosh, sets up the theme, restores
the build cache, builds with the production base URL, and deploys `public/` to
GitHub Pages.

## Authoring

Add posts as markdown under `content/blogs/`. Frontmatter drives tags, series,
and event taxonomies configured in `kosh.yaml`.
