# Estimate form: review and launch checklist

Status (2026-11-05 UTC): configured, unreleased review candidate. The owner supplied `https://formspree.io/f/mdeejyvl` from their Formspree account, and the candidate now uses it. No actual submission or inbox-delivery test has been performed. Opening an isolated copy can now send when a person deliberately submits, so automated tests replace transport and block all outside requests. Empty or invalid configuration still fails closed and displays the early call/text notice. Do not merge, deploy or publish the website without final approval. No provider settings, inbox, paid plan or hosting changes were made. Historical verification sections below describe earlier revisions, not the configured candidate.

## Scope and architecture

The existing static site, imagery, contact links, and branding are preserved. The unavailable notice receives initial focus on step one so it stays in view before customers fill out the form, and is included in the dialog description only while displayed. The four-step estimate dialog now validates every supplied field, requires the chosen contact channel, handles keyboard submission and closing, and waits for explicit provider acceptance before confirmation. The browser adapter is in `estimate-service.js`; public configuration is in `estimate-config.js`. No server code is included. Client validation can be bypassed and is not a security boundary.

First launch is text-only: project type, optional details, ZIP/city, timing, optional space note, name, preferred contact method, and the contact fields provided. Phone is required for Text/Phone call; email is required for Email. A supplied optional email or phone is still validated. Photo uploads are absent; visitors can discuss photos directly later. Future uploads require a separate decision about storage, limits, access, consent, retention, and safe file handling.

No lead data is logged or saved in browser storage by this code. Draft values stay in the current page while the dialog is closed or an error occurs, and clear on explicit “Start another request” or page reload. Closing during submission does not cancel delivery. A timeout or lost response may occur after acceptance; the error text warns that retrying can create duplicates. There is no server-side idempotency guarantee. The confirmation means provider acceptance, not verified mailbox delivery, a booked appointment, or a response-time guarantee.

## Required owner decisions before activation

- [x] Owner selected Formspree in their own account and supplied the public form endpoint (2026-11-05). Endpoint ownership/account settings are owner-reported, not independently inspected.
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

## Public configuration and later account change

1. The owner-supplied endpoint is now the `endpoint` value in `estimate-config.js`. To replace it later, change only that value to the approved public `https://formspree.io/f/FORM_ID`. Set it to `""` to disable online requests. Do not use an email-address endpoint or a test placeholder on a deployed site.
2. Keep the default 15-second timeout unless testing warrants a change.
3. Recheck provider acceptance semantics against the selected form. The prepared adapter requires HTTP success plus either JSON `ok: true` or the current official SDK's raw success marker, a nonempty `next` string. It rejects contradictory error fields, malformed success markers, HTML, malformed JSON, and ambiguous responses. It never follows `next`. These are mocked contract checks, not proof of live acceptance or email delivery.
4. Candidate smoke tests load the real public configuration but replace `fetch` before application code runs and block every non-local network request. Other fixtures use only fake endpoints. No test ever uses real provider transport; all contact data is fictional.

This is an unbundled static JavaScript module: there is no build or backend account binding. A new form in Charles's account can use the same field names and adapter. Create/verify that new form and notification destination, repeat its validation/spam/domain settings, replace this one config value, then rerun automated and separately approved live-delivery checks before approving publication of the updated static file. Confirm the served config is fresh after publication (including any hosting/CDN caches) and reload open tabs. Keep the old form available until the approved cutover is verified, then have its owner decide on disabling it and handling retained submissions. Submission history and settings do not move just because the URL changes. Native Formspree form/account transfer availability is not assumed; endpoint replacement is the guaranteed website-side migration path.

## Local review

Use Node.js 22+ and install the pinned development dependencies with `npm ci --ignore-scripts --no-audit --no-fund`. Then run `npm run check` and `npm test`. Browser tests use Playwright; install Chromium and WebKit with `npx playwright install --with-deps chromium webkit`. Run `BROWSER=chromium npm test` and `BROWSER=webkit npm test` separately. An existing compatible Chromium may be selected via `CHROMIUM_PATH=/path/to/chromium npm test`. Set `REVIEW_ARTIFACTS=review-artifacts/chromium` (or `webkit`) to retain local synthetic screenshots and axe summaries. There is no production build step or runtime package dependency. For manual local review, serve the repository over HTTP, for example `python3 -m http.server 8000`, then open localhost. ES modules are not intended to run from a `file://` URL.

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

## Earlier launch preparation before the endpoint was supplied (2026-11-05, UTC)

**State: prepared for review, not activated or launch-approved.** The endpoint remains empty. No account was created, no live submission was sent, no paid plan was activated, and no deployment was performed. Gallery/testimonial sections stay hidden. This update verifies public documentation and local mocked behavior; it does not verify an owner's dashboard configuration.

### Concrete adapter correction

The earlier tests used only `{ "ok": true }`. Formspree's current official client also recognizes raw `{ "next": "test-redirect-url" }` as a successful server response. The adapter previously treated that documented shape as uncertain and also allowed contradictory `ok: true` responses with a legacy `error` or malformed `errors` value. The prepared correction handles the documented shape, rejects those contradictions and does not navigate to any returned URL. Invalid JSON is an unconfirmed response, not evidence that the request failed to arrive.

