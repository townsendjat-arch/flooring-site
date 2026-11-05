# Charles's flooring website: tasks and release gates

Last implementation review: **2026-11-05 (UTC)**. Historical test dates below are retained. Charles remains **Priority #1**.

## Current status

- **Owner/client final review: pending**, after checking the current implementation candidate and its exact-head CI. Earlier approval of the direction is not approval to release this package.
- **Ready for launch: NO.** Provider setup, real delivery, manual accessibility/content review, and release approval remain open.
- **Released from this review package: NO.** Both PRs remain draft and unmerged. Development completion is not launched functionality.
- Current implementation: [PR #2](https://github.com/townsendjat-arch/flooring-site/pull/2), branch `review/charcoal-white-design`; use its commits and checks for the exact candidate. Historical October design-tested commit: `98c944d685a6814078054301f8597f1ed274a138`.
- Form dependency: [PR #1](https://github.com/townsendjat-arch/flooring-site/pull/1), branch `review/estimate-form-safe-submit`, unchanged commit `6f2612cd3f74ac2573cfefbdf23ecb360de98fb0`.
- Observed `main`: `3a845667aa1acace923ce200b3b6f3544ec20e0e`. The latest observed Pages deployment is [2026-10-08 run 37811969212](https://github.com/townsendjat-arch/flooring-site/actions/runs/37811969212), not either review package.
- The October tracking addition was documentation-only. The November focused pass changes code and tests; use [PR commits](https://github.com/townsendjat-arch/flooring-site/pull/2/commits) and [checks](https://github.com/townsendjat-arch/flooring-site/pull/2/checks) for its exact revision and its own CI result.

### Combined launch-preparation candidate

The next phase uses `release/combined-candidate-2026-11-05`, based on PR #2 head `0efaf1661ab17a2015fad8425aa710122dfad840`. That head already contains PR #1; no main update or intermediate form-only release is required to combine them. Both existing draft PRs stay unchanged. The combined draft targets `main` so its full diff is reviewable in one place.

The only new production correction is the Formspree response parser: accept the current documented raw `next` success marker without navigating to it, and reject contradictory error fields and malformed bodies. Mocked unit/browser regressions cover this correction. The endpoint remains empty, future content hidden, and all live-provider/manual/device/content gates remain open. Exact-head CI must complete before automated verification is marked passed.

## Status index

- **Completed:** the development, bounded review and tracking work listed below. None of it is marked released.
- **Implemented, awaiting final review:** the approved focused mobile/content pass described below. Exact containing commit and latest CI status are shown in [PR checks](https://github.com/townsendjat-arch/flooring-site/pull/2/checks).
- **Pending:** actual-device/assistive-technology/native-zoom testing (C6); post-release verification only after an authorized release (C9).
- **Blocked:** provider controls and real notification-delivery verification (C4-C5) depend on approved setup and separately authorized synthetic tests; the endpoint remains empty.
- **Awaiting Approval:** final form/design review (C1), processor/inbox (C2), terms/privacy/operations (C3), content signoff (C7), and exact-candidate merge/deployment (C8). Gate details below remain authoritative.

## Focused implementation: 2026-11-05

- Prepared empty, native-hidden future project gallery and testimonial sections with inert reusable cards and [content/approval instructions](../docs/content-guide.md). No invented photos, quotes, ratings or attribution.
- Kept the existing featured shower story visible and all original image files/full-color logo unchanged.
- Moved the original finished photograph ahead of the copy on phone widths, retaining its natural proportions. Restored three visible navigation links on narrow screens with touch targets and anchor offsets.
- Corrected text-only form/photo guidance and replaced developer filename fallbacks with plain image-load failure messages. Removed the public reviews placeholder. Coverage remains unconfirmed; copy now asks visitors to check availability.
- Added hidden-content, card-population, phone-layout/navigation, failure-state and preservation regressions. Before screenshots use the full `cd212ee19fa272c8e8d9ab284b7555a1def62121` baseline, not old CSS applied to new HTML.
- No provider activation, merge or deployment. Waiting for Charles's information does not block this development pass; it still blocks final content signoff where applicable.

## Completed development and review evidence

| Item | Development/review state | Release state | Evidence |
| --- | --- | --- | --- |
| Safe estimate flow | Implemented; validation, focus/keyboard, errors, retries, confirmation and mock transport tested | Not launched; endpoint empty | [Form guide](../docs/estimate-form.md), [form review](../docs/estimate-visual-accessibility-review.md), PR #1 |
| Neutral interface with original full-color logo | Implemented and browser-tested; original artwork, photos, layout, copy and contact destinations preserved | Not launched; final visual signoff pending | [Design report](../docs/charcoal-design-review.md), PR #2 |
| Design/form regression suite | Passed on exact code-tested head: 44/44 Chromium and 44/44 WebKit | Not release approval | [Testing ledger](TESTING.md) |
| Inconclusive contrast records | Bounded manual screenshot/source-color review found no confirmed contrast defect in sampled states | Not full accessibility signoff | [Testing limits](TESTING.md#accessibility-disposition), PR #2 |
| Project tracking | Four requested files added on existing design-review branch; existing detailed reports retained | Documentation only | [Maintenance instructions](../LINK-INSTRUCTIONS.md) |

## Open blockers and approvals

All items below remain open unless new dated evidence and the required approval are recorded. The owner chooses/approves the provider and operational owner; no account setup is authorized by this tracker.

| ID | Gate and next action | Decision/verification needed |
| --- | --- | --- |
| C1 | Review PR #1 and PR #2 separately; inspect final desktop/mobile screenshots and full-color logos | Owner/client final visual and form approval |
| C2 | Select/approve processor, owner-controlled account/form and exact notification inbox | Owner approval; footer email is not presumed authorized |
| C3 | Review current provider terms, privacy wording/notice, retention, limits/costs, and inbox/dashboard ownership | Owner approval and named operational owner; no service purchase or activation yet |
| C4 | Verify recipient activation, server-side field/contact/length validation, quotas, rate limits, spam/quarantine, AJAX CAPTCHA compatibility, domain restrictions, HTTPS and CORS | Provider/account checks; browser validation and honeypot alone are insufficient |
| C5 | After explicit authorization, configure the approved endpoint and test synthetic submissions for each contact preference | Exactly one provider record AND one received notification, including spam checks, field mapping and reply behavior; actual delivery remains **unverified** |
| C6 | Run actual Safari/iPhone/Android, VoiceOver/TalkBack and native 200%/400% zoom checks | Recorded manual results and resolution/disposition of findings; engine emulation is not a substitute |
| C7 | Confirm actual service territory, contact links, business/project copy and photo permissions; approve any genuine future gallery or testimonial content | Charles/owner approval of the final copy and any newly supplied content |
| C8 | Review the full combined candidate against main; complete its exact-head checks, then obtain approval for one main update and deployment | Exact approved SHA/tree, passing checks, final merge/deploy approval, rollback plan and unchanged-base check; do not merge PR #1 as an intermediate release |
| C9 | Verify the approved origin, provider dashboard and inbox after an authorized release | Post-release evidence before marking any functionality launched |

Detailed provider and acceptance checklists remain in [estimate-form.md](../docs/estimate-form.md); do not duplicate or silently relax them here.

## Scope boundaries

The 2026-11-05 focused gallery/testimonial/mobile/content implementation is authorized; this supersedes the earlier documentation-only scope. Additional features remain outside that bounded pass. Do not merge, deploy, activate integrations, purchase services or contact outside parties without approval. Customer acquisition remains **research-only**. No customer lead data belongs in these public tracking files.

Next owner decisions: resolve the remaining provider/content/manual checks, then review the exact combined candidate and approve or decline its release. Launch preparation does not grant release approval. Track decisions in [DECISIONS.md](DECISIONS.md); update verification in [TESTING.md](TESTING.md).
