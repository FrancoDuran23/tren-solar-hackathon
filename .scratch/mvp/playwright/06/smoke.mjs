// Uso: node smoke.mjs <closed|open> <baseUrl>   (open requiere config.submissions='open'; ENTREGA_WEBHOOK_URL sin definir ⇒ 501)
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const dir = path.dirname(fileURLToPath(import.meta.url));
const [mode, base = 'http://localhost:4321'] = process.argv.slice(2);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) process.exitCode = 1; };
await p.goto(base + '/#entrega');
const sec = p.locator('#entrega');
if (mode === 'closed') {
  ok(await p.locator('#entrega fieldset').evaluate((e) => e.disabled) && await p.locator('#f-proyecto').isDisabled(), 'fieldset deshabilitado');
  const r = await p.request.post(base + '/api/entrega', { data: {} });
  ok(r.status() === 403, 'API 403 con entregas cerradas (got ' + r.status() + ')');
  await sec.screenshot({ path: dir + '/closed.png' });
} else {
  await p.fill('#f-proyecto', 'ab'); await p.locator('#f-proyecto').blur();
  ok((await p.textContent('#e-proyecto')).includes('3 y 60'), 'error inline proyecto');
  await p.fill('#f-email', 'x'); await p.locator('#f-email').blur();
  ok((await p.textContent('#e-email')).length > 0, 'error inline email');
  await p.click('#submit');
  ok((await p.textContent('#e-jujuy')).includes('30 tickets'), 'checkbox Jujuy obligatorio');
  await sec.screenshot({ path: dir + '/errors.png' });
  await p.fill('#f-proyecto', 'Tren Solar'); await p.fill('#f-responsable', 'Ana Perez');
  await p.fill('#f-email', 'ana@example.com'); await p.check('#f-jujuy'); await p.fill('#f-localidad', 'San Salvador');
  await p.fill('#f-repo', 'https://example.com/x'); await p.locator('#f-repo').blur();
  ok((await p.textContent('#e-repo')).length > 0, 'repo host inválido rechazado');
  await p.fill('#f-repo', 'https://github.com/a/b'); await p.fill('#f-demo', 'https://demo.app');
  await p.fill('#f-video', 'https://youtu.be/abc');
  await p.selectOption('#f-tractionTipo', 'users'); await p.locator('#f-tractionEvidencia').focus(); await p.locator('#f-tractionEvidencia').blur();
  ok((await p.textContent('#e-tractionEvidencia')).length > 0, 'evidencia requerida si hay tipo');
  await p.fill('#f-tractionEvidencia', 'https://x.com/p');
  ok((await p.textContent('#s-proyecto')) === 'Tren Solar', 'stub en vivo');
  await p.click('#submit');
  if (!process.env.EXPECT_SUCCESS) {
    await p.waitForSelector('#toast:not([hidden])');
    ok(await p.inputValue('#f-proyecto') === 'Tren Solar', '501 ⇒ toast y datos conservados');
    await sec.screenshot({ path: dir + '/server-error.png' });
  }
  const r = await p.request.post(base + '/api/entrega', { data: { website: 'bot' } });
  ok(r.status() === 200, 'honeypot responde 200 sin reenviar');
  if (process.env.EXPECT_SUCCESS) {
    await p.waitForSelector('#receipt:not([hidden])');
    ok(/^JDV-2026-\d{4}$/.test(await p.textContent('#r-id')), 'comprobante Hacker ID');
    await sec.screenshot({ path: dir + '/success.png' });
  }
}
await b.close();
