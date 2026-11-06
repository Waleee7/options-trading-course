/* Browser tests: every page at three screen sizes, full quizzes, and the ways people really break things.
   Needs a build. `npm run build && npm run test:e2e` starts its own server.
   BASE=https://site.example npm run test:e2e runs it against a deployed site. */
const pw = require('playwright');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const PORT = process.env.PORT || 7319;
const BASE = process.env.BASE || `http://127.0.0.1:${PORT}`;
const OUT = path.join(__dirname, 'shots');
fs.mkdirSync(OUT, { recursive: true });
const axe = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const KEY = 'options-lab:v2:progress';
const BAD_TEXT = /\bNaN\b|\bundefined\b|\bInfinity\b|\[object Object\]/;

let pass = 0, fail = 0, engine = 'chromium';
const check = (name, ok, extra = '') => {
  ok ? pass++ : fail++;
  if (!ok) console.log(`FAIL [${engine}] ${name}${extra ? ' · ' + String(extra).slice(0, 300) : ''}`);
};
const note = (s) => console.log(`NOTE ${s}`);

const VIEWS = {
  phone: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
  small: { viewport: { width: 320, height: 568 }, isMobile: true, hasTouch: true },
  desktop: { viewport: { width: 1440, height: 900 } },
};

function watch(page) {
  const errs = [];
  // Safari reports a background page fetch cancelled by leaving the page as an error. Nothing is wrong.
  page.on('pageerror', (e) => { if (!(engine === 'webkit' && /_rsc=.*access control checks/.test(e.message))) errs.push('pageerror: ' + e.message); });
  page.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource.*404/.test(m.text())) errs.push('console: ' + m.text()); });
  return errs;
}

async function open(browser, ctxOpts = {}, init) {
  const ctx = await browser.newContext(ctxOpts);
  if (init) await ctx.addInitScript(init.fn, init.arg);
  const page = await ctx.newPage();
  const errs = watch(page);
  return { ctx, page, errs };
}

async function crawl(browser) {
  const { ctx, page } = await open(browser, VIEWS.desktop);
  const seen = new Set(['/']);
  const queue = ['/'];
  const dead = [];
  while (queue.length) {
    const p = queue.shift();
    const r = await page.goto(BASE + p, { waitUntil: 'domcontentloaded' });
    if (!r || r.status() !== 200) { dead.push(`${p} -> ${r && r.status()}`); continue; }
    const links = await page.$$eval('a[href]', (as) => as.map((a) => a.getAttribute('href')));
    for (const l of links) {
      if (!l.startsWith('/')) continue;
      const clean = l.split('#')[0].split('?')[0] || '/';
      if (!seen.has(clean)) { seen.add(clean); queue.push(clean); }
    }
  }
  check('every internal link resolves', dead.length === 0, dead.join(', '));
  await ctx.close();
  return [...seen].sort();
}

async function sweep(browser, routes, label, views) {
  for (const [name, opts] of Object.entries(views)) {
    const { ctx, page, errs } = await open(browser, opts);
    for (const r of routes) {
      errs.length = 0;
      const resp = await page.goto(BASE + r, { waitUntil: 'load' });
      await page.waitForTimeout(120);
      const m = await page.evaluate(() => {
        const vw = document.documentElement.clientWidth;
        const wide = [...document.querySelectorAll('body *')].filter((e) => {
          const b = e.getBoundingClientRect();
          if (!b.width || b.right <= vw + 1) return false;
          for (let a = e.parentElement; a; a = a.parentElement) {
            const o = getComputedStyle(a).overflowX;
            if (o === 'auto' || o === 'scroll' || o === 'hidden' || o === 'clip') return false;
          }
          return true;
        }).slice(0, 3).map((e) => e.tagName + '.' + String(e.className.baseVal ?? e.className).slice(0, 40));
        const broken = [...document.images].filter((i) => i.complete && !i.naturalWidth).map((i) => i.src);
        return { over: document.documentElement.scrollWidth - vw, wide, h1: document.querySelectorAll('h1').length, title: document.title, text: document.body.innerText, broken, lang: document.documentElement.lang };
      });
      const tag = `${label}/${name} ${r}`;
      check(`${tag} loads`, resp.status() === 200, resp.status());
      check(`${tag} no sideways scroll`, m.over <= 1, `${m.over}px ${m.wide.join(' ')}`);
      check(`${tag} one h1`, m.h1 === 1, m.h1);
      check(`${tag} has title`, !!m.title);
      check(`${tag} no broken images`, m.broken.length === 0, m.broken.join(' '));
      check(`${tag} no junk text`, !BAD_TEXT.test(m.text), (m.text.match(BAD_TEXT) || [])[0]);
      check(`${tag} no console errors`, errs.length === 0, errs.join(' | '));
    }
    await ctx.close();
  }
}

