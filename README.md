# Bolgsvenia Global

Official website for Bolgsvenia Global, an independent UK business offering
English, Spanish and Catalan translation, website development and remote IT support.

**Production:** https://bolgsveniaglobal.co.uk/  
**Hosting:** GitHub Pages  
**Languages:** English, Spanish (Spain), Catalan

## Repository organisation

- `*.html` — published pages. The existing filenames are intentionally preserved
  to avoid breaking public links and search-engine indexing.
- `assets/css/site-core.css` — shared foundation and components (Phase 1).
- `assets/css/shared/` and `assets/css/pages/` — reusable and page-level styles.
- `assets/js/shared/` and `assets/js/pages/` — interactive website scripts.
- `media/` — videos, captions, the existing assistant integration and film controls.
- `images/` and `assets/images/` — visual assets.
- `robots.txt`, `sitemap.xml`, `CNAME` and verification files — SEO, domain and verification.
- `tools/verify_site.py` — dependency-free static asset and SEO checks.
- `.github/workflows/site-integrity.yml` — automated checks on pushes and pull requests.

## Change management

The site currently includes 39 HTML files. Use a new feature/refactoring branch
and a pull request. Avoid making unreviewed changes directly to `main`.

For static checks, run:

```bash
python tools/verify_site.py
```

Check all three languages, navigation, forms, accessibility, mobile layouts,
AI assistant and video playback in a hosted preview before merging.

## SEO and link stability

Do not move or rename published `.html` pages without a URL-migration plan.
Retain canonical tags, language alternatives, `robots.txt`, `sitemap.xml`,
Google Search Console verification, and the GitHub Pages `CNAME` record.

## Advertising changes

Google Ads consent and conversion measurement are managed separately. This
refactoring does not enable adverts, Google tracking tags or paid campaigns.

## Privacy and customer information

Do not commit API keys, private client documents or customer submissions.
Website enquiry forms must be tested with non-sensitive test data.
