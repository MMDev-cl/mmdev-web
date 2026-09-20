import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const STORAGE_KEY = 'mmdev.measurement-consent';
const TOMBSTONE_NAME = 'mmdev_analytics_consent_denied';
const CHANNEL_NAME = 'mmdev-measurement-consent';
const CONTAINER_ID = 'GTM-M9CZ2JMS';
const FORBIDDEN_GA4_ID = ['G', 'RPY8G3P83L'].join('-');

const html = fs.readFileSync('dist/index.html', 'utf8');
const inlineScript = html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert.ok(inlineScript, 'No se encontró el inicializador inline de medición.');

const validRecord = (analytics, now = Date.now()) =>
  JSON.stringify({
    version: 1,
    analytics,
    updatedAt: new Date(now - 1_000).toISOString(),
    expiresAt: new Date(now + 24 * 60 * 60 * 1_000).toISOString(),
  });

const createSharedState = () => {
  const shared = {
    storage: new Map(),
    cookies: new Map(),
    channels: new Map(),
    broadcastMessages: [],
    emitBroadcast(data) {
      for (const channels of this.channels.values()) {
        for (const channel of channels) {
          channel.onmessage?.({ data: structuredClone(data) });
        }
      }
    },
  };

  return shared;
};

const bootTab = (
  shared,
  {
    broadcastChannel = true,
    cookieFailure = false,
    ignoreTombstoneDeletion = false,
    hostname = 'www.mmdev.cl',
    protocol = 'https:',
    storageReadFailure = false,
    storageWriteFailure = false,
    storageRemoveFailure = false,
  } = {},
) => {
  const resources = [];
  const cookieWrites = [];
  const documentEvents = [];
  const windowEvents = new Map();
  const storageOperations = [];
  const flags = {
    cookieFailure,
    ignoreTombstoneDeletion,
    storageReadFailure,
    storageWriteFailure,
    storageRemoveFailure,
  };
  let reloads = 0;

  const localStorage = {
    getItem(key) {
      if (flags.storageReadFailure) throw new Error('Storage read blocked');
      return shared.storage.get(key) ?? null;
    },
    setItem(key, value) {
      if (flags.storageWriteFailure) throw new Error('Storage write blocked');
      storageOperations.push({ operation: 'set', key, value });
      shared.storage.set(key, value);
    },
    removeItem(key) {
      if (flags.storageRemoveFailure) throw new Error('Storage remove blocked');
      storageOperations.push({ operation: 'remove', key });
      shared.storage.delete(key);
    },
  };

  const document = {
    get cookie() {
      if (flags.cookieFailure) throw new Error('Cookie read blocked');
      return [...shared.cookies]
        .map(([name, value]) => `${name}=${value}`)
        .join('; ');
    },
    set cookie(serializedCookie) {
      cookieWrites.push(serializedCookie);
      if (flags.cookieFailure) throw new Error('Cookie write blocked');

      const [pair] = serializedCookie.split(';');
      const separator = pair.indexOf('=');
      const name = pair.slice(0, separator);
      const value = pair.slice(separator + 1);
      const removesCookie = /(?:^|;)\s*Max-Age=0(?:;|$)/i.test(
        serializedCookie,
      );

      if (
        name === TOMBSTONE_NAME &&
        removesCookie &&
        flags.ignoreTombstoneDeletion
      ) {
        return;
      }

      if (removesCookie) shared.cookies.delete(name);
      else shared.cookies.set(name, value);
    },
    querySelector(selector) {
      if (selector !== 'script[data-mmdev-google-tag-manager]') return null;
      return resources.find((resource) => resource.tag === 'script') ?? null;
    },
    createElement(tag) {
      return { tag, async: false, dataset: {}, src: '' };
    },
    head: {
      append(element) {
        resources.push({ tag: element.tag, src: element.src });
      },
    },
    dispatchEvent(event) {
      documentEvents.push(event);
      return true;
    },
  };

  const window = {
    dataLayer: [],
    localStorage,
    location: {
      hostname,
      protocol,
      reload() {
        reloads += 1;
      },
    },
    addEventListener(type, listener) {
      const listeners = windowEvents.get(type) ?? [];
      listeners.push(listener);
      windowEvents.set(type, listeners);
    },
  };

  if (broadcastChannel) {
    window.BroadcastChannel = class {
      constructor(name) {
        this.name = name;
        this.onmessage = null;
        this.closed = false;
        const channels = shared.channels.get(name) ?? new Set();
        channels.add(this);
        shared.channels.set(name, channels);
      }

      postMessage(data) {
        const clonedData = structuredClone(data);
        shared.broadcastMessages.push(clonedData);
        for (const channel of shared.channels.get(this.name) ?? []) {
          if (channel !== this && !channel.closed) {
            channel.onmessage?.({ data: structuredClone(clonedData) });
          }
        }
      }

      close() {
        this.closed = true;
        shared.channels.get(this.name)?.delete(this);
      }
    };
  }

  vm.runInNewContext(inlineScript, {
    window,
    document,
    CustomEvent: class {
      constructor(type, options) {
        this.type = type;
        this.detail = options?.detail;
      }
    },
    Date,
    JSON,
    Object,
    Number,
    encodeURIComponent,
  });

  return {
    window,
    flags,
    resources,
    cookieWrites,
    documentEvents,
    storageOperations,
    reloads: () => reloads,
    emitStorage(newValue, key = STORAGE_KEY) {
      for (const listener of windowEvents.get('storage') ?? []) {
        listener({ key, newValue });
      }
    },
  };
};