async function answerQuiz(page, pick = () => 0) {
  let n = 0;
  for (;;) {
    const opts = page.locator('[role=radiogroup] button');
    await opts.first().waitFor({ timeout: 4000 });
    await opts.nth(pick(n)).click();
    const adv = page.getByRole('button', { name: /Next question|Finish/ });
    const label = await adv.textContent();
    await adv.click();
    n++;
    if (/Finish/.test(label)) break;
  }
  return n;
}

const setRange = (loc, v) => loc.evaluate((e, x) => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(e, x); e.dispatchEvent(new Event('input', { bubbles: true })); }, String(v));
const readSave = (page) => page.evaluate((k) => JSON.parse(localStorage.getItem(k) || 'null'), KEY);

async function flows(browser, routes) {
  const quizzes = routes.filter((r) => r.startsWith('/quiz/'));
  check('16 quizzes found', quizzes.length === 16, quizzes.length);

  // A: first quiz through to saved result, reload, retake must not farm XP
  {
    const { ctx, page, errs } = await open(browser, VIEWS.phone);
    await page.goto(BASE + quizzes[0]);
    const n = await answerQuiz(page);
    check('quiz shows a result', await page.getByText('Result', { exact: true }).isVisible());
    const s1 = await readSave(page);
    check('quiz result saved', !!s1 && s1.completedModules.length === 1, JSON.stringify(s1));
    await page.reload();
    check('save survives reload', JSON.stringify(s1) === JSON.stringify(await readSave(page)));
    // the first try showed every right answer, so now score full marks
    await answerQuiz(page);
    const key = await page.locator('li p', { hasText: /^Answer: / }).allInnerTexts();
    await page.getByRole('button', { name: 'Retake quiz' }).click();
    const byAnswer = async () => {
      for (const line of key) {
        await page.getByRole('radio', { name: line.replace(/^Answer: /, '') }).first().click();
        await page.getByRole('button', { name: /Next question|Finish/ }).click();
      }
    };
    await byAnswer();
    const s2 = await readSave(page);
    check('a perfect score earns XP', s2.totalXp > s1.totalXp && s2.quizScores[s2.completedModules[0]] === 100, JSON.stringify(s2));
    await page.getByRole('button', { name: 'Retake quiz' }).click();
    await byAnswer();
    const s3 = await readSave(page);
    check('retaking a perfect quiz gives no extra XP', s3.totalXp === s2.totalXp, `${s2.totalXp} -> ${s3.totalXp}`);
    check('quiz flow no errors', errs.length === 0, errs.join(' | '));
    note(`quiz length ${n}`);
    await ctx.close();
  }

  // B: every quiz, then the finish page, then reset
  {
    const { ctx, page, errs } = await open(browser, VIEWS.desktop);
    for (const q of quizzes) {
      await page.goto(BASE + q);
      await answerQuiz(page);
      const t = await page.locator('body').innerText();
      check(`${q} finishes clean`, !BAD_TEXT.test(t), (t.match(BAD_TEXT) || [])[0]);
    }
    const s = await readSave(page);
    check('all 16 modules recorded', s.completedModules.length === 16, s.completedModules.length);
    await page.goto(BASE + '/complete');
    await page.waitForTimeout(200);
    await page.screenshot({ path: path.join(OUT, 'complete-desktop.png'), fullPage: true });
    const reset = page.getByRole('button', { name: /^Reset/ }).first();
    check('complete page offers reset', await reset.isVisible());
    await reset.click();
    await page.locator('button.btn:not(.btn-ghost)').first().click();
    await page.waitForTimeout(150);
    const after = await readSave(page);
    check('reset clears progress', !after || after.completedModules.length === 0, JSON.stringify(after));
    check('full course no errors', errs.length === 0, errs.join(' | '));
    await ctx.close();
  }

  // C: keyboard only quiz
  {
    const { ctx, page, errs } = await open(browser, VIEWS.desktop);
    await page.goto(BASE + quizzes[1]);
    const first = page.locator('[role=radiogroup] button').first();
    let reached = false;
    for (let i = 0; i < 60 && !reached; i++) {
      // Safari's Tab skips buttons unless Option is held, or the user changes a setting
      await page.keyboard.press(engine === 'webkit' ? 'Alt+Tab' : 'Tab');
      reached = await first.evaluate((e) => e === document.activeElement);
    }
    check('keyboard can reach quiz answers', reached);
    if (reached) {
      await page.keyboard.press('Enter');
      await page.waitForTimeout(80);
      const focusName = await page.evaluate(() => document.activeElement?.textContent ?? '');
      check('after answering, focus lands on Next', /Next question|Finish/.test(focusName), `focus on "${focusName.slice(0, 40)}"`);
      await page.keyboard.press('Enter');
      await page.waitForTimeout(80);
      const focusHead = await page.evaluate(() => document.activeElement?.tagName);
      check('next question moves focus to heading', focusHead === 'H2', focusHead);
    }
    check('keyboard quiz no errors', errs.length === 0, errs.join(' | '));
    await ctx.close();
  }

  // D: challenge, every scenario
  {
    const { ctx, page, errs } = await open(browser, VIEWS.phone);
    await page.goto(BASE + '/challenge');
    let n = 0;
    for (; n < 40; n++) {
      const opts = page.locator('[role=radiogroup][aria-label="Your prediction"] button');
      if (!(await opts.first().isVisible().catch(() => false))) break;
      await opts.first().click();
      const adv = page.getByRole('button', { name: /Next scenario|Finish/ });
      await adv.click();
      await page.waitForTimeout(40);
    }
    const t = await page.locator('body').innerText();
    check('challenge reaches an end', n > 0 && n < 40, n);
    check('challenge end clean', !BAD_TEXT.test(t), (t.match(BAD_TEXT) || [])[0]);
    check('challenge no errors', errs.length === 0, errs.join(' | '));
    await page.screenshot({ path: path.join(OUT, 'challenge-end-phone.png'), fullPage: true });
    note(`challenge scenarios ${n}`);
    await ctx.close();
  }

  // E: lab, every strategy at the extreme of every slider
  for (const [v, opts] of [['phone', VIEWS.phone], ['small', VIEWS.small], ['desktop', VIEWS.desktop]]) {
    const { ctx, page, errs } = await open(browser, opts);
    await page.goto(BASE + '/lab');
    const strategies = page.locator('nav[aria-label="Strategies"] button');
    const count = await strategies.count();
    check(`lab/${v} lists strategies`, count > 0, count);
    for (let i = 0; i < count; i++) {
      await strategies.nth(i).click();
      const name = await strategies.nth(i).textContent();
      const sliders = page.locator('input.slider');
      const sc = await sliders.count();
      for (let s = 0; s < sc; s++) {
        for (const end of ['min', 'max']) {
          const val = await sliders.nth(s).getAttribute(end);
          await setRange(sliders.nth(s), val);
          const t = await page.locator('figure').first().innerText();
          if (BAD_TEXT.test(t)) check(`lab/${v} ${name} slider ${s} ${end}`, false, (t.match(BAD_TEXT) || [])[0]);
        }
      }
      // all at their worst together: zero days, lowest vol, lowest price
      await setRange(sliders.nth(0), await sliders.nth(0).getAttribute('min'));
      await setRange(sliders.nth(1), '0');
      await setRange(sliders.nth(2), await sliders.nth(2).getAttribute('min'));
      const t = await page.locator('figure').first().innerText();
      check(`lab/${v} ${name} worst case clean`, !BAD_TEXT.test(t), (t.match(BAD_TEXT) || [])[0]);
      const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      check(`lab/${v} ${name} no sideways scroll`, over <= 1, over);
      await page.getByRole('button', { name: 'Reset' }).first().click();
    }
    const handle = page.locator('g[role=slider]').first();
    await handle.focus();
    const before = await handle.getAttribute('aria-valuenow');
    await page.keyboard.press('ArrowRight');
    check(`lab/${v} chart handle moves by keyboard`, before !== (await handle.getAttribute('aria-valuenow')));
    if (opts.hasTouch) {
      const box = await page.locator('figure svg').first().boundingBox();
      await page.touchscreen.tap(box.x + box.width * 0.7, box.y + box.height * 0.5);
    }
    await page.screenshot({ path: path.join(OUT, `lab-${v}.png`), fullPage: true });
    check(`lab/${v} no errors`, errs.length === 0, errs.join(' | '));
    await ctx.close();
  }

  // F: sizing calculator with bad numbers
  {
    const { ctx, page, errs } = await open(browser, VIEWS.phone);
    let host = null;
    for (const r of routes.filter((x) => x.startsWith('/course/'))) {
      await page.goto(BASE + r);
      if (await page.getByText('How many contracts fit your plan?').count()) { host = r; break; }
    }
    check('sizing calculator found', !!host);
    if (host) {
      const panel = page.locator('section', { hasText: 'How many contracts fit your plan?' }).first();
      const inputs = panel.locator('input');
      for (const [a, b, c] of [['', '', ''], ['0', '0', '0'], ['-5', '-5', '-5'], ['1e308', '100', '0.0001'], ['99999999999999', '1', '1'], ['0.01', '0.01', '99999'], ['abc', 'abc', 'abc']]) {
        await inputs.nth(0).evaluate((e, v) => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(e, v); e.dispatchEvent(new Event('input', { bubbles: true })); }, a);
        await inputs.nth(1).evaluate((e, v) => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(e, v); e.dispatchEvent(new Event('input', { bubbles: true })); }, b);
        await inputs.nth(2).evaluate((e, v) => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(e, v); e.dispatchEvent(new Event('input', { bubbles: true })); }, c);
        await page.waitForTimeout(40);
        const t = await panel.locator('dl').innerText();
        check(`sizing inputs [${a}|${b}|${c}] clean`, !BAD_TEXT.test(t), t.replace(/\s+/g, ' ').slice(0, 170));
        const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        check(`sizing inputs [${a}|${b}|${c}] layout holds`, over <= 1, over);
      }
      // what a person on a phone does: clear the field, type a new number
      const acc = inputs.nth(0);
      await acc.click();
      await acc.fill('');
      const cleared = await acc.inputValue();
      await page.keyboard.type('25000');
      const typed = await acc.inputValue();
      check('sizing: clear then type gives the typed number', cleared === '' && typed === '25000', `cleared="${cleared}" typed="${typed}"`);
      await inputs.nth(2).fill('0');
      const zero = await panel.innerText();
      check('sizing: zero max loss explains itself', /Enter your account size/.test(zero), zero.replace(/\s+/g, ' ').slice(-120));
    }
    check('sizing no errors', errs.length === 0, errs.join(' | '));
    await ctx.close();
  }

  // G: glossary search
  {
    const { ctx, page, errs } = await open(browser, VIEWS.phone);
    await page.goto(BASE + '/glossary');
    const s = page.locator('input[type=search]');
    for (const q of ['zzzzqqq', '.*(', '<script>alert(1)</script>', '   ', 'THETA', 'é']) {
      await s.fill(q);
      await page.waitForTimeout(30);
      const t = await page.locator('body').innerText();
      const status = await page.locator('[role=status]').first().innerText();
      check(`glossary "${q}" holds`, !BAD_TEXT.test(t) && /of \d+ terms/.test(status), status);
    }
    await s.fill('zzzzqqq');
    check('glossary empty state', await page.getByText('No term matches').isVisible());
    await s.fill('THETA');
    check('glossary search ignores case', !/^0 of/.test(await page.locator('[role=status]').first().innerText()));
    check('glossary no errors', errs.length === 0, errs.join(' | '));
    await ctx.close();
  }

  // H: copy button with clipboard refused
  {
    const { ctx, page, errs } = await open(browser, VIEWS.desktop, { fn: () => { Object.defineProperty(navigator, 'clipboard', { value: { writeText: () => Promise.reject(new Error('denied')) } }); } });
    let found = false;
    for (const r of routes.filter((x) => x.startsWith('/course/'))) {
      await page.goto(BASE + r);
      if (await page.getByRole('button', { name: 'Copy template' }).count()) {
        found = true;
        await page.getByRole('button', { name: 'Copy template' }).first().click();
        check('copy denied says so', await page.getByRole('button', { name: 'Select and copy' }).first().isVisible());
        break;
      }
    }
    if (!found) note('no copy template found');
    check('copy no errors', errs.length === 0, errs.join(' | '));
    await ctx.close();
  }

  // I: broken saves, the people coming back after an update
  const saves = {
    'not json': 'not json {{{',
    'null': 'null',
    'number': '5',
    'array': '[]',
    'null fields': JSON.stringify({ completedModules: null, quizScores: null, moduleXp: null, challengeResults: null, totalXp: null, currentStreak: null, lastActivity: null }),
    'wrong types': JSON.stringify({ completedModules: 'abc', quizScores: 'x', moduleXp: 7, challengeResults: [], totalXp: 'lots', currentStreak: {}, lastActivity: 42 }),
    'unknown modules': JSON.stringify({ completedModules: ['gone-module'], quizScores: { 'gone-module': 100 }, moduleXp: { 'gone-module': 10 }, challengeResults: { gone: true }, totalXp: 999999, currentStreak: 3, lastActivity: '2020-01-01' }),
    'huge': JSON.stringify({ totalXp: 1e308, currentStreak: 1e308 }),
  };
  const targets = ['/', '/complete', routes.find((r) => r.startsWith('/course/')), quizzes[0], '/challenge', '/lab', '/glossary'];
  for (const [name, raw] of Object.entries(saves)) {
    const { ctx, page, errs } = await open(browser, VIEWS.phone, { fn: ([k, v]) => { try { localStorage.setItem(k, v); } catch {} }, arg: [KEY, raw] });
    for (const r of targets) {
      errs.length = 0;
      await page.goto(BASE + r, { waitUntil: 'load' });
      await page.waitForTimeout(150);
      const t = await page.locator('body').innerText();
      const crashed = /Application error|client-side exception|This page couldn't load/i.test(t) || t.trim().length < 40;
      check(`bad save "${name}" on ${r} survives`, !crashed && errs.length === 0, crashed ? 'CRASH SCREEN' : errs.join(' | '));
      if (!crashed && BAD_TEXT.test(t)) check(`bad save "${name}" on ${r} clean text`, false, (t.match(BAD_TEXT) || [])[0]);
    }
    // and can they still finish a quiz
    await page.goto(BASE + quizzes[0]);
    let finished = true;
    await answerQuiz(page).catch(() => { finished = false; });
    check(`bad save "${name}": quiz still finishes`, finished && (await page.getByText('Result', { exact: true }).isVisible().catch(() => false)));
    await ctx.close();
  }

  // J: storage blocked (some private modes and locked-down school/work browsers)
  {
    const { ctx, page, errs } = await open(browser, VIEWS.phone, { fn: () => { Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('denied', 'SecurityError'); } }); } });
    for (const r of targets) {
      errs.length = 0;
      await page.goto(BASE + r, { waitUntil: 'load' });
      await page.waitForTimeout(120);
      const t = await page.locator('body').innerText();
      check(`storage blocked on ${r} survives`, !/Application error|client-side exception/i.test(t) && errs.length === 0, errs.join(' | '));
    }
    await page.goto(BASE + quizzes[0]);
    await answerQuiz(page);
    check('storage blocked: quiz still gives a result', await page.getByText('Result', { exact: true }).isVisible());
    const t = await page.locator('body').innerText();
    note(`storage blocked result tells user progress wont save: ${/won't|cannot|can't|not saved|isn't saved/i.test(t)}`);
    await ctx.close();
  }

  // K: JavaScript off
  {
    const { ctx, page } = await open(browser, { ...VIEWS.phone, javaScriptEnabled: false });
    for (const r of ['/', routes.find((x) => x.startsWith('/course/')), '/glossary']) {
      await page.goto(BASE + r);
      const t = await page.locator('body').innerText();
      check(`no JS: ${r} still readable`, t.length > 300, t.length);
    }
    await page.goto(BASE + '/');
    await page.screenshot({ path: path.join(OUT, 'nojs-home.png') });
    await page.goto(BASE + quizzes[0]);
    note('no JS quiz text sample: ' + (await page.locator('body').innerText()).replace(/\s+/g, ' ').slice(0, 160));
    await ctx.close();
  }

  // L: losing signal mid-course
  {
    const { ctx, page } = await open(browser, VIEWS.phone);
    await page.goto(BASE + quizzes[0]);
    await page.waitForTimeout(400);
    await ctx.setOffline(true);
    await answerQuiz(page);
    check('offline: quiz already open still finishes and saves', !!(await readSave(page)));
    await page.getByRole('link', { name: /Next:/ }).click().catch(() => {});
    await page.waitForTimeout(2500);
    const t = await page.locator('body').innerText().catch(() => '');
    note('offline next-lesson screen: ' + t.replace(/\s+/g, ' ').slice(0, 120));
    await page.screenshot({ path: path.join(OUT, 'offline-next.png') });
    await ctx.close();
  }

  // M: wrong addresses
  {
    const { ctx, page, errs } = await open(browser, VIEWS.phone);
    for (const r of ['/nope', '/course/nope', '/quiz/nope', '/course/%3Cscript%3E', '/quiz/../../etc/passwd']) {
      const resp = await page.goto(BASE + r);
      const t = await page.locator('body').innerText();
      // a host may refuse a path-traversal address outright, which is also fine
      const refused = r.includes('..') && [400, 403].includes(resp.status());
      check(`${r} is a real 404 with a way home`, refused || (resp.status() === 404 && (await page.locator('a[href="/"]').count()) > 0), resp.status() + ' ' + t.slice(0, 60));
    }
    await ctx.close();
  }

  // N: back and forward through a half-done quiz, double taps
  {
    const { ctx, page, errs } = await open(browser, VIEWS.phone);
    await page.goto(BASE + '/');
    await page.goto(BASE + quizzes[2]);
    const o = page.locator('[role=radiogroup] button');
    await o.first().dblclick();
    check('double tap keeps one answer', (await page.getByRole('button', { name: /Next question|Finish/ }).count()) === 1);
    await page.goBack();
    await page.goForward();
    check('back and forward returns a working quiz', await page.locator('[role=radiogroup] button').first().waitFor({ timeout: 6000 }).then(() => true, () => false));
    check('nav no errors', errs.length === 0, errs.join(' | '));
    await ctx.close();
  }

  // O: reduced motion, and big text
  {
    const { ctx, page, errs } = await open(browser, { ...VIEWS.phone, reducedMotion: 'reduce' });
    await page.goto(BASE + '/');
    await page.waitForTimeout(600);
    const moving = await page.evaluate(() => document.getAnimations().filter((a) => a.playState === 'running' && a.effect?.getTiming?.().iterations === Infinity).length);
    check('reduced motion stops endless animation', moving === 0, moving);
    check('reduced motion no errors', errs.length === 0, errs.join(' | '));
    await ctx.close();
    const big = await open(browser, VIEWS.phone);
    await big.page.goto(BASE + routes.find((r) => r.startsWith('/course/')));
    await big.page.addStyleTag({ content: 'html{font-size:200%!important}' });
    await big.page.waitForTimeout(100);
    const over = await big.page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    check('200% text does not break the page', over <= 1, over);
    await big.ctx.close();
  }
}

