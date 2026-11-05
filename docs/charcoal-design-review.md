# Charcoal and white design review

## Scope and branch dependency

This is a design-only revision of the client-facing site, stacked on draft PR #1 (`review/estimate-form-safe-submit`) at `6f2612cd3f74ac2573cfefbdf23ecb360de98fb0`. The new branch is `review/charcoal-white-design`. Its PR targets the form-review branch so its diff is limited to the palette, interaction styling, review tests and this record. PR #1 and `main` are not modified. Do not merge either PR or deploy without approval; after the form work is approved and merged, retarget/rebase this PR and rerun checks before any design merge.

Page sections, spacing, responsive breakpoints, typography, photographs, copy, contact destinations and form behavior are preserved. Only the browser theme-color and stylesheet cache key change in HTML. The original logo asset and crop remain intact and unfiltered in both the header and footer. Per the final client direction on 2026-10-21, the original Colorado flag colors, including yellow/gold, red and blue, are intentionally retained in the logo. The former review-only grayscale treatment has been removed. Project photographs are neither edited nor filtered.

## Yellow/gold inventory and replacements

Audit covered all tracked HTML/CSS/JavaScript plus the supplied image assets. No inline yellow declarations were present in HTML or JavaScript.

| Former usage | Replacement |
| --- | --- |
| `--warm: #FFD21C`, `--warm-dark: #735500` | Semantic charcoal/inverse-white accents and neutral muted text |
| Header/footer brand tagline and footer business title | White/light gray on the existing dark backgrounds |
| Navigation hover, header phone CTA | White with underline; white button with charcoal text and light-gray hover |
| Primary buttons (hero, estimate flow, final CTA, confirmation) | Charcoal with white text, lighter-charcoal hover, outlined pressed state |
| Eyebrow underlines and text, hero trust marks, story arrows | Charcoal on light sections; white on dark sections |
| Craftsmanship labels, numbers, proof kicker and divider | White and light gray on charcoal |
| Project kickers, featured/basement card fill and top rule, unsure-card accents | Neutral light-gray fills, charcoal rule; white on the dark card |
| Service-area label, panel fill/top border, chips and dividers | Charcoal labels/rule with subtle light-gray panels and borders |
| Process numbered circles | White numerals on charcoal |
| Form progress bar, field focus, selected choice border/inset fill | Charcoal with light-gray track/selection fill and native charcoal radio accent |
| Unavailable notice background, border and focus | Light gray with charcoal text/border/focus |
| Confirmation mark and background | Charcoal mark on light gray |
| Gold center in supplied Colorado logo crop | Intentional brand exception: original full-color artwork, unchanged and unfiltered, as explicitly approved |

Warm beige/cream surfaces, brown copy/borders, navy ink and red focus/error colors were also normalized. Every literal CSS color now has equal RGB channels. Original logo colors and natural photography colors are deliberate image exceptions, not residual yellow UI styling. State differences do not rely solely on hue: hover underlines, selected radio marks plus inset borders, two-tone focus rings, a heavier error border, persistent error text and existing `aria-invalid`/`aria-describedby` behavior remain. Disabled buttons have explicit neutral colors rather than reduced whole-control opacity.

## Verification method

The project has no production build step, linter or typechecker. Run:

```sh
npm ci --ignore-scripts --no-audit --no-fund
npm run check
node --check tests/design-browser.test.cjs
node --check tests/estimate-browser.test.cjs
BROWSER=chromium REVIEW_ARTIFACTS=review-artifacts/chromium npm test
BROWSER=webkit REVIEW_ARTIFACTS=review-artifacts/webkit npm test
git diff --check
```

The new test-only workflow checks out the exact PR head, uses contents-read permissions with no retained checkout credentials, and runs the complete existing form suite plus seven new design scenarios in Chromium and Playwright WebKit. It is restricted to this new design branch. There is no deploy step, production secret, live endpoint or notification send. All non-local browser requests are blocked and provider responses are simulated with fictional values. `package-lock.json` makes the test dependencies reproducible.