const consentCommands = (tab) =>
  tab.window.dataLayer
    .filter(
      (entry) => Object.prototype.toString.call(entry) === '[object Arguments]',
    )
    .map((entry) => Array.from(entry));

const latestAnalyticsState = (tab) =>
  consentCommands(tab).at(-1)?.[2]?.analytics_storage;

const tombstoneDeletionWrites = (tab) =>
  tab.cookieWrites.filter(
    (write) =>
      write.startsWith(`${TOMBSTONE_NAME}=`) &&
      /(?:^|;)\s*Max-Age=0(?:;|$)/i.test(write),
  );

const hasDomainAttribute = (write) => /(?:^|;)\s*Domain=/i.test(write);

const acceptsAfterClearingTombstone = (hostname, protocol = 'https:') => {
  const shared = createSharedState();
  shared.storage.set(STORAGE_KEY, validRecord('denied'));
  shared.cookies.set(TOMBSTONE_NAME, '1');
  const tab = bootTab(shared, { hostname, protocol });

  const result = tab.window.mmdevMeasurement.setAnalyticsConsent('granted');
  assert.equal(result.persisted, true);
  assert.equal(tab.window.mmdevMeasurement.getAnalyticsConsent(), 'granted');
  assert.equal(latestAnalyticsState(tab), 'granted');
  assert.equal(tab.resources.length, 1);
  assert.equal(shared.cookies.has(TOMBSTONE_NAME), false);

  return tombstoneDeletionWrites(tab);
};

const scenarios = [];
const scenario = (name, run) => {
  run();
  scenarios.push(name);
};

scenario('unknown does not load Google resources', () => {
  const tab = bootTab(createSharedState());
  assert.equal(tab.window.mmdevMeasurement.getAnalyticsConsent(), null);
  assert.deepEqual(tab.resources, []);
  assert.equal(latestAnalyticsState(tab), 'denied');
});

scenario(
  'expired, invalid and denied records do not load Google resources',
  () => {
    const now = Date.now();
    const cases = [
      JSON.stringify({
        version: 1,
        analytics: 'granted',
        updatedAt: new Date(now - 2_000).toISOString(),
        expiresAt: new Date(now - 1_000).toISOString(),
      }),
      '{invalid-json',
      validRecord('denied'),
    ];

    for (const storedConsent of cases) {
      const shared = createSharedState();
      shared.storage.set(STORAGE_KEY, storedConsent);
      const tab = bootTab(shared);
      assert.deepEqual(tab.resources, []);
      assert.notEqual(
        tab.window.mmdevMeasurement.getAnalyticsConsent(),
        'granted',
      );
    }
  },
);