async function regressions(browser, routes) {
  const { ctx, page } = await open(browser, VIEWS.phone);
  const resp = await page.goto(BASE + '/');
  const h = resp.headers();
  check('frame protection header sent', /frame-ancestors 'none'/.test(h['content-security-policy'] || '') && h['x-frame-options'] === 'DENY');
  check('nosniff header sent', h['x-content-type-options'] === 'nosniff');
  // worked-example takeaways once rendered in the page background color
  let seen = 0;
  for (const r of routes.filter((x) => x.startsWith('/course/'))) {
    await page.goto(BASE + r);
    const colors = await page.$$eval('.worked > p.bg-raised', (els) => els.map((e) => getComputedStyle(e).color));
    seen += colors.length;
    check(`${r} worked-example text is visible`, !colors.includes('rgb(14, 18, 22)'), colors.join(' '));
  }
  check('worked-example takeaways exist to check', seen > 0, seen);
  await ctx.close();
}

async function a11y(browser, routes) {
  const pages = ['/', routes.find((r) => r.startsWith('/course/')), routes.find((r) => r.startsWith('/quiz/')), '/lab', '/challenge', '/glossary', '/complete'];
  const tally = {};
  for (const [v, opts] of [['phone', VIEWS.phone], ['desktop', VIEWS.desktop]]) {
    const { ctx, page } = await open(browser, opts);
    for (const r of pages) {
      await page.goto(BASE + r, { waitUntil: 'load' });
      await page.waitForTimeout(300);
      await page.evaluate(axe);
      const res = await page.evaluate(() => window.axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] }));
      for (const x of res.violations) {
        const k = `${x.id} [${x.impact}]`;
        (tally[k] ??= { n: 0, where: new Set(), ex: x.nodes[0]?.target?.join(' ') + ' :: ' + (x.nodes[0]?.any?.[0]?.message ?? '') });
        tally[k].n += x.nodes.length;
        tally[k].where.add(r);
      }
    }
    await ctx.close();
  }
  const keys = Object.keys(tally);
  check('axe finds no WCAG AA violations', keys.length === 0, keys.join(', '));
  for (const k of keys) note(`axe ${k} x${tally[k].n} on ${[...tally[k].where].join(' ')} e.g. ${tally[k].ex.slice(0, 200)}`);

  // tap targets on phone
  const { ctx, page } = await open(browser, VIEWS.phone);
  const small = {};
  for (const r of pages) {
    await page.goto(BASE + r, { waitUntil: 'load' });
    await page.waitForTimeout(100);
    const list = await page.evaluate(() => [...document.querySelectorAll('a,button,input,select,[role=slider]')].filter((e) => {
      const b = e.getBoundingClientRect();
      const inSentence = e.tagName === 'A' && e.parentElement && [...e.parentElement.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
      return !inSentence && b.width && b.height && (b.width < 24 || b.height < 24) && getComputedStyle(e).visibility !== 'hidden';
    }).map((e) => `${e.tagName} "${(e.getAttribute('aria-label') || e.textContent || '').trim().slice(0, 30)}" ${Math.round(e.getBoundingClientRect().width)}x${Math.round(e.getBoundingClientRect().height)}`));
    for (const s of list) small[s] = (small[s] || 0) + 1;
  }
  const sm = Object.keys(small);
  check('phone tap targets are at least 24px', sm.length === 0, sm.slice(0, 8).join('; '));
  await ctx.close();
}