New design scenarios cover full homepages at 1440×1000, 1280×900, 375×812, 320×640 and 812×375, equal-RGB computed UI colors, no horizontal overflow, image loading, unchanged photography treatment, exact before/after section/card/photo geometry, automated accessibility scans, keyboard focus, hover/pressed/disabled/selected states, neutral errors and unavailable notice. The baseline CSS is read from the exact form-review commit and loaded in a fresh page for before screenshots. Images are explicitly decoded and the window is scrolled to paint offscreen async-decoded gallery images before full-page capture. The harness scrolls only the window, never the overflow-hidden logo crop containers, and asserts both logo containers remain at zero scroll offset. Earlier review screenshots with clipped logo artwork were a capture-setup artifact, not a site crop defect. The original crop CSS is unchanged. The first run exposed transient geometry during stylesheet hot-swapping; the test now uses fresh navigation rather than sampling CSS transitions. No product layout change was needed. Existing form scenarios cover all steps, errors, sending/retry/confirmation, focus/keyboard, narrow reflow and enlarged text. Root-font enlargement and Playwright WebKit are not actual browser zoom, Safari, iOS or hardware testing.

Before remote publication, local production/test syntax checks, four mocked adapter tests and `git diff --check` passed. Local Chromium startup was blocked by the workspace's socket restriction (`process_singleton_posix.cc:297`, `Operation not permitted`); no local browser scenario was counted as passed. Exact-head CI results and downloadable evidence belong in the PR after the run completes. Automated scans do not certify WCAG conformance; inconclusive records and human/device checks must remain explicit.

## Outstanding launch gates

1. The charcoal/white interface and original full-color logo direction are approved. Obtain final visual-review and exact-commit approval, plus owner approval of the separate form PR. The production form endpoint is intentionally empty; online estimates cannot currently transmit.
2. Approve the processor/account/form, exact destination inbox, privacy wording/notice, current terms, plan/costs and who handles requests. The footer email is not assumed to be the notification destination.
3. Verify recipient activation, server-side field/length/contact validation, rate/plan limits, spam/quarantine, AJAX CAPTCHA compatibility, domain restrictions, HTTPS and CORS. Browser validation/honeypot is not a security boundary.
4. Separately authorize fake test delivery for each contact preference. Check exactly one provider dashboard record and one notification in the approved inbox, including spam, correct field mapping and reply behavior. Provider acceptance alone is not proof of notification delivery. Choosing Text/Phone/Email describes the customer's response preference, not an implemented autoresponder.
5. Perform actual iPhone/Safari/VoiceOver, desktop Safari with keyboard settings and native 200%/400% zoom, and Android/TalkBack checks. The automated engine tests do not substitute for these.
6. Get Charles's content signoff: service territory (Denver metro metadata versus broader Colorado copy), the unfinished reviews block, the card asking for photos despite a text-only form, existing contact links, project descriptions and photo permissions. These existing contents are deliberately unchanged here.
7. Approve the final exact release commit, merge and deployment separately; verify the approved origin, provider dashboard and inbox after release with a rollback plan.

No provider/account activation, purchases, lead transmissions, hosting/DNS changes, merge or deployment is included.

## Deployment evidence and limits

On 2026-10-21, repository history showed 17 Actions runs: seven estimate-review runs and ten built-in Pages runs, all Pages runs on `main`. The latest Pages run was `37811969212` on `main` commit `3a845667aa1acace923ce200b3b6f3544ec20e0e` on 2026-10-08. Main has no repository-defined workflow; the existing form workflow is PR-only and limited to PR #1. This design adds only the narrowly scoped PR test job above. There is no external deployment configuration in the repository. Account-level Pages settings and hidden webhooks were not audited; observed run history is not a claim to inspect every integration. Remote heads and Actions must be checked again after publication.
