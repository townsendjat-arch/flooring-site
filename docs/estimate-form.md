# Estimate form: review and launch checklist

Status: proposed code only. The Formspree endpoint is deliberately empty, so nothing is transmitted and no success screen is shown on Send. An early notice, before the first question, explains that online requests are unavailable and offers the existing call/text links. The notice remains for an empty or invalid endpoint and is hidden when the configured endpoint passes the same URL check used before sending. Do not merge or deploy without the owner's approval. This change does not create a provider account, configure an inbox, buy a plan, or change hosting.

## Scope and architecture

The existing static site, imagery, contact links, and branding are preserved. The unavailable notice receives initial focus on step one so it stays in view before customers fill out the form, and is included in the dialog description only while displayed. The four-step estimate dialog now validates every supplied field, requires the chosen contact channel, handles keyboard submission and closing, and waits for explicit provider acceptance before confirmation. The browser adapter is in `estimate-service.js`; public configuration is in `estimate-config.js`. No server code is included. Client validation can be bypassed and is not a security boundary.

First launch is text-only: project type, optional details, ZIP/city, timing, optional space note, name, preferred contact method, and the contact fields provided. Phone is required for Text/Phone call; email is required for Email. A supplied optional email or phone is still validated. Photo uploads are absent; visitors can discuss photos directly later. Future uploads require a separate decision about storage, limits, access, consent, retention, and safe file handling.

No lead data is logged or saved in browser storage by this code. Draft values stay in the current page while the dialog is closed or an error occurs, and clear on explicit “Start another request” or page reload. Closing during submission does not cancel delivery. A timeout or lost response may occur after acceptance; the error text warns that retrying can create duplicates. There is no server-side idempotency guarantee. The confirmation means provider acceptance, not verified mailbox delivery, a booked appointment, or a response-time guarantee.

## Required owner decisions before activation

- [ ] Approve Formspree as the processor and create/select the owner-controlled account and exact form.
- [ ] Approve and verify the destination inbox. The email already printed in the footer is not assumed to be the authorized destination.
- [ ] Review the provider's current terms, privacy, storage/retention, plan limits, and any costs before accepting or buying anything.
- [ ] Approve the provisional form privacy copy for the actual configuration. Link an appropriate reviewed privacy notice if required. Do not promise deletion schedules or exclusive use beyond verified practice.
- [ ] Decide who handles incoming requests and how often the inbox/dashboard will be checked. No response-time promise has been introduced.

## Provider and server-side protection: launch blockers

- [ ] Verify recipient activation and turn off unapproved integrations, autoresponders, subscriptions, and forwarding.
- [ ] Configure and test provider-side required fields, allowed project/timing/contact values, length limits, email validation, and the contact-channel conditions. Browser checks alone do not enforce these. If the selected plan cannot enforce the rules, keep launch blocked until an approved server-side validation solution exists.
- [ ] Confirm rate limits, over-quota behavior, spam filtering, and monitoring of spam/quarantine. `_gotcha` is sent as a honeypot, but is only one layer; provider enforcement is external and unverified.
- [ ] Choose and test the provider's supported AJAX spam/CAPTCHA flow. This adapter does not implement a challenge widget. If an active configuration requires a challenge/token, add and test it before launch rather than simply disabling protection.
- [ ] Enable appropriate domain restrictions after the actual production origin is confirmed; review www/apex and any authorized staging origins. Restrictions are not authentication and may depend on browser referrer behavior. Check the selected plan supports them.
- [ ] Confirm HTTPS, endpoint ownership, and browser CORS behavior on the approved origin. No Cloudflare migration or DNS change is part of this work.
- [ ] Never place API keys or credentials in these public static files. The public form endpoint is not a secret.

## Configure only after approval

1. Copy the owner's approved public endpoint in the form `https://formspree.io/f/FORM_ID` into `endpoint` in `estimate-config.js`. Do not use an email-address endpoint or a test placeholder on a deployed site.
2. Keep the default 15-second timeout unless testing warrants a change.
3. Recheck provider acceptance semantics against the selected form. This adapter requires an HTTP success plus JSON `ok: true`, with no errors. HTML, malformed JSON, and ambiguous responses fail closed.
4. Do not add a live endpoint to automated tests. They replace transport and block outside requests; all contact data is fictional.

