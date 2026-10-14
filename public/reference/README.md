# Cifras Kids reference snapshot

Imported from the supplied `saveweb2zip-com-cifraskids-com-br(4).zip`.

- `site.css` is the original stylesheet, unchanged.
- `site.js` retains the original compiled UI and inline SVG icons. The only integration changes move the router base to `/`, adjust home links, and expose a mount/unmount function for the existing TanStack app.
- All 53 referenced image files were downloaded from their original asset URLs into `public/violao-cantigas/assets/`. Original image bytes and filenames are preserved, including images whose extension differs from their actual encoding.
- Original text, prices, external checkout destinations, carousels, FAQ and legal pages are retained.
- The downloaded Meta Pixel and offer-tracking bundles are not included or executed, following AGENTS.md.
- Google Fonts is still requested by the unchanged original stylesheet.

Verified: production build, existing routing test, DOM rendering, local image references, and comparison against the original compiled page. Browser screenshot verification was unavailable in this environment.
