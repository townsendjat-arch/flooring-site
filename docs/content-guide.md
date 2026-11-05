# Adding approved project photos and testimonials

The featured shower story stays visible. The new `#project-gallery` and `#reviews` sections are deliberately hidden and empty. Native `hidden` keeps them out of layout and the accessibility tree. No navigation links to them are included. Their inert HTML templates do not fetch images or display sample content. Hidden HTML is not private storage: never put customer information or unapproved material in the public repository.

## Project photographs

1. Obtain Charles's approval of the actual work, each photograph, caption and permission to publish. Confirm the photographer's rights and the customer's permission. Do not publish addresses, faces, identifying paperwork, plates or precise locations without appropriate permission. Remove unnecessary metadata, including GPS, before adding files.
2. Keep the existing three shower photographs and full-color logo unchanged. Add new approved, sensibly compressed JPEG, PNG or WebP files under `assets/projects/` with descriptive lowercase filenames. Resize new images for the intended display, record their actual pixel width/height, and inspect quality. Do not fabricate project images or reuse a featured photo as a supposedly different job.
3. Copy the `<figure class="gallery-card">` structure from the inert `#projectPhotoCard` template into `.gallery-grid` in `index.html`. Give the image a real local `src`, its intrinsic `width` and `height`, and accurate `alt` text describing what is visible. Keep `loading="lazy"` and `decoding="async"`. Never publish a card with a missing source or an empty alt description for an informative project photograph.
4. Fill in its heading and caption with approved facts. For example, describe the room, material or detail actually shown; do not invent a location, completion date, outcome, customer statement or craftsmanship claim. Alt text should describe the image, while the caption can supply useful approved project context. Do not repeat the entire caption in the alt text.
5. Repeat the card for additional genuine photographs. Images retain their natural proportions; no crop or carousel is required. Keep the section hidden until every included card is complete and approved.
6. After content approval and review, remove `hidden` from `#project-gallery` only. There is no automatic activation script. Do not add a navigation link until the populated section is intended to be visible. Publishing that change still requires normal review and separate release approval.

## Testimonials

1. Obtain an authentic customer statement, permission to quote it publicly, and the exact attribution the customer permits. Record approval privately. Do not put consent correspondence or other private information in this repository.
2. Copy the `<figure class="testimonial-card">` structure from `#testimonialCard` into `.testimonial-grid`. Put the approved quotation in the blockquote paragraph and approved attribution in the figcaption. Use plain text and preserve the meaning; obtain approval for material edits. Do not invent quotes, names, ratings, review counts or verification badges.
3. Keep `#reviews` hidden until at least one complete, genuine quotation and attribution is approved. Remove its `hidden` attribute only after review. Leave it hidden if feedback is still pending. No customer-facing “coming soon” cards are needed.

## Verify before requesting publication

- Check the images load and have correct natural dimensions, descriptive alt text, readable captions, and no horizontal overflow at 320px, 375px and desktop widths.
- Check the featured before → framing → finished story and full-color logos are unchanged. Review the card order and headings with a screen reader and enlarged text.
- Confirm there are no blank cards, instructional placeholders, unapproved claims, private details or links to hidden sections.
- Run `npm run check`, `node --check tests/design-browser.test.cjs`, and the full suite with `BROWSER=chromium npm test` and `BROWSER=webkit npm test` after installing the pinned development dependencies and browser engines. See `project-management/TESTING.md` for evidence limits.
- Once real content is authorized, deliberately update the scaffold regression that expects empty/hidden sections to assert the new approved visible content. Do not simply remove the asset, accessibility, contact or safety checks. The test-only populated-card example is synthetic test data and must never become production content.
- Obtain separate merge/deploy approval. This scaffold does not activate the estimate provider or authorize a release.

## Other content still awaiting confirmation

Service coverage, contact details, additional photographs, testimonials and other business details remain subject to Charles's confirmation. The site asks visitors to check service availability rather than asserting unverified city or statewide coverage. The existing contact destinations are preserved, not newly certified. The estimate form is text-only; photographs can be discussed directly when the visitor connects with Charles.