## Local review

Use Node.js 22+ and install the pinned development dependencies with `npm install --ignore-scripts --no-audit --no-fund`. Then run `npm run check` and `npm test`. Browser tests use Playwright; install Chromium and WebKit with `npx playwright install --with-deps chromium webkit`. Run `BROWSER=chromium npm test` and `BROWSER=webkit npm test` separately. An existing compatible Chromium may be selected via `CHROMIUM_PATH=/path/to/chromium npm test`. Set `REVIEW_ARTIFACTS=review-artifacts/chromium` (or `webkit`) to retain local synthetic screenshots and axe summaries. There is no production build step or runtime package dependency. For manual local review, serve the repository over HTTP, for example `python3 -m http.server 8000`, then open localhost. ES modules are not intended to run from a `file://` URL.

## Prelaunch tests (after separate authorization for real test delivery)

- [ ] Run the automated suite; resolve browser-startup failures before treating it as passed.
- [ ] Desktop and mobile: all project CTAs; Back; repeated open/close; different project after closing; Tab/Shift+Tab; Escape; Enter; textarea newlines; readable focus/errors; screen-reader announcement; no horizontal overflow.
- [ ] Missing fields; whitespace-only required values; invalid provided email/phone; each contact preference; optional fields empty; maximum-length input.
- [ ] One authorized test per contact preference with fictional project details and an approved contact address/number. Confirm exactly one provider submission and one notification in the approved inbox, including spam. Confirm field mapping and reply behavior.
- [ ] Successful acceptance; repeated click/Enter; provider rejection; quota/429; offline; timeout; blocked request; malformed response; retry. Confirm no false success and no data loss while the page remains open.
- [ ] Verify provider spam/domain/server rules with approved fake tests. Do not use real homeowner data for testing.
- [ ] Confirm call/text links and browser fallback when JavaScript cannot run. Check Safari/iOS and Android browsers; Chromium emulation is not full device coverage.
- [ ] Obtain explicit merge/deploy approval. Verify the exact release commit, approved origin, provider dashboard and mailbox after deployment. Retain a reviewed rollback plan.

## Deployment guardrail evidence

At the reviewed baseline `3a845667aa1acace923ce200b3b6f3544ec20e0e`, the repository had no `.github/workflows`, third-party deployment config, or custom build scripts. Its ten available Actions runs were GitHub Pages' built-in `dynamic/pages/pages-build-deployment` on `main`. The successful build log explicitly checked out `main`. No external commit statuses were present. Pages settings and repository webhooks are not exposed by this connector, so this is observed evidence, not a claim to audit every account integration. This review branch does not change main, hosting, or deployment settings. Recheck deployment behavior before any future push/merge if integrations change.

## Official setup references (checked 2026-10-09)

