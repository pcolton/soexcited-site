const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'store.js'), 'utf8');
const id = '1234567890'; // Synthetic fixture, never a production Apple ID.
const url = `https://apps.apple.com/app/id${id}`;
const live = { resultCount: 1, results: [{ wrapperType: 'software', trackId: Number(id) }] };
function page(appId = id, redirect = false, loading = false) {
  const badges = [{ hidden: true, href: 'app/' }, { hidden: true, href: 'app/' }];
  const soon = [{ hidden: false }, { hidden: false }];
  const destinations = [], scripts = [], timers = new Map(), listeners = {};
  let seq = 0;
  const document = { readyState: loading ? 'loading' : 'complete',
    documentElement: { dataset: redirect ? { redirect: '1' } : {} },
    head: { appendChild: s => scripts.push(s) },
    createElement: () => ({ remove() { this.removed = true; } }),
    querySelectorAll: s => s === '[data-store-badge]' ? badges : soon,
    addEventListener: (event, fn) => { listeners[event] = fn; } };
  const context = { document, window: {}, location: { replace: u => destinations.push(u) },
    setTimeout: (fn, ms) => { const key = ++seq; timers.set(key, { fn, ms }); return key; },
    clearTimeout: key => timers.delete(key) };
  vm.runInNewContext(source.replace(/var APP_ID = "[^"]*";/, `var APP_ID = ${JSON.stringify(appId)};`), context);
  return { badges, soon, destinations, scripts, timers, listeners, reply: context.window.__soExcitedStore };
}
function fallback(p, redirect) {
  assert.deepEqual(p.destinations, redirect ? ['/'] : []);
  assert.ok(p.badges.every(b => b.hidden && b.href === 'app/'));
  assert.ok(p.soon.every(s => !s.hidden));
}
for (const redirect of [false, true]) {
  test(`invalid/unconfigured IDs preserve fallback (${redirect})`, () => {
    for (const appId of ['', 'abc', '0', ' 123', '123&callback=x']) {
      const p = page(appId, redirect); fallback(p, redirect);
      assert.equal(p.scripts.length, 0); assert.equal(p.timers.size, 0);
    }
  });
  test(`unreleased, malformed and wrong-app responses preserve fallback (${redirect})`, () => {
    for (const response of [null, {}, { resultCount: 0, results: [] }, { resultCount: 1 },
      { resultCount: 1, results: {} }, { resultCount: 1, results: [null] },
      { resultCount: 1, results: [{ wrapperType: 'software', trackId: 999 }] },
      { resultCount: 1, results: [{ wrapperType: 'track', trackId: Number(id) }] }]) {
      const p = page(id, redirect); p.reply(response); fallback(p, redirect);
      assert.equal(p.timers.size, 0); assert.equal(p.scripts[0].removed, true);
    }
  });
  test(`network errors preserve fallback and ignore late callbacks (${redirect})`, () => {
    const p = page(id, redirect); p.scripts[0].onerror(); p.reply(live); fallback(p, redirect);
  });
  test(`timeout preserves fallback and ignores late callbacks (${redirect})`, () => {
    const p = page(id, redirect); const timer = [...p.timers.values()][0];
    assert.equal(timer.ms, 8000); timer.fn(); p.reply(live); fallback(p, redirect);
  });
}
test('release updates both badge URLs and hides both coming-soon messages', () => {
  const p = page(); p.reply(live); p.reply(null);
  assert.ok(p.badges.every(b => !b.hidden && b.href === url));
  assert.ok(p.soon.every(s => s.hidden)); assert.deepEqual(p.destinations, []);
  assert.equal(p.timers.size, 0);
});
test('released share link redirects to the exact listing once', () => {
  const p = page(id, true); p.reply(live); p.reply(null);
  assert.deepEqual(p.destinations, [url]); assert.equal(p.timers.size, 0);
});
test('early lookup response waits for DOM readiness', () => {
  const p = page(id, false, true); p.reply(live);
  assert.ok(p.badges.every(b => b.hidden)); p.listeners.DOMContentLoaded();
  assert.ok(p.badges.every(b => !b.hidden && b.href === url));
});
test('lookup requests exact ID, software, US storefront, JSONP callback', () => {
  const query = new URL(page().scripts[0].src);
  assert.equal(query.origin, 'https://itunes.apple.com');
  for (const [key, value] of Object.entries({ id, entity: 'software', country: 'us', callback: '__soExcitedStore' })) {
    assert.equal(query.searchParams.get(key), value);
  }
});
test('production excludes fixture; both pages load matching version and preserve fallback', () => {
  assert.ok(!source.includes(`var APP_ID = "${id}";`));
  assert.match(source, /var APP_ID = "6816685893";/);
  const home = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const share = fs.readFileSync(path.join(root, 'app/index.html'), 'utf8');
  assert.equal((home.match(/data-store-badge hidden/g) || []).length, 2);
  assert.equal((home.match(/data-store-soon/g) || []).length, 2);
  assert.match(home, /src="store.js\?v=20261012" defer/);
  assert.match(share, /src="\/store.js\?v=20261012" defer/);
  assert.match(share, /data-redirect="1"/);
  assert.doesNotMatch(share, /http-equiv="refresh"/);
  assert.match(share, /<a href="\/">So Excited<\/a>/);
});