scenario('initial localStorage failure remains unknown without Google', () => {
  const shared = createSharedState();
  shared.storage.set(STORAGE_KEY, validRecord('granted'));
  const tab = bootTab(shared, { storageReadFailure: true });
  assert.equal(tab.window.mmdevMeasurement.getAnalyticsConsent(), null);
  assert.deepEqual(tab.resources, []);
  assert.equal(latestAnalyticsState(tab), 'denied');
});

scenario('normal revocation persists denied and reloads once', () => {
  const shared = createSharedState();
  shared.storage.set(STORAGE_KEY, validRecord('granted'));
  shared.cookies.set('_ga', 'one');
  shared.cookies.set('_ga_TEST', 'two');
  const tab = bootTab(shared);

  const result = tab.window.mmdevMeasurement.setAnalyticsConsent('denied');
  assert.equal(result.persisted, true);
  assert.equal(result.reloading, true);
  assert.equal(tab.reloads(), 1);
  assert.equal(shared.cookies.get(TOMBSTONE_NAME), '1');
  assert.equal(JSON.parse(shared.storage.get(STORAGE_KEY)).analytics, 'denied');
  assert.equal(shared.cookies.has('_ga'), false);
  assert.equal(shared.cookies.has('_ga_TEST'), false);
  assert.equal(latestAnalyticsState(tab), 'denied');
});

scenario('transient localStorage failure cannot restore stale granted', () => {
  const shared = createSharedState();
  shared.storage.set(STORAGE_KEY, validRecord('granted'));
  const tab = bootTab(shared);
  tab.flags.storageRemoveFailure = true;
  tab.flags.storageWriteFailure = true;

  const result = tab.window.mmdevMeasurement.setAnalyticsConsent('denied');
  assert.equal(result.persisted, true);
  assert.equal(tab.reloads(), 1);
  assert.equal(
    JSON.parse(shared.storage.get(STORAGE_KEY)).analytics,
    'granted',
  );
  assert.equal(shared.cookies.get(TOMBSTONE_NAME), '1');

  const reloadedTab = bootTab(shared);
  assert.equal(
    reloadedTab.window.mmdevMeasurement.getAnalyticsConsent(),
    'denied',
  );
  assert.deepEqual(reloadedTab.resources, []);
  assert.equal(JSON.parse(shared.storage.get(STORAGE_KEY)).analytics, 'denied');
});

scenario('stale granted plus tombstone resolves to denied', () => {
  const shared = createSharedState();
  shared.storage.set(STORAGE_KEY, validRecord('granted'));
  shared.cookies.set(TOMBSTONE_NAME, '1');
  const tab = bootTab(shared);

  assert.equal(tab.window.mmdevMeasurement.getAnalyticsConsent(), 'denied');
  assert.deepEqual(tab.resources, []);
  assert.equal(JSON.parse(shared.storage.get(STORAGE_KEY)).analytics, 'denied');
});

scenario('tombstone protects when localStorage is unavailable', () => {
  const shared = createSharedState();
  shared.storage.set(STORAGE_KEY, validRecord('granted'));
  shared.cookies.set(TOMBSTONE_NAME, '1');
  const tab = bootTab(shared, {
    storageReadFailure: true,
    storageWriteFailure: true,
    storageRemoveFailure: true,
  });

  assert.equal(tab.window.mmdevMeasurement.getAnalyticsConsent(), 'denied');
  assert.deepEqual(tab.resources, []);
});

scenario(
  'simultaneous persistence failure keeps current session denied',
  () => {
    const shared = createSharedState();
    shared.storage.set(STORAGE_KEY, validRecord('granted'));
    const tab = bootTab(shared);
    tab.flags.cookieFailure = true;
    tab.flags.storageReadFailure = true;
    tab.flags.storageWriteFailure = true;
    tab.flags.storageRemoveFailure = true;

    const result = tab.window.mmdevMeasurement.setAnalyticsConsent('denied');
    assert.equal(result.persisted, false);
    assert.equal(result.reloading, false);
    assert.equal(tab.reloads(), 0);
    assert.equal(tab.window.mmdevMeasurement.getAnalyticsConsent(), null);
    assert.equal(latestAnalyticsState(tab), 'denied');
  },
);