- [AJAX forms](https://help.formspree.io/articles/building-your-form/submit-forms-with-javascript-ajax/)
- [Honeypot filtering](https://help.formspree.io/articles/building-your-form/honeypot-spam-filtering)
- [Domain restrictions](https://help.formspree.io/articles/form-and-project-settings/restrict-to-domain)
- [Form Rules](https://help.formspree.io/articles/advanced-features/form-rules)

These references describe provider features. None of those account settings has been configured or verified by this code change.

## Verification of this proposal (2026-10-09)

### Passed

- GitHub Actions ran the full suite on the exact PR head `ac41f30e1f469c3001c18800bf25ec470d8bab1e`: **24 passed, 0 failed, 0 skipped** (20 Chromium browser scenarios and 4 mocked adapter unit tests). [Successful run and detailed logs](https://github.com/townsendjat-arch/flooring-site/actions/runs/37980098510/job/113988121120). The test-only workflow reruns on later updates; check the latest PR check for the final head.
- Browser assertions passed at 1280×900 and 375×812, including the notice being fully in view before input and after a scrolled close/reopen, configured/invalid endpoint behavior, and the existing call/text URLs. Keyboard, validation, duplicate submissions, error recovery, and confirmation checks also passed.
- `npm run check`: syntax checks for all three production JavaScript modules.
- `node --check tests/estimate-browser.test.cjs`: browser-test syntax.
- Four mocked adapter unit tests: destination restrictions; explicit acceptance and transport settings; rejected, malformed, and ambiguous responses; network failures and timeouts.
- `git diff --check` and static inspection of the conditional notice, preserved contact URLs, and unchanged empty production endpoint.

### Earlier local browser blocker, resolved by the CI runner

The current command was `CHROMIUM_PATH=/usr/bin/chromium npm test`. The aggregate runner returned 4 passed and 20 failed. All 20 browser entries failed in the shared browser-startup hook, before any browser scenario executed; these are infrastructure errors, not observed application assertion failures or browser passes. Chromium aborted at `chrome/browser/process_singleton_posix.cc:297`: `socket() failed: Operation not permitted (1)`. It also reported a read-only Crash Reports settings path. The earlier permitted execution retry hit the same socket restriction.

The supported cloud browser cannot reach the isolated local HTTP server. Its local-file navigation is explicitly rejected (only HTTP/HTTPS navigation is supported), and its supported automation API has no request interception, initialization script injection, or writable page evaluation for this suite's fake transport and network guards. No supported remote Playwright execution bridge is exposed. No public preview or deployment was created to work around these limits.

The same twenty mocked browser scenarios subsequently passed on the GitHub runner. They cover desktop/mobile notice visibility before input, valid and invalid configuration, existing call/text links, Tab/Shift+Tab and Enter/Escape, all project/open buttons, required and optional validation, whitespace, repeated submissions, close/reopen, draft preservation, provider rejection and retry, rate limiting, network/timeout/ambiguous/server errors, confirmation/reset, and mobile overflow/recovery. Every outside request is blocked; provider outcomes are simulated in-page with fictional data. No real form delivery was attempted.

### Test-only GitHub Actions runner

A narrowly scoped workflow is included for PR #1 on `review/estimate-form-safe-submit`. It runs on the standard `ubuntu-latest` runner, checks out the exact PR head SHA, requests only read access to repository contents, does not persist checkout credentials, and runs syntax checks plus the mocked unit/browser suite. No application secrets, live delivery, deployment steps, or package-manager caches are used. The final visual-review extension runs Chromium and Playwright WebKit separately and uploads only synthetic form screenshots and axe summaries with three-day retention; no browser traces, cookies, or real lead data are collected. The job has a ten-minute limit and superseded runs are canceled. GitHub [documents standard public-repository runners as free](https://docs.github.com/en/billing/concepts/product-billing/github-actions). CI results must be checked for the exact published commit; inclusion of this workflow alone is not a test pass.

### Before launch

Keep the full suite green on the exact release candidate and visually inspect desktop/mobile layouts. Actual screen-reader behavior, Safari/iOS, Android devices, provider-account protections, recipient-mailbox delivery, and real submissions remain unverified. Complete the owner/provider checklist above, then obtain separate merge/deploy approval. Passing a mocked test is not evidence of real delivery.

### Publication guardrails rechecked

Before this same-branch update, `main` remained at `3a845667aa1acace923ce200b3b6f3544ec20e0e`; the PR remained draft at its prior head. The pre-update repository tree had no `.github/workflows` or third-party deployment config, and all ten observed Actions runs remain the built-in Pages workflow on `main`, most recently on 2026-10-08. The existing review commit had no external status checks. Deployment settings, deployment records, and webhooks are not exposed by the connector, so this is observed evidence rather than an audit of every account integration. Only the bounded test workflow described above is added. No deployment workflow, hosting setting, live endpoint, account, purchase, merge, or deployment is included.

## Final visual and accessibility review

See [the focused review record](estimate-visual-accessibility-review.md) for confirmed fixes, rendered-state coverage, evidence limits, and the owner’s real-device checklist. The current exact-head CI result and evidence links are recorded in PR #1.
