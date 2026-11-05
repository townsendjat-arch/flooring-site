const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { readFile, mkdir, writeFile } = require('node:fs/promises');
const { execFileSync } = require('node:child_process');
const { createServer } = require('node:http');
const path = require('node:path');
const AxeBuilder = require('@axe-core/playwright').default;
const engineName = process.env.BROWSER || 'chromium';
const engine = require('playwright')[engineName];
const root = path.resolve(__dirname, '..');
const artifacts = process.env.REVIEW_ARTIFACTS;
// Complete approved pre-implementation baseline, not old CSS on new HTML.
const base = 'cd212ee19fa272c8e8d9ab284b7555a1def62121';
let browser, server, origin;
before(async () => {
  server = createServer(async (req, res) => {
    const pathname = new URL(req.url, 'http://localhost').pathname;
    const file = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
    if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
    try {
      const mime = { '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg' };
      res.setHeader('Content-Type', mime[path.extname(file)] || 'text/html');
      res.end(await readFile(file));
    } catch { res.writeHead(404).end(); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  origin = `http://127.0.0.1:${server.address().port}`;
  browser = await engine.launch({ headless: true, ...(engineName === 'chromium' ? { args: ['--no-sandbox'], ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}) } : {}) });
  console.log(`Design evidence: ${engineName} ${browser.version()}; Playwright ${require('playwright/package.json').version}`);
});
after(async () => { await browser?.close(); await new Promise(resolve => server?.close(resolve)); });
async function pageFor(t, options = {}, baseline = false) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce', ...options });
  t.after(() => context.close());
  // All network traffic outside this local test server is blocked. No leads are sent.
  await context.route('**/*', route => {
    if (!route.request().url().startsWith(origin + '/')) return route.abort();
    const pathname = new URL(route.request().url()).pathname;
    const file = pathname === '/' ? 'index.html' : pathname.slice(1);
    if (baseline && ['index.html', 'styles.css', 'script.js', 'estimate-config.js', 'estimate-service.js'].includes(file)) {
      const body = execFileSync('git', ['show', `${base}:${file}`], { cwd: root, encoding: 'utf8' });
      return route.fulfill({ contentType: file.endsWith('.css') ? 'text/css' : file.endsWith('.js') ? 'text/javascript' : 'text/html', body });
    }
    return route.continue();
  });
  const page = await context.newPage(); const errors = [], posts = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => { if (request.method() === 'POST') posts.push(request.url()); });
  t.after(() => { assert.deepEqual(errors, []); assert.deepEqual(posts, []); });
  await page.goto(origin);
  // Load lazy photography before evaluating layout or taking the full-page image.
  await page.locator('img').evaluateAll(images => images.forEach(image => image.loading = 'eager'));
  await page.waitForFunction(() => [...document.images].every(image => image.complete && image.naturalWidth > 0));
  await page.locator('img').evaluateAll(images => Promise.all(images.map(image => image.decode())));
  return page;
}
async function save(page, name, fullPage = false) {
  if (!artifacts) return;
  await mkdir(artifacts, { recursive: true });
  if (fullPage) await page.locator('img').evaluateAll(async images => {
    // Paint offscreen async-decoded photos only for full-page screenshots.
    // Keep this out of page setup: scrolling images can change Chromium's
    // sequential keyboard-navigation starting point before the first Tab.
    const position = { left: scrollX, top: scrollY, behavior: 'instant' };
    for (const image of images) {
      // Do not use image.scrollIntoView(): it can scroll the overflow-hidden
      // logo crop itself. Scroll only the window, preserving the real crop.
      const rect = image.getBoundingClientRect();
      scrollTo({ top: scrollY + rect.top - innerHeight / 2, behavior: 'instant' });
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    }
    scrollTo(position);
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });
  assert.deepEqual(await page.locator('.brand-logo').evaluateAll(els => els.map(el => ({ x: el.scrollLeft, y: el.scrollTop }))), [{ x: 0, y: 0 }, { x: 0, y: 0 }], 'Screenshot preparation must not scroll or alter logo crops');
  await page.screenshot({ path: path.join(artifacts, `${name}.png`), fullPage, animations: 'disabled' });
}
async function palette(page) {
  const failures = await page.evaluate(() => {
    const failures = [];
    for (const el of document.querySelectorAll('body *')) {
      if (!el.getClientRects().length || el.tagName === 'IMG') continue;
      for (const pseudo of [null, '::before', '::after']) {
        const css = getComputedStyle(el, pseudo);
        if (pseudo && ['none', 'normal'].includes(css.content)) continue;
        for (const prop of ['color', 'backgroundColor', 'borderTopColor', 'outlineColor', 'accentColor']) {
          const values = css[prop].match(/^rgba?\(([^)]+)\)/)?.[1].split(/[, ]+/).map(Number);
          if (values && values[3] !== 0 && (values[0] !== values[1] || values[1] !== values[2])) failures.push({ element: el.id || el.className || el.tagName, pseudo, prop, color: css[prop] });
        }
      }
    }
    return failures;
  });
  assert.deepEqual(failures, [], 'Every rendered non-image UI color is neutral');
}
async function contrast(page, selector, property, background) {
  return page.locator(selector).first().evaluate((el, { property, background }) => {
    const rgb = color => color.match(/[\d.]+/g).slice(0, 3).map(Number);
    const light = color => rgb(color).map(v => { v /= 255; return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }).reduce((sum, v, i) => sum + v * [.2126, .7152, .0722][i], 0);
    const css = getComputedStyle(el); const a = light(css[property]), b = light(background || css.backgroundColor);
    return (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
  }, { property, background });
}
for (const config of [
  { name: 'desktop', viewport: { width: 1440, height: 1000 } },
  { name: 'laptop', viewport: { width: 1280, height: 900 } },
  { name: 'mobile', viewport: { width: 375, height: 812 }, hasTouch: true },
  { name: 'narrow', viewport: { width: 320, height: 640 } },
  { name: 'landscape-home', viewport: { width: 812, height: 375 }, hasTouch: true },
]) {
  test(`${config.name}: neutral homepage, original photography, approved layout and accessibility`, async t => {
    const { name, ...options } = config;
    const page = await pageFor(t, options);
    await palette(page);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true, 'Homepage fits viewport');
    assert.deepEqual(await page.locator('.brand-logo img').evaluateAll(els => els.map(el => getComputedStyle(el).filter)), ['none', 'none'], 'Both logo instances retain the original full colors');
    for (const filter of await page.locator('.hero-image-wrap img,.story-image img').evaluateAll(els => els.map(el => getComputedStyle(el).filter))) assert.equal(filter, 'none');
    await save(page, `${name}-after-hero`);
    await save(page, `${name}-after-full`, true);
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
    const summary = { viewport: options.viewport, engine: engineName, violations: results.violations.map(r => ({ id: r.id, nodes: r.nodes.map(n => ({ target: n.target, summary: n.failureSummary })) })), incomplete: results.incomplete.map(r => ({ id: r.id, nodes: r.nodes.map(n => ({ target: n.target, summary: n.failureSummary })) })) };
    if (artifacts) await writeFile(path.join(artifacts, `${name}-homepage-axe.json`), JSON.stringify(summary, null, 2));
    assert.deepEqual(summary.violations, []);
    // Full HTML/CSS/JS from the actual earlier commit provides honest before evidence.
    const beforePage = await pageFor(t, options, true);
    const photoSources = target => target.locator('.hero-image-wrap img,.story-image img,.brand-logo img').evaluateAll(els => els.map(el => ({ src: el.getAttribute('src'), width: el.getAttribute('width'), height: el.getAttribute('height'), alt: el.getAttribute('alt') })));
    assert.deepEqual(await photoSources(page), await photoSources(beforePage), 'Original photograph/logo files, dimensions and descriptions are unchanged');
    const featuredCopy = target => target.locator('#work .story-copy').allTextContents();
    assert.deepEqual(await featuredCopy(page), await featuredCopy(beforePage), 'Featured before/framing/finished story remains intact');
    if (options.viewport.width <= 620) {
      const top = target => target.locator('.hero-image-wrap').evaluate(el => el.getBoundingClientRect().top);
      assert.ok(await top(page) + 250 < await top(beforePage), 'Finished workmanship appears substantially sooner');
      assert.ok(await top(page) < options.viewport.height, 'Workmanship is visible in the initial phone viewport');
      const ratio = await page.locator('.hero-image-wrap img').evaluate(el => el.getBoundingClientRect().height / el.getBoundingClientRect().width);
      assert.ok(Math.abs(ratio - 1595 / 1290) < .01, 'Phone hero shows original natural proportions without cropping');
    }
    await save(beforePage, `${name}-before-hero`);
    await save(beforePage, `${name}-before-full`, true);
  });
}
test('homepage keyboard focus, hover, active, disabled and selected states stay readable', async t => {
  const page = await pageFor(t);
  await page.keyboard.press('Tab');
  assert.equal(await page.locator('.site-header .brand').evaluate(el => el === document.activeElement), true);
  // Activate every visible in-page navigation link with the keyboard.
  for (const link of await page.locator('nav a').all()) {
    const target = await link.getAttribute('href');
    assert.equal(await page.locator(target).count(), 1);
    await link.focus(); await page.keyboard.press('Enter');
    assert.equal(new URL(page.url()).hash, target);
    assert.equal(await page.locator(target).isVisible(), true);
  }
  await page.locator('.site-header .brand').focus(); await page.keyboard.press('Enter');
  assert.equal(new URL(page.url()).hash, '#top');
  for (const selector of ['.site-header .brand','nav a','.phone-link','.hero-actions .primary','.hero-actions .secondary','.project-card','.craftsmanship .secondary','.footer-contact a']) {
    const element = page.locator(selector).first();
    await element.focus();
    const focus = await element.evaluate(el => { const s = getComputedStyle(el); return { width: parseFloat(s.outlineWidth), style: s.outlineStyle }; });
    assert.ok(focus.width >= 3 && focus.style === 'solid', selector);
    await palette(page);
    await element.hover(); await palette(page);
  }
  await page.locator('.hero-actions .primary').hover();
  assert.ok(await contrast(page, '.hero-actions .primary', 'color') >= 4.5);
  await save(page, 'desktop-primary-hover');
  await page.mouse.down(); await palette(page); await save(page, 'desktop-primary-active'); await page.mouse.up();
  await page.locator('.footer-contact a').first().hover();
  assert.ok(await contrast(page, '.footer-contact a', 'color', 'rgb(0, 0, 0)') >= 4.5);
  await page.locator('[data-open-estimate]').first().click();
  await palette(page);
  await page.locator('[name=projectType]').first().check();
  assert.equal(await page.locator('.choice-card').first().evaluate(el => getComputedStyle(el).backgroundColor), 'rgb(245, 245, 245)');
  assert.ok(await contrast(page, '.choice-card', 'borderTopColor', 'rgb(255, 255, 255)') >= 3);
  await save(page, 'desktop-selected-focus');
  await page.locator('#nextBtn').evaluate(el => el.disabled = true);
  await palette(page);
  assert.ok(await contrast(page, '#nextBtn', 'color') >= 4.5);
  await save(page, 'desktop-disabled');
});
test('neutral error and unavailable states retain text, ARIA and visible boundaries', async t => {
  const page = await pageFor(t, { viewport: { width: 375, height: 812 } });
  await page.locator('[data-open-estimate]').first().click(); await palette(page);
  assert.ok(await contrast(page, '#formAvailability', 'color') >= 4.5);
  await page.locator('#nextBtn').click();
  assert.equal(await page.locator('[name=projectType][aria-invalid=true]').count(), 8);
  assert.equal(await page.locator('#fieldError-projectType').isVisible(), true);
  await palette(page); await save(page, 'mobile-error-focus');
  assert.ok(await contrast(page, '#fieldError-projectType', 'color', 'rgb(255, 255, 255)') >= 4.5);
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('[data-open-estimate]').first().evaluate(el => el === document.activeElement), true);
});