scenario('acceptance fails safely when tombstone cannot be removed', () => {
  const shared = createSharedState();
  shared.storage.set(STORAGE_KEY, validRecord('denied'));
  shared.cookies.set(TOMBSTONE_NAME, '1');
  const tab = bootTab(shared);
  tab.flags.ignoreTombstoneDeletion = true;

  const result = tab.window.mmdevMeasurement.setAnalyticsConsent('granted');
  assert.equal(result.persisted, false);
  assert.deepEqual(tab.resources, []);
  assert.equal(tab.window.mmdevMeasurement.getAnalyticsConsent(), 'denied');
  assert.equal(JSON.parse(shared.storage.get(STORAGE_KEY)).analytics, 'denied');
});

scenario('localhost acceptance avoids Domain=.mmdev.cl', () => {
  const writes = acceptsAfterClearingTombstone('localhost', 'http:');
  assert.equal(writes.some(hasDomainAttribute), false);
  assert.equal(writes.length, 1);
});

scenario('mmdev.cl acceptance clears host-only and domain tombstones', () => {
  const writes = acceptsAfterClearingTombstone('mmdev.cl');
  assert.equal(
    writes.some((write) => !hasDomainAttribute(write)),
    true,
  );
  assert.equal(
    writes.some((write) => /;\s*Domain=\.mmdev\.cl(?:;|$)/i.test(write)),
    true,
  );
  assert.equal(writes.length, 2);
});

scenario('mmdev.cl subdomain acceptance clears the domain tombstone', () => {
  const writes = acceptsAfterClearingTombstone('app.mmdev.cl');
  assert.equal(
    writes.some((write) => !hasDomainAttribute(write)),
    true,
  );
  assert.equal(
    writes.some((write) => /;\s*Domain=\.mmdev\.cl(?:;|$)/i.test(write)),
    true,
  );
  assert.equal(writes.length, 2);
});

scenario('preview acceptance avoids Domain=.mmdev.cl', () => {
  const writes = acceptsAfterClearingTombstone('feature.mmdev.pages.dev');
  assert.equal(writes.some(hasDomainAttribute), false);
  assert.equal(writes.length, 1);
});

scenario('storage denied propagates and cannot reload twice', () => {
  const shared = createSharedState();
  shared.storage.set(STORAGE_KEY, validRecord('granted'));
  const tab = bootTab(shared);
  const deniedRecord = validRecord('denied');
  shared.storage.set(STORAGE_KEY, deniedRecord);

  tab.emitStorage(deniedRecord);
  tab.emitStorage(deniedRecord);
  assert.equal(tab.window.mmdevMeasurement.getAnalyticsConsent(), 'denied');
  assert.equal(tab.reloads(), 1);
  assert.equal(latestAnalyticsState(tab), 'denied');
});

scenario('localStorage.clear propagates as denied', () => {
  const shared = createSharedState();
  shared.storage.set(STORAGE_KEY, validRecord('granted'));
  const tab = bootTab(shared);
  shared.storage.clear();

  tab.emitStorage(null, null);
  assert.equal(tab.window.mmdevMeasurement.getAnalyticsConsent(), 'denied');
  assert.equal(tab.reloads(), 1);
  assert.equal(latestAnalyticsState(tab), 'denied');
});