Evidence is pinned to vendor commit `3148bfbf06ed1738c618e160684d73a885d4237a`: the [raw response parser](https://github.com/formspree/formspree-js/blob/3148bfbf06ed1738c618e160684d73a885d4237a/packages/formspree-core/src/core.ts), [success/error predicates](https://github.com/formspree/formspree-js/blob/3148bfbf06ed1738c618e160684d73a885d4237a/packages/formspree-core/src/submission.ts), and [raw Response success fixture](https://github.com/formspree/formspree-js/blob/3148bfbf06ed1738c618e160684d73a885d4237a/packages/formspree-core/test/core.test.ts). This is a server-JSON fixture, not an already-transformed SDK result.

### Validation settings to prepare

The browser validates these fields before sending. Configure matching provider checks where supported. Exact field names are case-sensitive. Values are trimmed before sending; optional blank values are omitted.

| Field | Required and accepted data | Length ceiling |
| --- | --- | --- |
| `projectType` | One of Custom Shower, Bathroom Tile, Flooring, Backsplash, Stone, Tile Repair, Basement Refinishing, Not Sure Yet | 20 |
| `details` | Optional text | 3000 |
| `location` | Nonblank ZIP code or city; not restricted to a ZIP-only pattern | 120 |
| `timing` | As soon as possible, Within 1–3 months, Within 3–6 months, Just researching | 19 |
| `spaceNote` | Optional text | 500 |
| `name` | Nonblank text | 100 |
| `phone` | Required for Text/Phone call; otherwise optional. Any supplied phone has 10–15 digits and only digits, spaces, `+`, parentheses, period or hyphen | 30 |
| `email` | Required for Email; otherwise optional. Any supplied value must be a valid email | 254 |
| `contactPreference` | Text, Phone call or Email | 10 |
| `_gotcha` | Hidden honeypot; legitimate visitors leave it blank | Do not make required |

**Provider capability gap:** [Workflow](https://help.formspree.io/articles/building-your-form/getting-started-with-workflow) documents all-plan required/type/length validation, including email validation when provided. It does not document exact-choice matching, the phone character/digit rule, or “email required only when Email is selected; phone otherwise.” Those server checks are not verified and must not be marked complete. Do not make email globally required, because that would break valid phone-only requests. Leave “Require work email” disabled for this homeowner form. The separate [Form Rules](https://help.formspree.io/articles/advanced-features/form-rules) feature is Business-only delivery routing and is not evidence of conditional field validation. Do not buy it to solve this gap.

Before activation, inspect the actual account's capabilities. If these rules cannot be enforced, keep launch blocked and request approval for the smallest server-side validation solution or an explicitly revised requirement. No backend or change to the customer questions has been added in this preparation.

### CAPTCHA and spam protection

The current form sends JSON with an explicit field allowlist; it has no CAPTCHA widget or response-token field. Enabling a provider CAPTCHA switch alone is not a complete integration. Formspree's [hosted interstitial CAPTCHA](https://formspree.io/blog/recaptcha-methods/) requires navigation and is unsuitable for this AJAX flow.

A supported inline path must be selected and tested first, for example [custom reCAPTCHA v2](https://help.formspree.io/articles/form-and-project-settings/adding-a-custom-recaptcha-v2-key) with a `g-recaptcha-response` token, or [Turnstile](https://help.formspree.io/articles/form-and-project-settings/protecting-your-forms-with-cloudflare-turnstile) with `cf-turnstile-response`. That requires the owner's approved domain(s), public site key, private secret configured only in the provider dashboard, and token handling in the browser. Do not place the secret in code, chat, or test artifacts. Do not disable protection merely to make a test pass. No CAPTCHA vendor or credentials have been selected or installed here.

The later implementation/test must cover an unsolved challenge, expired token, blocked script, failed token verification, reopening the dialog, deliberate retry with a fresh token, keyboard/VoiceOver access and an iPhone success case. Keep the honeypot; [Formspree documents `_gotcha`](https://help.formspree.io/articles/building-your-form/honeypot-spam-filtering) as an additional filter, not a replacement for the chosen protection.

### Personal setup and decisions still needed

1. The owner has supplied a form in their own Formspree account for now. Confirm the exact recipient inbox and eventual Charles-owned cutover. The site's printed email address is not assumed to authorize routing. The owner signs in or creates the free account and verifies the account/linked recipient email using Formspree's verification message. No password needs to be shared. [Official account/form setup](https://help.formspree.io/articles/building-your-form/building-an-html-form).
2. The estimate form endpoint is supplied. Confirm its notification action targets that verified inbox. Check there are no unwanted autoresponders, mailing-list actions or other recipients.
3. Confirm the approved test/production origins, resolve the validation gap and select the CAPTCHA path. The owner creates/configures any CAPTCHA keys personally. Approve the actual privacy wording and provider terms before activation.
4. Confirm the test inbox and contact details we may submit, and authorize the bounded real test below. Account creation, secret setup and receipt confirmation remain owner steps unless a separately authorized secure workflow is arranged.

The [current Free plan](https://help.formspree.io/articles/account-management/account-limits) starts at 50 monthly submissions, up to two linked notification emails and 30 days of submission history. No paid plan is needed just to perform a small authorized test. Record remaining quota before testing. New [over-limit behavior](https://help.formspree.io/articles/form-and-project-settings/over-limit-submissions) can hold submissions without notification emails or actions even while the visitor-facing form still works. Do not deliberately exhaust the quota. Dashboard and inbox checks are essential.

[Restrict to Domain](https://help.formspree.io/articles/form-and-project-settings/restrict-to-domain) is documented on all plans. Apex domains include subdomains; a specific subdomain restricts to that subdomain. Wrong-origin submissions go to Spam rather than necessarily returning an error. It relies on the browser's Referer header. The adapter's `strict-origin-when-cross-origin` policy matches the documented requirement, but real-origin behavior still needs verification. Do not switch production restrictions off to test from an unrelated preview.

### Ready-to-run real delivery test, pending approval

**Inputs:** exact candidate commit, approved private/test origin, owner-controlled form endpoint, verified notification inbox, selected CAPTCHA/site key, completed provider validation, and owner-approved test email/phone. Use a private controlled test copy; no public deployment is authorized. A localhost success alone does not verify production-origin restrictions.

**Test data:** name `Website Launch Test`, project `Not Sure Yet`, location `80015`, timing `Just researching`, details `TEST ONLY - no estimate or appointment requested - FS-YYYYMMDD-HHMM-01`, optional space note blank and `_gotcha` blank. Use only the approved test contact address/number; never real homeowner details. Replace the unique marker for each test and record it with the result.

1. Verify baseline dashboard count and remaining quota. Send one Email-preference request with the approved email and no phone; one Text request with the approved test phone and no email; one Phone call request with the approved test phone. These create notification emails only; the website does not send an SMS or place a call.
2. For each request, require all three independent observations: the browser's acceptance screen; exactly one matching normal Inbox submission in Formspree, not Spam/Over Limit; and exactly one notification in the approved mailbox. Record UTC time, marker, candidate SHA and pass/fail. Verify every field and contact preference. Check Spam/Junk if missing; missing inbox receipt is not a delivery pass.
3. For Email, inspect the notification's Reply-To address without sending a reply. [Formspree maps the `email` field to Reply-To](https://help.formspree.io/articles/building-your-form/email-reply-to-address). Do not mistake the notification sender for the visitor. Confirm a phone-only request does not require or invent an email address.
4. With separate bounded approval for negative provider tests, bypass browser validation using only fake data: omit a required field, exceed a configured limit, supply invalid email, omit the selected contact channel, forge a choice, and test absent/invalid CAPTCHA. Each expected rejection must show no success and no delivered lead. Any unavailable server check remains a launch blocker.
5. Use mocked/local transport for 429, quota errors, 5xx, malformed responses, offline/timeout and repeated-click tests. Do not flood the real service or deliberately create duplicates. After an uncertain real result, inspect dashboard/inbox before retrying.
6. Close the private test server/copy after the authorized test. Keep the configured review candidate unreleased; do not publish it as a side effect of testing. Report results and outstanding blockers, then request explicit final merge/deploy/publish approval. A green mocked suite is never the real-delivery signoff.

**Prepared verification:** syntax checks and seven mocked adapter tests passed after the correction. They cover endpoint restrictions, JSON transport, both explicit acceptance shapes, HTTP and provider rejection, contradictory/malformed responses, network failures and timeout. No live endpoint was contacted. The combined candidate's browser/CI evidence is recorded separately and must match its exact final commit.


## Configured candidate verification (2026-11-05, UTC)

The endpoint-only production change uses the owner-supplied form. The adapter, interface, contact destinations, original assets and hidden future content are otherwise unchanged. New mocked tests load the actual config for Email, Text and Phone call, require the selected contact channel, omit an empty optional channel and verify one acceptance/payload. An additional browser test checks honeypot attributes and forwarding to fake transport; this does not prove Formspree filtering. An adapter test checks the real config and a replacement endpoint using injected fake transport only.

Local production/test syntax, eight mocked adapter tests and whitespace checks passed. Local Chromium cannot start its required socket, and WebKit is not installed; their browser scenarios did not execute locally. Fresh exact-head CI must finish before the browser suite is reported passed. See [PR #3 checks](https://github.com/townsendjat-arch/flooring-site/pull/3/checks) and [the verification ledger](../project-management/TESTING.md). Earlier 56/56 results belong to the empty-endpoint candidate, not this revision.

The live test above is prepared, not executed. To proceed, the owner must confirm the notification inbox is verified and enabled, specify approved test email/phone and origin, finish provider spam/CAPTCHA/domain/validation decisions, and authorize the small set of synthetic submissions. The owner then checks Formspree Inbox/Spam/Over Limit and the receiving mailbox/Junk, matches each unique marker and all fields, confirms exactly one provider record and notification per deliberate test, and checks Email Reply-To without sending a reply. Neither an on-screen acceptance nor passing CI verifies mailbox delivery.
