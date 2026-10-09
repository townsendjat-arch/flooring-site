# Estimate form: review and launch checklist

Status: proposed code only. The Formspree endpoint is deliberately empty, so nothing is transmitted and no success screen is shown on Send. Do not merge or deploy without the owner's approval. This change does not create a provider account, configure an inbox, buy a plan, or change hosting.

## Scope and architecture

The existing static site, imagery, contact links, and branding are preserved. The four-step estimate dialog now validates every supplied field, requires the chosen contact channel, handles keyboard submission and closing, and waits for explicit provider acceptance before confirmation. The browser adapter is in `estimate-service.js`; public configuration is in `estimate-config.js`. No server code is included. Client validation can be bypassed and is not a security boundary.

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

Use Node.js 22+ and install the pinned development dependency with `npm install`. Then run `npm run check` and `npm test`. Browser tests use Playwright; install its Chromium with `npx playwright install chromium`, or use an existing compatible Chromium via `CHROMIUM_PATH=/path/to/chromium npm test`. There is no production build step or runtime package dependency. For manual local review, serve the repository over HTTP, for example `python3 -m http.server 8000`, then open localhost. ES modules are not intended to run from a `file://` URL.

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

Passed: JavaScript syntax checks for all three modules; four mocked adapter unit tests (configuration restrictions, success contract, rejection/ambiguous responses, network/timeout); `git diff --check`; independent code review with identified reopen/5xx/live-status issues fixed.

Not executed successfully: eleven browser scenarios are included, but Chromium cannot start in this execution sandbox (`socket() failed: Operation not permitted`), including the permitted retry. The supported cloud browser could not reach the isolated localhost server. These are infrastructure failures, not browser-test passes. No visual, screen-reader, Safari/iOS, Android, provider-account, recipient-mailbox, or real-submission verification was completed. Rerun the browser suite in a suitable local/CI environment before approval to launch. No deployment workflow has been added.
