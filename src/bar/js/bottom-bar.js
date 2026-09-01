import { isCurrentHostExcludedByPreferences, isSupportedProductPage, onBottomBarInjected, shouldInjectBottomBar } from './source.ts';
import { resolveBottomBarPageStateKey } from '../integrations';
import browser from 'webextension-polyfill';
import { t } from '../../utils/i18n.ts';

const GG_BAR_ID = 'gg-bottom-bar';
const GG_BAR_TEMPLATE_PATH = 'assets/bar/index.html';
const GG_LOCATION_CHANGE_EVENT = 'gg-extension:locationchange';
const EXCLUDED_WEBSITES_STORAGE_KEY = 'gg-ext-excluded-websites';
const DEBUG_URL_WATCH = ['1', 'true', 'yes', 'on'].includes(String(import.meta.env.VITE_BOTTOM_BAR_DEBUG ?? '').toLowerCase());
const LOCATION_POLL_INTERVAL_MS = 250;
const SPA_NAVIGATION_SETTLE_MS = 250;
const SPA_NAVIGATION_MAX_WAIT_MS = 2000;
const PAGE_STATE_SETTLE_MS = 150;

let lastHandledUrl = '';
let locationHooksInstalled = false;
let mutationWatcherInstalled = false;
let excludedWebsitesListenerInstalled = false;
let lastBlacklistCheckHostname = '';
let lastBlacklistCheckResult = false;
let latestBottomBarSyncId = 0;
let locationPollId = null;
let pendingLocationSyncTimer = null;
let pendingLocationUrl = '';
let pendingLocationStartedAt = 0;
let lastHandledPageIdentity = '';
let lastHandledPageStateKey = null;
let pendingPageStateSyncTimer = null;

async function updateDebugBadgeForBlacklistedPagesOnly() {
  const currentHostname = String(window.location.hostname ?? '').trim().toLowerCase();

  const sendUpdateBadge = async (isBlacklisted) => {
    try {
      const response = await browser.runtime.sendMessage({
        type: 'UPDATE_BADGE',
        isBlacklisted
      });

      if (!response?.ok) {
        console.warn('[gg.deals-extension][bar] UPDATE_BADGE failed:s', {
          isBlacklisted,
          response
        });
      }
    } catch (err) {
      console.error('[gg.deals-extension][bar] UPDATE_BADGE send error:', err);
    }
  };

  if (currentHostname.length === 0) {
    await sendUpdateBadge(false);
    return;
  }

  let isBlacklistedHost = false;
  if (currentHostname === lastBlacklistCheckHostname) {
    isBlacklistedHost = lastBlacklistCheckResult;
  } else {
    isBlacklistedHost = await isCurrentHostExcludedByPreferences();
    lastBlacklistCheckHostname = currentHostname;
    lastBlacklistCheckResult = isBlacklistedHost;
  }

  await sendUpdateBadge(isBlacklistedHost);
}

function logDebug(message, payload) {
  void updateDebugBadgeForBlacklistedPagesOnly();
  
  if (!DEBUG_URL_WATCH) {
    return;
  }

  if (payload === undefined) {
    console.log('[gg.deals-extension][bar][debug]', message);
    return;
  }

  console.log('[gg.deals-extension][bar][debug]', message, payload);
}

async function loadBarFromTemplate() {
  const templateUrl = browser.runtime.getURL(GG_BAR_TEMPLATE_PATH);
  const response = await fetch(templateUrl);
  if (!response.ok) {
    throw new Error(`Failed to load bar template: HTTP ${response.status}`);
  }

  const html = await response.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const templateBar = doc.querySelector('.gg-bottom-bar');
  if (!templateBar) {
    throw new Error('Missing .gg-bottom-bar in bar template');
  }

  templateBar.querySelectorAll('[data-i18n]').forEach((element) => {
    const messageName = element.getAttribute('data-i18n');
    if (messageName) {
      element.textContent = t(messageName);
    }
  });

  return templateBar.cloneNode(true);
}

async function injectBottomBar(syncId) {
  if (!document.body || document.getElementById(GG_BAR_ID)) {
    logDebug('inject skipped', {
      hasBody: Boolean(document.body),
      alreadyInjected: Boolean(document.getElementById(GG_BAR_ID))
    });
    return;
  }

  try {
    const bar = await loadBarFromTemplate();
    if (syncId !== latestBottomBarSyncId) {
      logDebug('stale injection skipped', { syncId, latestBottomBarSyncId });
      return;
    }

    bar.id = GG_BAR_ID;

    document.body.appendChild(bar);
    onBottomBarInjected(bar);

    logDebug('bar injected', { url: window.location.href });
  } catch (error) {
    console.error('[gg.deals-extension] Failed to inject bottom bar:', error);
  }
}

