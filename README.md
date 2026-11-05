# Flooring Site Prototype

A lightweight static prototype for a local flooring/tile contractor.

## MVP goal

Move a homeowner from **"I need help with a project"** to a **qualified estimate conversation** without making the site feel like a generic lead-generation funnel.

## Homepage structure

1. Hero with clear service positioning
2. Three ways to contact: call, text, or start an estimate request
3. Project-type cards
4. Real-work gallery placeholders
5. Trust and craftsmanship section
6. Simple 4-step process
7. Final estimate CTA

## Lead journey

**Project type → project details → optional photo note → ZIP/city → preferred timing → contact details → confirmation**

This prototype uses only HTML, CSS, and JavaScript. No backend, analytics, or production form handling yet.

## Next steps

- Replace placeholder copy with the contractor's real business information
- Add real project photography and testimonials
- Connect the estimate flow to an email/CRM/form service
- Deploy
- Add Google Analytics and Google Search Console


## Proposed estimate-form integration

The estimate flow includes an unconfigured, fail-closed Formspree adapter. No live submission destination is set. See [setup and prelaunch checklist](docs/estimate-form.md) for owner decisions, external server/spam controls, local checks, and authorization gates. Do not merge or deploy this proposal without approval.


## Future project and testimonial content

The featured shower remains visible. Future gallery and testimonial sections are prepared but hidden until genuine content is approved. Follow [the content guide](docs/content-guide.md) to add photographs, captions, descriptive alt text and customer quotations. Do not expose blank cards or invent reviews. The focused mobile/content implementation is tracked in [TASKS](project-management/TASKS.md) and [TESTING](project-management/TESTING.md).