async function waitForServer() {
  for (let i = 0; i < 60; i++) {
    if (await fetch(BASE).then((r) => r.ok, () => false)) return;
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`no server at ${BASE}. Run npm run build first.`);
}

(async () => {
  const server = process.env.BASE ? null : spawn(path.join(__dirname, '..', 'node_modules', '.bin', 'next'), ['start', '-p', String(PORT)], { cwd: path.join(__dirname, '..'), stdio: 'ignore' });
  let code = 2;
  try {
    await waitForServer();
    const chromium = await pw.chromium.launch();
    const routes = await crawl(chromium);
    note(`routes ${routes.length}`);
    await sweep(chromium, routes, 'chromium', VIEWS);
    await flows(chromium, routes);
    await regressions(chromium, routes);
    await a11y(chromium, routes);
    await chromium.close();

    // iPhone Safari's engine gets the full treatment. Firefox has no phone mode, so desktop only.
    engine = 'webkit';
    const webkit = await pw.webkit.launch();
    await sweep(webkit, routes, 'webkit', { phone: VIEWS.phone });
    await flows(webkit, routes);
    await webkit.close();

    engine = 'firefox';
    const firefox = await pw.firefox.launch();
    await sweep(firefox, routes, 'firefox', { desktop: VIEWS.desktop });
    await firefox.close();

    console.log(`\n${pass} passed, ${fail} failed against ${BASE}`);
    code = fail ? 1 : 0;
  } catch (e) {
    console.error('HARNESS ERROR', e);
    console.log(`${pass} passed, ${fail} failed before stopping`);
  } finally {
    server?.kill();
  }
  process.exit(code);
})();