function removeBottomBar() {
  const bar = document.getElementById(GG_BAR_ID);
  if (bar) {
    bar.remove();
    logDebug('bar removed', { url: window.location.href });
  }
}

async function syncBottomBarForCurrentUrl(source = 'unknown') {
  const syncId = ++latestBottomBarSyncId;
  const currentUrl = window.location.href;
  const shouldShowBar = isSupportedProductPage(currentUrl);
  const hasBar = Boolean(document.getElementById(GG_BAR_ID));

  logDebug('sync start', {
    source,
    currentUrl,
    shouldShowBar,
    hasBar
  });

  if (!shouldShowBar) {
    logDebug('bar not injected', {
      reason: 'unsupported product URL',
      currentUrl
    });
    removeBottomBar();
    return;
  }

  const shouldInject = await shouldInjectBottomBar(() => syncId !== latestBottomBarSyncId);
  if (syncId !== latestBottomBarSyncId) {
    logDebug('stale sync result ignored', { syncId, latestBottomBarSyncId, currentUrl });
    return;
  }

  if (shouldInject) {
    if (hasBar) {
      removeBottomBar();
    }
    await injectBottomBar(syncId);
    return;
  }

  removeBottomBar();
}

function notifyLocationChange(source = 'unknown') {
  lastBlacklistCheckHostname = '';
  lastBlacklistCheckResult = false;
  logDebug('location change notified', { source, url: window.location.href });
  window.dispatchEvent(new Event(GG_LOCATION_CHANGE_EVENT));
}

function readPageIdentity() {
  const headings = Array.from(document.querySelectorAll('h1'));
  for (const headingElement of headings) {
    const heading = headingElement.textContent?.trim();
    if (heading && !/^Cart\s*\(\d+\s+items?\)$/i.test(heading)) {
      return `h1:${heading}`;
    }
  }

  const documentTitle = document.title?.trim();
  if (documentTitle) {
    return `title:${documentTitle}`;
  }

  const canonicalUrl = document.querySelector('link[rel="canonical"]')?.href?.trim();
  return canonicalUrl ? `canonical:${canonicalUrl}` : '';
}

function hasPageIdentityChanged() {
  const currentIdentity = readPageIdentity();
  if (lastHandledPageIdentity.startsWith('h1:')) {
    return currentIdentity.startsWith('h1:') && currentIdentity !== lastHandledPageIdentity;
  }

  return currentIdentity !== lastHandledPageIdentity;
}

function readPageStateKey() {
  return resolveBottomBarPageStateKey(window.location.hostname);
}

function schedulePageStateSync(source = 'unknown') {
  if (pendingPageStateSyncTimer !== null) {
    window.clearTimeout(pendingPageStateSyncTimer);
  }

  pendingPageStateSyncTimer = window.setTimeout(() => {
    pendingPageStateSyncTimer = null;
    const currentPageStateKey = readPageStateKey();
    if (currentPageStateKey === lastHandledPageStateKey) {
      return;
    }

    const previousPageStateKey = lastHandledPageStateKey;
    lastHandledPageStateKey = currentPageStateKey;
    logDebug('page state changed', {
      source,
      previousPageStateKey,
      currentPageStateKey
    });
    void syncBottomBarForCurrentUrl(source);
  }, PAGE_STATE_SETTLE_MS);
}

