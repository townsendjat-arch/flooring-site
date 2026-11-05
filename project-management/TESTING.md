# Charles's flooring website: verification ledger

Historical evidence checked: **2026-10-21 (UTC)**. Focused implementation checks added **2026-11-05 (UTC)**. Scope: existing form/design review package, not the deployed site.

## Exact revision and evidence

| Evidence | Exact target | Result |
| --- | --- | --- |
| Design/form CI, [run 39636345024](https://github.com/townsendjat-arch/flooring-site/actions/runs/39636345024) | `98c944d685a6814078054301f8597f1ed274a138`, PR #2 | PASS: 44/44 Chromium and 44/44 Playwright WebKit; no failed, skipped or cancelled tests |
| Separate form-base CI, [run 37984046254](https://github.com/townsendjat-arch/flooring-site/actions/runs/37984046254) | `6f2612cd3f74ac2573cfefbdf23ecb360de98fb0`, PR #1 | Successful historical form-base run, 2026-10-09; not a design-head result |
| New tracking revision | Documentation-only descendant of `98c944d685a6814078054301f8597f1ed274a138` | Distinct SHA; do not attribute the earlier run to it. Exact head and its checks are available in [PR #2 commits](https://github.com/townsendjat-arch/flooring-site/pull/2/commits) and [PR #2 checks](https://github.com/townsendjat-arch/flooring-site/pull/2/checks) |

There are **40 browser scenarios (7 design + 33 form) and 4 mocked adapter tests per engine**, not 88 unique tests. The tested run used Playwright 1.62.1, Chromium 151.0.7922.34 and Playwright WebKit 26.5. WebKit on Linux is not the Safari application or an Apple device.

## Passed scope

- Homepages at 1440x1000, 1280x900, 375x812, 320x640 and 812x375: neutral UI palette, original unfiltered header/footer logos, loaded/unmodified photography, no horizontal overflow, and unchanged before/after section/card/photo geometry.
- Keyboard navigation and focus, hover/pressed/selected/disabled/error/unavailable states, plus the complete mocked form regression suite.
- Production/test JavaScript syntax, four mocked adapter tests and whitespace checks. No production build, linter or typechecker is configured; do not describe those as passed stages.
- Final desktop/mobile hero and full-page screenshots were inspected. The former clipped-logo appearance was a capture issue, resolved without changing the original logo crop.

Detailed methods, commands, state coverage and earlier harness corrections: [design report](../docs/charcoal-design-review.md) and [form visual/accessibility report](../docs/estimate-visual-accessibility-review.md).

## Accessibility disposition

Each engine produced **45 axe summaries, zero reported violations, and 51 inconclusive color-contrast node/state records**. Those repeated records are **not 51 distinct defects**:

- 29 non-text symbol records: 14 explicitly aria-hidden records and 15 labeled trust-icon records.
- 22 actual text/control records: repeated placeholders, form copy/help/privacy, brand titles and footer text.
- Bounded review of source foreground/background colors and final screenshots found **no confirmed contrast defect in the sampled states**. This is not a claim of zero possible defects or full WCAG conformance.

The [PR #2 bounded manual interpretation](https://github.com/townsendjat-arch/flooring-site/pull/2) contains the record breakdown, sample ratios and reviewed states. Retain the raw incomplete findings; do not relabel them as an automated pass. Manual screen-reader, physical-device and native zoom checks remain incomplete.

## Evidence retention

- [Chromium screenshots and scan summaries](https://github.com/townsendjat-arch/flooring-site/actions/runs/39636345024/artifacts/12361606719)
- [WebKit screenshots and scan summaries](https://github.com/townsendjat-arch/flooring-site/actions/runs/39636345024/artifacts/12361781434)

Each artifact contains 126 PNGs plus summaries and has seven-day retention, expected through 2026-10-28. Updated selected before/after screenshots were also delivered separately for owner/client review. An expired artifact link is not fresh verification; preserve needed evidence before expiry through an authorized destination.

## Not run or not established

- Actual Safari/iOS/Android devices, VoiceOver/TalkBack, and native 200%/400% browser zoom. Root-font enlargement and narrow viewport checks do not replace them.
- Provider/account protections, real submissions, notification delivery, inbox receipt or response operations. `estimate-config.js` still has an empty endpoint. All browser transport is mocked and external requests blocked.
- Local browser execution: startup failed because of process-socket restrictions. The passing browser evidence came from isolated GitHub Actions runners, not a local browser pass.
- Final approved release origin/commit and post-deployment behavior; no merge or deployment occurred.

## Documentation update verification and future checks

Prepublication validation on 2026-10-21 (UTC) passed: exactly the four requested new Markdown paths, 26 valid relative-link targets, clean whitespace, and no edits to existing production/workflow/report files. Production/test syntax and all four mocked adapter tests passed again with the docs present. These local checks are not a new browser run. Recheck the remote branch head before publication so concurrent work is preserved. The containing Git commit identifies the exact documentation revision without falsely claiming that an earlier code run tested it.

The existing [test workflow](../.github/workflows/charcoal-design-review.yml) is PR-only and restricted to this review branch, requests contents-read access, retains no checkout credentials and has no deployment or live-delivery step. Observed Pages runs were main-only; account-level settings/hidden webhooks were not audited. After a docs push, wait for that exact head's triggered checks and report their result separately. Later code edits or rebases require new exact-head evidence.

Before release, complete the open gates in [TASKS.md](TASKS.md) and the [provider/prelaunch checklist](../docs/estimate-form.md). Passing CI means tested development, not launch approval.


## Focused implementation verification: 2026-11-05

The containing revision adds the authorized hidden future gallery/testimonials, phone-first workmanship layout, narrow navigation, photo/failure-copy corrections and coverage-neutral wording. The exact published SHA and completed CI result belong in [PR #2 checks](https://github.com/townsendjat-arch/flooring-site/pull/2/checks) and its review summary, not the older code-run rows above.

- Local production/test JavaScript syntax, four mocked adapter unit tests, whitespace and unchanged original asset/config/module checks are run before publication. Local browser startup is unavailable: Chromium fails its required process socket; an execution retry failed during sandbox setup. Browser-install downloads were invalid archives. These are infrastructure limits, not browser passes.
- The existing isolated PR-only Chromium/WebKit workflow supplies the browser evidence for the published candidate. It still blocks non-local requests and mocks provider transport. Check the exact run's final result before treating the candidate as passed.
- New tests cover hidden/empty/inert future sections, original featured story and photograph/logo preservation, test-only populated card accessibility/reflow, 320/375/812px navigation, phone photo placement/natural proportions, enlarged text and image-failure copy. Existing form regressions remain in the aggregate suite.
- Before/after images now compare complete HTML/CSS/JS from `cd212ee19fa272c8e8d9ab284b7555a1def62121` with the candidate. Mobile/narrow full-page and initial-view captures are generated for both engines. The former unchanged-layout assertion was replaced by explicit intended-change and preservation checks.
- Historical October screenshot artifacts have expired and cannot serve as new visual verification. New screenshots require visual review and durable authorized delivery before short-lived CI artifacts expire.

Actual devices, Safari application, screen readers, native browser zoom, provider protection and real inbox delivery remain unverified. No passing mock or screenshot authorizes launch.

## Combined candidate preparation: 2026-11-05

The combined branch is based on `0efaf1661ab17a2015fad8425aa710122dfad840`, which contains PR #1 and PR #2. Its new Formspree parsing correction, related regression tests, test-only workflow allowance and tracking updates form a distinct candidate. Do not attribute the base's 51/51 Chromium and 51/51 WebKit results to this new head.

- Local production/test syntax and mocked adapter unit tests are available. The full main-to-candidate diff is checked for whitespace and preservation of original assets, endpoint, visible content and hidden future sections.
- Local Chromium aggregate startup fails before browser scenarios execute because its required process socket is prohibited. WebKit's executable is absent. These are infrastructure blockers, not passing browser tests or observed application assertion failures. Offline `npm ci` could not find one cached development package; already-installed matching dependencies were copied for the local attempt, not counted as a clean install.
- The existing isolated workflow now also admits the exact combined candidate branch. It checks out the PR's exact head, performs a clean locked dependency install, validates all test-file syntax and the complete PR-base diff, and runs both engines. It has no publication/deployment step, uses read-only contents access, retains no checkout credentials and blocks non-local browser traffic.
- Two new browser scenarios cover the current raw `next` acceptance response without navigation and contradictory success/error rejection. Unit fixtures cover malformed bodies, explicit error variants, provider validation rejections and transport guarantees.
- Until the combined draft's exact-head jobs finish successfully, its browser and clean-install evidence is **pending**. The PR's checks and final review summary are the source for the resulting SHA, counts and links. No production build, linter or typechecker is configured.

Future changes to the endpoint, CAPTCHA, provider behavior, content or code invalidate the current candidate and require affected tests plus fresh full exact-head checks before release approval.


## Owner-supplied endpoint candidate: 2026-11-05 (UTC)

This current section supersedes earlier empty-endpoint state descriptions without changing their historical results. The owner supplied `https://formspree.io/f/mdeejyvl`; this revision configures only that public module, adds contact/config/honeypot regressions and updates the handoff. UI code, HTML, styles, adapter, assets and workflow are unchanged from the prior candidate.

- Local production/test syntax, eight mocked adapter tests and diff whitespace passed. The config smoke test injects fake transport even when reading the actual endpoint. No provider request was made.
- The aggregate local attempts each report 8 passing unit tests and 53 browser tests blocked in startup hooks. Chromium fails its required process socket (`Operation not permitted`); Playwright WebKit is absent. Browser assertions never ran locally. These failures are not an application pass or new observed application defect.
- Four new browser scenarios check real-config Email/Text/Phone call requirements and payloads plus the honeypot's accessibility/forwarding contract. There are now 53 unique browser scenarios (14 design/content, 39 form) and 8 mocked adapter tests, expected 61 per engine.
- Fresh Chromium/WebKit CI for this configured candidate is **pending** until its exact-head run completes. The [PR #3 checks](https://github.com/townsendjat-arch/flooring-site/pull/3/checks) and final review report record the authoritative SHA and outcomes. Do not count the previous 56/56 results at `8fb3aabddf522a635075a6973b7369e485b9810a` as a pass for this code.
- CI continues to block all non-local browser traffic; configured smoke cases install fake `fetch` before application scripts. No live submissions, real customer data or external notifications are part of CI.

Actual Formspree configuration, HTTPS/CORS and domain behavior, validation/CAPTCHA/spam/quota controls, inbox notifications/Reply-To, manual devices/accessibility/content and final merge/deploy approval remain open. The site has not been released.
