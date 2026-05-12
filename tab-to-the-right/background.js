importScripts("defaults.js");

/*
  After some experiments, I make the following (potentially wrong) observations:
  
  All callbacks are called asynchronously in a random order.

  The unload listener in the content script, therefore, is not
  guaranteed to execute before the onRemoved listener on the tab.
  Even if it's called first, the tabs we get will already have the
  closed tab removed.

  To work around being unable to intercept before a tab is closed, we
  have to maintain a local cache every time tabs change, just as we do
  with selIndex.
*/

function logError(error) {
  console.error(error);
}

var OFFSCREEN_DOCUMENT_PATH = "offscreen.html";
var CACHE_KEY_PREFIX = "cachedTabs:";

function getCacheKey(windowId) {
  return CACHE_KEY_PREFIX + windowId;
}

function cloneTabInfo(tabs) {
  return tabs.map(function(tab) {
    return {
      id: tab.id,
      active: tab.active
    };
  });
}

async function setCachedTabs(windowId, tabs) {
  var values = {};
  values[getCacheKey(windowId)] = cloneTabInfo(tabs);
  await chrome.storage.session.set(values);
}

async function getCachedTabs(windowId) {
  var key = getCacheKey(windowId);
  var values = await chrome.storage.session.get(key);
  return values[key] || [];
}

async function getTabs(windowId) {
  return chrome.tabs.query({windowId: windowId});
}

async function updateCachedTabs(windowId) {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    return [];
  }
  var tabs = await getTabs(windowId);
  await setCachedTabs(windowId, tabs);
  return tabs;
}

async function updateAllCachedTabs() {
  var tabs = await chrome.tabs.query({});
  var groupedTabs = {};
  var storedValues = await chrome.storage.session.get(null);

  tabs.forEach(function(tab) {
    var key = getCacheKey(tab.windowId);
    if (!groupedTabs[key]) {
      groupedTabs[key] = [];
    }
    groupedTabs[key].push({
      id: tab.id,
      active: tab.active
    });
  });

  var staleKeys = Object.keys(storedValues).filter(function(key) {
    return key.indexOf(CACHE_KEY_PREFIX) === 0 &&
        !Object.prototype.hasOwnProperty.call(groupedTabs, key);
  });

  if (staleKeys.length > 0) {
    await chrome.storage.session.remove(staleKeys);
  }

  if (Object.keys(groupedTabs).length > 0) {
    await chrome.storage.session.set(groupedTabs);
  }
}

async function ensureOptions() {
  var storedOptions = await chrome.storage.local.get(["create", "close"]);
  var updates = {};

  if (storedOptions.create === undefined) {
    updates.create = DEFAULT_OPTIONS.create;
  }

  if (storedOptions.close === undefined) {
    updates.close = DEFAULT_OPTIONS.close;
  }

  if (Object.keys(updates).length > 0) {
    await chrome.storage.local.set(updates);
  }
}

async function getOptions() {
  var options = await chrome.storage.local.get(["create", "close"]);
  return {
    create: options.create === undefined ?
        DEFAULT_OPTIONS.create : parseInt(options.create, 10),
    close: options.close === undefined ?
        DEFAULT_OPTIONS.close : parseInt(options.close, 10)
  };
}

async function hasOffscreenDocument() {
  var contexts = await chrome.runtime.getContexts({
    contextTypes: ["OFFSCREEN_DOCUMENT"],
    documentUrls: [chrome.runtime.getURL(OFFSCREEN_DOCUMENT_PATH)]
  });
  return contexts.length > 0;
}

async function withOffscreenDocument(action) {
  var created = false;

  if (!await hasOffscreenDocument()) {
    await chrome.offscreen.createDocument({
      url: OFFSCREEN_DOCUMENT_PATH,
      reasons: ["LOCAL_STORAGE"],
      justification: "Migrate legacy MV2 localStorage options to chrome.storage.local"
    });
    created = true;
  }

  try {
    return await action();
  } finally {
    if (created) {
      await chrome.offscreen.closeDocument();
    }
  }
}