function scheduleLocationSync(source = 'unknown') {
  const currentUrl = window.location.href;

  if (currentUrl === lastHandledUrl && currentUrl !== pendingLocationUrl) {
    logDebug('location change ignored (same url)', { currentUrl });
    return;
  }

  if (pendingLocationUrl !== currentUrl) {
    pendingLocationUrl = currentUrl;
    pendingLocationStartedAt = Date.now();
  }

  if (pendingLocationSyncTimer !== null) {
    window.clearTimeout(pendingLocationSyncTimer);
  }

  const elapsedMs = Date.now() - pendingLocationStartedAt;
  const remainingMaxWaitMs = Math.max(0, SPA_NAVIGATION_MAX_WAIT_MS - elapsedMs);
  const delayMs = Math.min(SPA_NAVIGATION_SETTLE_MS, remainingMaxWaitMs);

  pendingLocationSyncTimer = window.setTimeout(() => {
    const scheduledUrl = pendingLocationUrl;
    pendingLocationSyncTimer = null;

    if (window.location.href !== scheduledUrl) {
      pendingLocationUrl = '';
      pendingLocationStartedAt = 0;
      scheduleLocationSync('url-changed-before-scheduled-sync');
      return;
    }

    const identityChanged = hasPageIdentityChanged();
    const maxWaitReached = Date.now() - pendingLocationStartedAt >= SPA_NAVIGATION_MAX_WAIT_MS;
    if (!identityChanged && !maxWaitReached) {
      scheduleLocationSync('waiting-for-page-identity');
      return;
    }

    pendingLocationUrl = '';
    pendingLocationStartedAt = 0;
    lastHandledUrl = scheduledUrl;
    lastHandledPageIdentity = readPageIdentity();
    lastHandledPageStateKey = readPageStateKey();
    void syncBottomBarForCurrentUrl(source);
  }, delayMs);
}

function installMutationUrlWatcher() {
  if (mutationWatcherInstalled) {
    return;
  }
  mutationWatcherInstalled = true;

  const observerTarget = document.documentElement;
  if (!observerTarget) {
    logDebug('mutation watcher skipped (no documentElement)');
    return;
  }

  const observer = new MutationObserver(() => {
    const currentUrl = window.location.href;
    if (currentUrl !== lastHandledUrl || currentUrl === pendingLocationUrl) {
      if (currentUrl !== pendingLocationUrl) {
        logDebug('mutation detected url change', {
          previousUrl: lastHandledUrl,
          currentUrl
        });
      }
      scheduleLocationSync('mutation-observer');
      return;
    }

    if (readPageStateKey() !== lastHandledPageStateKey) {
      schedulePageStateSync('mutation-observer-page-state');
    }
  });

  observer.observe(observerTarget, {
    childList: true,
    subtree: true,
    attributes: true
  });

  logDebug('mutation watcher installed');
}

function installLocationHooks() {
  if (locationHooksInstalled) {
    return;
  }
  locationHooksInstalled = true;

  const originalPushState = history.pushState;
  history.pushState = function (...args) {
    const result = originalPushState.apply(this, args);
    notifyLocationChange('history.pushState');
    return result;
  };

  const originalReplaceState = history.replaceState;
  history.replaceState = function (...args) {
    const result = originalReplaceState.apply(this, args);
    notifyLocationChange('history.replaceState');
    return result;
  };

  window.addEventListener('popstate', () => notifyLocationChange('window.popstate'));
  window.addEventListener('hashchange', () => notifyLocationChange('window.hashchange'));
  window.addEventListener(GG_LOCATION_CHANGE_EVENT, () => {
    scheduleLocationSync('locationchange-event');
  });

  window.addEventListener('gg-extension:bartoggle', () => {
    lastHandledUrl = '';
    void syncBottomBarForCurrentUrl('bartoggle');
  });

  logDebug('location hooks installed');
}

function installLocationPoller() {
  if (locationPollId !== null) {
    return;
  }

  locationPollId = window.setInterval(() => {
    if (window.location.href !== lastHandledUrl && window.location.href !== pendingLocationUrl) {
      scheduleLocationSync('location-poller');
    }
  }, LOCATION_POLL_INTERVAL_MS);

  logDebug('location poller installed');
}

function installExcludedWebsitesSyncListener() {
  if (excludedWebsitesListenerInstalled || !browser.storage?.onChanged) {
    return;
  }

  excludedWebsitesListenerInstalled = true;
  browser.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== 'local' || !changes[EXCLUDED_WEBSITES_STORAGE_KEY]) {
      return;
    }

    lastBlacklistCheckHostname = '';
    lastBlacklistCheckResult = false;
    lastHandledUrl = '';

    void updateDebugBadgeForBlacklistedPagesOnly();
    void syncBottomBarForCurrentUrl('excluded-websites-change');
  });

  logDebug('excluded websites listener installed');
}

function startBottomBarLifecycle() {
  installLocationHooks();
  installMutationUrlWatcher();
  installLocationPoller();
  installExcludedWebsitesSyncListener();
  lastHandledUrl = window.location.href;
  lastHandledPageIdentity = readPageIdentity();
  lastHandledPageStateKey = readPageStateKey();
  logDebug('lifecycle started', { initialUrl: lastHandledUrl });
  void syncBottomBarForCurrentUrl('initial-load');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startBottomBarLifecycle, { once: true });
} else {
  startBottomBarLifecycle();
}
