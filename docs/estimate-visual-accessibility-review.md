# Estimate form visual, mobile usability, and accessibility review

Date: 2026-10-09. Scope: the existing estimate dialog in draft PR #1, on `review/estimate-form-safe-submit`. This is a prelaunch code review, not launch approval. The production provider endpoint stays empty.

## Changes and why

- Set an explicit opaque muted color for example/placeholder text. Final WebKit screenshots exposed its native #a9a9a9-on-white treatment (2.35:1), even though axe marked that node inconclusive. A dedicated regression requires placeholder text to meet 4.5:1.
- Darkened form field boundaries and focus indicators using existing neutral/ink colors. Original boundary and focus colors were approximately 1.44:1 and 1.45:1 against white. The new borders measure 4.27:1 against white and ink focus outlines measure 16.85:1 against white, with regression assertions for at least 3:1.
- Added persistent, specific validation explanations next to each invalid field/group, associated through `aria-describedby`. Removed reliance on transient native validation popups. Input focus still moves to the first invalid control; provider failures retain a focused alert and the draft.
- Clear invalid state and its explanation for the whole radio group when a choice changes. Previously, choosing an option after an empty Continue left the other valid group members falsely marked invalid.
- Correct a Playwright WebKit short-viewport focus-scroll failure while retaining native Tab/Escape behavior.
- Give Close a 44×44 CSS-pixel target; keep narrow form padding and flexible actions/heading so the form can reflow. Let field/choice columns respond to enlarged text instead of remaining tightly paired. Preserve existing typography, yellow accents, site sections, imagery, contact URLs, and form choices.
- Expose step-count descriptions when the step section receives focus, hide the decorative confirmation check mark from assistive technology, and honor reduced motion for the progress animation.

## Automated and rendered review method

The test-only GitHub workflow runs the exact PR head on standard Ubuntu runners in two jobs: pinned Playwright Chromium and Playwright WebKit. WebKit on Linux is not the Safari application or an Apple device. Each job runs all existing mocked delivery regressions and the new review checks. The command and exact SHA/result links are recorded in the PR description so the record does not require endlessly changing the tested commit to mention itself.

The form is served only on temporary loopback HTTP. Every non-local request is blocked, and provider responses are simulated in-page with fictional data. The real adapter endpoint remains empty. No test message, account, inbox, or delivery was configured.

Rendered state captures and axe WCAG A/AA-tagged scans cover:

- 1280×900 desktop; 375×812 touch-capable viewport; 320×640 narrow reflow; 812×375 landscape; 640×900 with the root font enlarged to 200%.
- All four input steps, invalid phone feedback, provider rejection, successful mocked confirmation, and the early unconfigured notice.
- Overlapping vertical screenshot slices retain the actual scrollable dialog layout. These are visual inspection evidence, not a baseline pixel-diff guarantee. Root-font enlargement is a text-resize stress test; native browser zoom was not performed. A 320-CSS-pixel viewport tests reflow but does not certify browser zoom.
- Axe scans are confined to the requested estimate form. No rule exclusions are applied within the selected WCAG A/AA tags. Automated scans cannot establish full WCAG conformance or human screen-reader usability. Axe scans run at overlapping scroll positions; a node still unresolved after those passes is retained as incomplete for review.

Additional assertions cover keyboard-only radio selection; Tab/Shift+Tab cycles; hidden-step accessibility semantics; active-step, Back, confirmation, validation, and opener focus; focused-control visibility in short viewports; persistent field explanations and corrections; 44px principal targets; focus contrast; reduced-motion progress; no-JavaScript direct-contact fallback; duplicate submissions; close/reopen; preservation/reset; and configured/unconfigured/error transport behavior.

Artifacts include only synthetic form screenshots and minimal axe summaries, with three-day retention. No browser traces, cookies, account information, or real homeowner data are uploaded. The workflow still has contents-read permissions, does not persist credentials, and contains no deployment step or deployment trigger.

## Required personal checks: not performed

Use this branch in an approved local/private preview, not the unchanged live page. No new public preview or deployment was created for this review.

1. On a real iPhone in Safari, open from a project card, complete each step, rotate portrait/landscape, show and dismiss the software keyboard, and use Back/Close/reopen. Check that the focused field and action buttons are reachable without sideways scrolling. Verify the phone/email keyboards and autofill behavior.
2. With iPhone VoiceOver enabled, confirm that the dialog title, unavailable notice, step name/count, group choices, required fields, specific validation errors, and Close are understandable. Confirm focus returns to the triggering button and background page content is not navigable while the modal is open. Do not send a real request.
3. In desktop Safari, repeat keyboard navigation with its keyboard-navigation setting enabled. Try native browser zoom at 200% and 400%, and increased text size. Confirm all content and controls remain reachable.
4. If an Android device is available, repeat portrait/landscape, software-keyboard, autofill, and TalkBack navigation checks in Chrome. This is additional device coverage, not something the automated mobile viewport establishes.
5. In an authorized local mocked test environment only, have a screen-reader user review sending, rejection, and success announcements. The production unconfigured form must continue to show that nothing was sent. Real provider/inbox tests remain a separate authorization and configuration step.

## Release gates remain

Keep PR #1 draft. No merge, deployment, hosting/DNS change, provider account, live endpoint, purchase, or other website modification is part of this review. Provider/server-side validation and spam protection, approved recipient/privacy/terms, actual delivery, device/Safari/screen-reader checks, and explicit release approval remain before launch. A passing mock suite is not evidence of inbox delivery.

## Recorded review evidence

The final-code predecessor `6092742d1028009579d4fc0c06e4b6efecb73b9e` passed all 37 tests in both engine jobs: 33 browser scenarios and the same four unit tests per job. [Run 37983342346](https://github.com/townsendjat-arch/flooring-site/actions/runs/37983342346) checked out that exact head. Subsequent screenshot inspection identified the WebKit placeholder contrast issue above, so that pass is historical evidence, not a pass for the newer fix. The PR description records the latest exact-head results after that fix.

For that review, 100 actual screenshots and 40 state/layout summaries per engine were inspected (100 overlapping-position axe executions per engine). No screenshot layout collision or horizontal clipping of labels, errors, or actions was found in the tested configurations. Long placeholder examples inside single-line text inputs are naturally cropped by the input, while the separate labels remain visible. The enlarged-text field/choice grids now stack cleanly. These screenshots do not establish touch hardware, browser-zoom, screen-reader, or live-delivery behavior.

Axe returned zero violations but retained 20 inconclusive color-contrast node/state assessments per engine, covering background overlap/obscuration detection and the non-text check mark. Those are not recorded as automated passes. The screenshots made the WebKit placeholder defect visible and it was fixed. Other flagged intro/help/privacy/contact text was visually unobscured, and the decorative check mark uses the dark ink color; a human accessibility review remains required.

Earlier review iterations also corrected two test-harness problems (version logging and explicit browser context for axe) and made tab-cycle assertions respect native browser-chrome traversal. Their failed runs are not represented as product regressions or passes. The original delivery regressions stayed green once the harness ran. The real WebKit short-viewport focus-scroll failure was reproduced and fixed before the green predecessor run.