test('future gallery and testimonials remain hidden, empty and absent from navigation', async t => {
  const page = await pageFor(t);
  for (const selector of ['#project-gallery', '#reviews']) {
    assert.equal(await page.locator(selector).getAttribute('hidden'), '');
    assert.equal(await page.locator(selector).isVisible(), false);
    assert.equal(await page.locator(`a[href="${selector}"]`).count(), 0);
  }
  assert.equal(await page.locator('#project-gallery .gallery-grid').locator(':scope > *').count(), 0);
  assert.equal(await page.locator('#reviews .testimonial-grid').locator(':scope > *').count(), 0);
  assert.equal(await page.getByRole('heading', { name: 'Project details, up close.' }).count(), 0);
  assert.equal(await page.getByRole('heading', { name: "In our customers' words." }).count(), 0);
  const template = await page.locator('#projectPhotoCard').evaluate(el => ({ images: el.content.querySelectorAll('img').length, src: el.content.querySelector('img').getAttribute('src'), caption: !!el.content.querySelector('figcaption') }));
  assert.deepEqual(template, { images: 1, src: null, caption: true });
  assert.equal(await page.locator('#testimonialCard').evaluate(el => el.content.querySelector('blockquote p').textContent), '');
  assert.equal(await page.locator('#work').isVisible(), true);
  assert.equal(await page.locator('#work .story-card').count(), 3);
  assert.doesNotMatch(await page.locator('body').innerText(), /coming soon|site is finalized|Add (?:assets|shower)|Real customer feedback will/i);
});