async function migrateLegacyOptions() {
  var legacyOptions = await withOffscreenDocument(function() {
    return chrome.runtime.sendMessage({type: "get-legacy-options"});
  });
  var storedOptions = await chrome.storage.local.get(["create", "close"]);
  var updates = {};

  if (storedOptions.create === undefined &&
      legacyOptions.create !== undefined &&
      !Number.isNaN(legacyOptions.create)) {
    updates.create = legacyOptions.create;
  }

  if (storedOptions.close === undefined &&
      legacyOptions.close !== undefined &&
      !Number.isNaN(legacyOptions.close)) {
    updates.close = legacyOptions.close;
  }

  if (Object.keys(updates).length > 0) {
    await chrome.storage.local.set(updates);
  }
}

async function initializeExtension() {
  await migrateLegacyOptions();
  await ensureOptions();
  await updateAllCachedTabs();
}

var ready = initializeExtension();

chrome.tabs.onCreated.addListener(function(tab) {
  (async function() {
    await ready;
    var options = await getOptions();
    var cachedTabs = await getCachedTabs(tab.windowId);
    var selIndex = cachedTabs.findIndex(function(cachedTab) {
      return cachedTab.active;
    });

    if (options.create === 2 || selIndex === -1) {
      await updateCachedTabs(tab.windowId);
      return;
    }

    if (options.create === 0) {
      var tabs = await getTabs(tab.windowId);
      if (tab.index === tabs.length - 1) {
        await chrome.tabs.move(tab.id, {
          index: selIndex + 1
        });
      }
    } else {
      await chrome.tabs.move(tab.id, {
        index: selIndex + 1
      });
    }

    await updateCachedTabs(tab.windowId);
  })().catch(logError);
});

chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
  (async function() {
    await ready;
    if (removeInfo.isWindowClosing) {
      return;
    }

    var tabs = await getTabs(removeInfo.windowId);
    var cachedTabs = await getCachedTabs(removeInfo.windowId);
    var options = await getOptions();

    if (options.close > 0) {
      var closedIndex = cachedTabs.findIndex(function(tab) {
        return tab.id === tabId;
      });

      if (closedIndex !== -1 && cachedTabs[closedIndex].active && tabs.length > 0) {
        var nextIndex = closedIndex;
        if (options.close === 1 && nextIndex > 0) {
          nextIndex -= 1;
        }
        if (nextIndex > tabs.length - 1) {
          nextIndex = tabs.length - 1;
        }
        await chrome.tabs.update(tabs[nextIndex].id, {
          active: true
        });
      }
    }

    await setCachedTabs(removeInfo.windowId, tabs);
  })().catch(logError);
});

chrome.tabs.onActivated.addListener(function(activeInfo) {
  (async function() {
    await ready;
    var tabs = await getTabs(activeInfo.windowId);
    var cachedTabs = await getCachedTabs(activeInfo.windowId);

    if (cachedTabs.length <= tabs.length) {
      await setCachedTabs(activeInfo.windowId, tabs);
    }
  })().catch(logError);
});

chrome.tabs.onMoved.addListener(function(_, moveInfo) {
  ready.then(function() {
    return updateCachedTabs(moveInfo.windowId);
  }).catch(logError);
});

chrome.tabs.onAttached.addListener(function(_, attachInfo) {
  ready.then(function() {
    return updateCachedTabs(attachInfo.newWindowId);
  }).catch(logError);
});

chrome.tabs.onDetached.addListener(function(_, detachInfo) {
  ready.then(function() {
    return updateCachedTabs(detachInfo.oldWindowId);
  }).catch(logError);
});

chrome.windows.onFocusChanged.addListener(function(windowId) {
  ready.then(function() {
    return updateCachedTabs(windowId);
  }).catch(logError);
});