scenario(
  'BroadcastChannel propagates denied despite sender storage failure',
  () => {
    const shared = createSharedState();
    shared.storage.set(STORAGE_KEY, validRecord('granted'));
    const sender = bootTab(shared);
    const receiver = bootTab(shared);
    sender.flags.storageRemoveFailure = true;
    sender.flags.storageWriteFailure = true;

    sender.window.mmdevMeasurement.setAnalyticsConsent('denied');
    assert.equal(
      receiver.window.mmdevMeasurement.getAnalyticsConsent(),
      'denied',
    );
    assert.equal(sender.reloads(), 1);
    assert.equal(receiver.reloads(), 1);
    assert.deepEqual(shared.broadcastMessages.at(-1), {
      version: 1,
      analytics: 'denied',
    });
  },
);

scenario('valid granted propagates after complete receiver validation', () => {
  const shared = createSharedState();
  shared.storage.set(STORAGE_KEY, validRecord('denied'));
  shared.cookies.set(TOMBSTONE_NAME, '1');
  const sender = bootTab(shared);
  const receiver = bootTab(shared);

  sender.window.mmdevMeasurement.setAnalyticsConsent('granted');
  assert.equal(sender.window.mmdevMeasurement.getAnalyticsConsent(), 'granted');
  assert.equal(
    receiver.window.mmdevMeasurement.getAnalyticsConsent(),
    'granted',
  );
  assert.equal(sender.resources.length, 1);
  assert.equal(receiver.resources.length, 1);
  assert.deepEqual(
    sender.storageOperations.map(({ operation }) => operation),
    ['set'],
  );
});

scenario('manipulated and wrong-version messages are ignored', () => {
  const shared = createSharedState();
  const tab = bootTab(shared);

  shared.emitBroadcast({ version: 999, analytics: 'granted' });
  shared.emitBroadcast({ version: 1, analytics: '<script>' });
  assert.equal(tab.window.mmdevMeasurement.getAnalyticsConsent(), null);
  assert.deepEqual(tab.resources, []);
});

scenario('absence of BroadcastChannel does not break consent', () => {
  const shared = createSharedState();
  const tab = bootTab(shared, { broadcastChannel: false });

  const result = tab.window.mmdevMeasurement.setAnalyticsConsent('granted');
  assert.equal(result.persisted, true);
  assert.equal(tab.resources.length, 1);
});

scenario('premature preferences request remains pending exactly once', () => {
  const tab = bootTab(createSharedState());
  tab.window.mmdevMeasurement.openPreferences();
  assert.equal(
    tab.window.mmdevMeasurement.consumePendingPreferencesOpen(),
    true,
  );
  assert.equal(
    tab.window.mmdevMeasurement.consumePendingPreferencesOpen(),
    false,
  );
});

scenario('generated HTML contains no forbidden static Google resources', () => {
  const forbiddenStaticResource =
    /<(?:script|iframe|link|img|source)[^>]+(?:src|href)=["'][^"']*(?:googletagmanager\.com|google-analytics\.com|analytics\.google\.com)[^"']*["'][^>]*>/i;
  assert.equal(forbiddenStaticResource.test(html), false);
  assert.equal(/<noscript[^>]*>\s*<iframe/i.test(html), false);
  assert.equal(html.includes(CONTAINER_ID), true);
  assert.equal(html.includes(FORBIDDEN_GA4_ID), false);
});

assert.ok(
  consentCommands(bootTab(createSharedState())).every(
    (command) => command[0] === 'consent',
  ),
  'Los comandos deben conservar el formato arguments de gtag.',
);

const acceptedTab = bootTab(createSharedState());
acceptedTab.window.mmdevMeasurement.setAnalyticsConsent('granted');
const acceptedCommands = consentCommands(acceptedTab);
assert.deepEqual(
  acceptedCommands.map((command) => [
    command[1],
    command[2].analytics_storage,
    command[2].ad_storage,
    command[2].ad_user_data,
    command[2].ad_personalization,
  ]),
  [
    ['default', 'denied', 'denied', 'denied', 'denied'],
    ['update', 'granted', 'denied', 'denied', 'denied'],
  ],
);
assert.equal(acceptedTab.resources.length, 1);

console.log(`Measurement verification passed (${scenarios.length} scenarios):`);
for (const name of scenarios) console.log(`- ${name}`);
console.log(`- Broadcast channel: ${CHANNEL_NAME}`);