for (const width of [320, 375, 812]) {
  test(`${width}px: visible narrow navigation supports keyboard, touch targets and anchored headings`, async t => {
    const page = await pageFor(t, { viewport: { width, height: width === 812 ? 375 : 812 }, hasTouch: true });
    for (const link of await page.locator('nav a').all()) {
      assert.equal(await link.isVisible(), true);
      const bounds = await link.boundingBox();
      assert.ok(bounds.height >= 44 && bounds.width >= 44);
      assert.ok(bounds.x >= -1 && bounds.x + bounds.width <= width + 1);
      await link.focus(); await page.keyboard.press('Enter');
      const target = await link.getAttribute('href');
      assert.equal(new URL(page.url()).hash, target);
      const top = await page.locator(target).evaluate(el => el.getBoundingClientRect().top);
      const headerBottom = await page.locator('.site-header').evaluate(el => el.getBoundingClientRect().bottom);
      assert.ok(top >= headerBottom - 1, 'Anchor content is not hidden by the header');
    }
    await page.locator('nav a').first().tap();
    assert.equal(new URL(page.url()).hash, '#work');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true);
  });
}

test('enlarged phone text keeps navigation reachable without horizontal scrolling', async t => {
  const page = await pageFor(t, { viewport: { width: 320, height: 640 } });
  await page.addStyleTag({ content: 'html{font-size:200%}' });
  await save(page, 'narrow-navigation-enlarged-text');
  const overflow = await page.evaluate(() => [...document.querySelectorAll('body *')].filter(el => {
    const box = el.getBoundingClientRect(); return box.width && (box.left < -1 || box.right > innerWidth + 1);
  }).map(el => ({ tag: el.tagName, class: el.className, width: el.getBoundingClientRect().width, text: el.textContent.slice(0,70) })));
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true, JSON.stringify(overflow));
  for (const link of await page.locator('nav a').all()) {
    assert.equal(await link.isVisible(), true);
    await link.focus();
    assert.equal(await link.evaluate(el => el === document.activeElement), true);
  }
  await save(page, 'narrow-navigation-enlarged-text');
});

