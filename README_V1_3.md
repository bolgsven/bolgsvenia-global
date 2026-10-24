# Bolgsvenia Global - Harbour multilingual translation services review

**Build:** 1.3 | **Prepared:** 23 October 2026 | **Status:** Offline review only

This is the original approved **Harbour** redesign, extended for translation between **English, Spanish and Catalan in both directions**. It is not a production website or a new visual redesign.

## Open the website

Unzip this package into a folder. Open `index.html` for English or `es.html` for Spanish. The new translation service overview pages are `translation-services.html` and `servicios-traduccion.html`. The pages and interactive assistant are usable offline; links leading to the existing public website will require internet access. No software installation is required to view the static preview.

## Changes in this build

- Three confirmed professional pairs: EN-ES, EN-CA and ES-CA, all bidirectional (six directions).
- New EN/ES translation overviews linked from the homepage translation service card.
- Two form fields on every relevant page: **Translate from** and **Translate into**. The selected pair also populates the existing `language_direction` field expected by the legacy enquiry workflow.
- Guided chatbot asks for the original and target language independently; only supported choices appear. A valid six-direction choice pre-fills the form, not an automatic submission.
- Current published English-Spanish prices are explicitly scoped to that pair. Pricing for Catalan directions requires an individual quotation. No authorisation as a Spanish sworn translator is claimed.
- The original 'From hola to HTML' homepage, portfolio, brand film, IT troubleshooting simulation and planned Spanish lessons remain unchanged in function.

## Privacy and preview safety

- Forms are deliberately **disabled from sending**: invalid public access key, fragment action, capture-level submit guard. Do not remove these restrictions or upload this package as a public site.
- No document contents, passport numbers or confidential files belong in the assistant. Its guided messages remain in the visitor's browser. It does not use a remote AI API.
- Review pages have `noindex,nofollow` and provisional metadata. Live SEO and forms must be reconciled with the original GitHub repository before release.

## Languages

- **Available website interface in this build:** English and Spanish.
- **Available professional translation directions in this build:** English to Spanish; Spanish to English; English to Catalan; Catalan to English; Spanish to Catalan; Catalan to Spanish.
- **Planned future website interfaces:** Catalan, Urdu, Simplified Chinese (review needed). These interfaces have not been built and are not advertised as available now. No Urdu or Chinese translation service is offered.

## Outstanding production work

1. Business owner content approval, especially Catalan pricing terms, service claims and translated UI copy.
2. Restore and stage-test the original secure enquiry forms, mapping `source_language`, `target_language` and legacy `language_direction` with validated business-email delivery.
3. Independently verify privacy, optional document handling, access controls, retention and any third-party form processor requirements.
4. Update the 24-second EN/ES film text to mention Catalan; current first-cut footage predates this language scope expansion.
5. Complete accessibility, SEO, performance and real browser/device tests (current checks are automated browser tests, not a formal audit).
6. Later, prepare reviewed Catalan/Urdu/Chinese website translations; Urdu requires RTL layout work. Add locale routes to sitemap/hreflang only once published and reviewed.
7. Stage on a dedicated development branch and obtain explicit approval before merging or deploying. The live site and GitHub `main` have **not been changed**.

See `docs/CATALAN_CHANGELOG.md`, `docs/CATALAN_TEST_REPORT.md`, `docs/CATALAN_TEST_RESULTS.json`, and `docs/CATALAN_RELEASE_CHECKLIST.md`.

## Typography update (v1.3)

The tiny 01/02/03 counters have been replaced with large editorial step numerals. Counters in the language-pair cards have been removed as these are alternatives, not sequential stages. Duplicated process headings have been rewritten. See `docs/TYPOGRAPHY_REVISION_V1_3.md`.
