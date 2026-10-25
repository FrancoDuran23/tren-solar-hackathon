// Uso: node smoke.mjs <baseUrl> [closed|open]   (open requiere config.submissions='open'; sin ENTREGA_WEBHOOK_URL ⇒ 501)
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const dir = path.dirname(fileURLToPath(import.meta.url));
const [base = 'http://localhost:4321', mode = 'closed'] = process.argv.slice(2);
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) process.exitCode = 1; };
const b = await chromium.launch();
const sizes = { desktop: { width: 1440, height: 900 }, mobile: { width: 360, height: 780 } };
for (const [name, viewport] of Object.entries(sizes)) {
  const ctx = await b.newContext({ viewport, hasTouch: name === 'mobile' });
  const p = await ctx.newPage();
  const errors = [];
  p.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  p.on('pageerror', (e) => errors.push(String(e)));
  await p.goto(base + '/');
  await p.waitForLoadState('networkidle');
  ok(await p.locator('body > main h1, body > header h1, main h1').count() === 1, `${name}: un solo h1`);
  ok(await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), `${name}: sin scroll horizontal`);
  // scroll completo
  const h = await p.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < h; y += viewport.height * 0.8) { await p.evaluate((v) => window.scrollTo(0, v), y); await p.waitForTimeout(60); }
  await p.evaluate(() => window.scrollTo(0, 0));
  await p.screenshot({ path: `${dir}/${name}-full.png`, fullPage: true });
  // anclas
  for (const id of ['que-es', 'como', 'criterios', 'workshops', 'jurado', 'faq', 'entrega']) {
    const exists = await p.locator('#' + id).count();
    if (!exists) { ok(false, `${name}: sección #${id} existe`); continue; }
    await p.evaluate((i) => document.getElementById(i).scrollIntoView(), id);
    await p.waitForTimeout(900);
    const top = await p.locator('#' + id).evaluate((e) => e.getBoundingClientRect().top);
    ok(top < 200 && top > -10, `${name}: ancla #${id} (top=${Math.round(top)})`);
  }
  // CTA pronto: sin link roto
  await p.goto(base + '/');
  const cta = await p.locator('.cta--soon').count();
  ok(cta > 0, `${name}: CTA "pronto" presente (${cta})`);
  ok(await p.locator('a.cta:not(.cta--soon)[href^="http"]').count() === 0, `${name}: sin CTA con link externo (lumaUrl null)`);
  // form
  const sec = p.locator('#entrega');
  await sec.scrollIntoViewIfNeeded();
  if (mode === 'closed') {
    ok(await p.locator('#entrega fieldset').evaluate((e) => e.disabled), `${name}: form cerrado (fieldset disabled)`);
    await sec.screenshot({ path: `${dir}/${name}-form-closed.png` });
  } else {
    await p.fill('#f-proyecto', 'ab'); await p.locator('#f-proyecto').blur();
    ok((await p.textContent('#e-proyecto')).length > 0, `${name}: error inline`);
    await p.click('#submit');
    ok((await p.textContent('#e-jujuy')).length > 0, `${name}: checkbox Jujuy obligatorio`);
    await sec.screenshot({ path: `${dir}/${name}-form-errors.png` });
    await p.fill('#f-proyecto', 'Tren Solar'); await p.fill('#f-responsable', 'Ana Perez');
    await p.fill('#f-email', 'ana@example.com'); await p.check('#f-jujuy'); await p.fill('#f-localidad', 'San Salvador');
    await p.fill('#f-repo', 'https://github.com/a/b'); await p.fill('#f-demo', 'https://demo.app'); await p.fill('#f-video', 'https://youtu.be/abc');
    await p.click('#submit');
    await p.waitForSelector('#toast:not([hidden])');
    ok(true, `${name}: envío ⇒ estado error de servidor (501 sin webhook)`);
    await sec.screenshot({ path: `${dir}/${name}-form-server-error.png` });
  }
  ok(errors.filter((e) => !/501/.test(e)).length === 0, `${name}: sin errores de consola ${errors.join(' | ')}`);
  await ctx.close();
}
await b.close();