test('future cards support approved image and quote content with accessible reflow', async t => {
  const page = await pageFor(t, { viewport: { width: 320, height: 640 } });
  // Test-only population uses the existing project photo and explicitly synthetic text.
  await page.evaluate(() => {
    const card = document.querySelector('#projectPhotoCard').content.cloneNode(true);
    const img = card.querySelector('img');
    img.src = 'assets/shower-finished.jpg'; img.width = 1290; img.height = 1595;
    img.alt = 'Test fixture: finished gray tiled shower with niche and mosaic floor';
    card.querySelector('h3').textContent = 'Test fixture project';
    card.querySelector('figcaption p').textContent = 'Test-only caption, never published as a new project.';
    document.querySelector('.gallery-grid').append(card);
    document.querySelector('#project-gallery').hidden = false;
    const quote = document.querySelector('#testimonialCard').content.cloneNode(true);
    quote.querySelector('blockquote p').textContent = 'Synthetic quote for layout testing only.';
    quote.querySelector('figcaption').textContent = 'Fictional test attribution';
    document.querySelector('.testimonial-grid').append(quote);
    document.querySelector('#reviews').hidden = false;
  });
  await page.locator('#project-gallery img').scrollIntoViewIfNeeded();
  await page.locator('#project-gallery img').evaluate(img => img.decode());
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true);
  assert.equal(await page.getByRole('img', { name: /Test fixture: finished/ }).count(), 1);
  await palette(page);
  const result = await new AxeBuilder({ page }).include('#project-gallery').include('#reviews').withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  assert.deepEqual(result.violations, []);
});

test('photo failure shows useful text without developer filenames; no upload or territory promise', async t => {
  const page = await pageFor(t, { viewport: { width: 320, height: 640 } });
  await page.route('**/assets/shower-*.jpg', route => route.abort());
  await page.reload();
  await page.locator('img').evaluateAll(imgs => imgs.forEach(img => img.loading = 'eager'));
  await page.waitForFunction(() => document.querySelectorAll('.missing-image').length === 4);
  assert.equal(await page.locator('.image-fallback:visible').count(), 4);
  assert.ok((await page.locator('.hero-image-wrap').boundingBox()).height > 300, 'Failed phone hero retains a useful fallback box');
  const text = await page.locator('body').innerText();
  assert.doesNotMatch(text, /Add assets|Add shower|coming soon|throughout the area|Proudly serving Colorado|Send a few details and photos/);
  assert.match(text, /photo could not load/);
  assert.equal(await page.locator('input[type=file]').count(), 0);
  assert.match(await page.locator('[data-step="2"] .field-help').textContent(), /not collected by this form/);
  assert.match(await page.locator('.service-area').innerText(), /check service availability/);
  assert.doesNotMatch(await page.locator('meta[name=description]').getAttribute('content'), /Denver metro/);
});
