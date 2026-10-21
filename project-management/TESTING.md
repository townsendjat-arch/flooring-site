# Charles's flooring website: verification ledger

Evidence checked: **2026-10-21 (UTC)**. Scope: existing form/design review package, not the deployed site.

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
