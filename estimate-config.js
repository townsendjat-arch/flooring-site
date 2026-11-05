// Public configuration only. The owner supplied this form for the review candidate.
// Replace only endpoint when moving to Charles's form; no build is required.
// An empty endpoint disables online requests. Delivery and release still require
// the checks and approval in docs/estimate-form.md.
// Never put API keys, email credentials, or payment details in this file.
export const estimateConfig = Object.freeze({
  endpoint: "https://formspree.io/f/mdeejyvl",
  timeoutMs: 15000,
});
