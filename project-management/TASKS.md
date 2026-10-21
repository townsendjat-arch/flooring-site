# Charles's flooring website: tasks and release gates

Last verified: **2026-10-21 (UTC)**. Charles remains **Priority #1**.

## Current status

- **Ready for owner/client review: YES**, with the evidence and limitations below. This does not mean the owner has approved the final package.
- **Ready for launch: NO.** Provider setup, real delivery, manual accessibility/content review, and release approval remain open.
- **Released from this review package: NO.** Both PRs remain draft and unmerged. Development completion is not launched functionality.
- Design review: [PR #2](https://github.com/townsendjat-arch/flooring-site/pull/2), branch `review/charcoal-white-design`, code-tested commit `98c944d685a6814078054301f8597f1ed274a138`.
- Form dependency: [PR #1](https://github.com/townsendjat-arch/flooring-site/pull/1), branch `review/estimate-form-safe-submit`, unchanged commit `6f2612cd3f74ac2573cfefbdf23ecb360de98fb0`.
- Observed `main`: `3a845667aa1acace923ce200b3b6f3544ec20e0e`. The latest observed Pages deployment is [2026-10-08 run 37811969212](https://github.com/townsendjat-arch/flooring-site/actions/runs/37811969212), not either review package.
- This tracking addition is documentation-only. Its new head is separate from the code-tested commit above; use [PR commits](https://github.com/townsendjat-arch/flooring-site/pull/2/commits) and [checks](https://github.com/townsendjat-arch/flooring-site/pull/2/checks) for the exact current revision and its own CI result.

## Status index

- **Completed:** the development, bounded review and tracking work listed below. None of it is marked released.
- **In Progress:** no design or feature implementation. Current documentation-revision CI status is shown in [PR checks](https://github.com/townsendjat-arch/flooring-site/pull/2/checks).
- **Pending:** actual-device/assistive-technology/native-zoom testing (C6); post-release verification only after an authorized release (C9).
- **Blocked:** provider controls and real notification-delivery verification (C4-C5) depend on approved setup and separately authorized synthetic tests; the endpoint remains empty.
- **Awaiting Approval:** final form/design review (C1), processor/inbox (C2), terms/privacy/operations (C3), content signoff (C7), and exact-candidate merge/deployment (C8). Gate details below remain authoritative.

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
| C7 | Sign off existing service-territory wording, reviews block, photo-request wording for a text-only form, contact links, project copy and photo permissions | Charles/owner content approval; these contents were intentionally preserved |
| C8 | After the separately approved form merge, retarget/rebase the design PR and rerun the complete suite on the resulting release candidate | New exact SHA, passing checks, final approval of merge/deployment and rollback plan |
| C9 | Verify the approved origin, provider dashboard and inbox after an authorized release | Post-release evidence before marking any functionality launched |

Detailed provider and acceptance checklists remain in [estimate-form.md](../docs/estimate-form.md); do not duplicate or silently relax them here.

## Scope boundaries

No further design or feature changes are authorized by the tracking request. Do not merge, deploy, activate integrations, purchase services or contact outside parties without approval. Customer acquisition remains **research-only**. No customer lead data belongs in these public tracking files.

Next owner decision: review the existing PR packages separately, then decide which launch gates to authorize. Track decisions in [DECISIONS.md](DECISIONS.md); update verification in [TESTING.md](TESTING.md).
