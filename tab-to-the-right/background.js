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

var DEFAULT_OPTIONS = {
  create: 0,
  close: 0
};

function logError(error) {
  console.error(error);
}

function getCacheKey(windowId) {
  return "cachedTabs:" + windowId;
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

  if (Object.keys(groupedTabs).length > 0) {
    await chrome.storage.session.set(groupedTabs);
  }
}

async function ensureOptions() {
  var options = await chrome.storage.local.get(DEFAULT_OPTIONS);
  var updates = {};

  if (options.create === undefined) {
    updates.create = DEFAULT_OPTIONS.create;
  }

  if (options.close === undefined) {
    updates.close = DEFAULT_OPTIONS.close;
  }

  if (Object.keys(updates).length > 0) {
    await chrome.storage.local.set(updates);
  }
}

async function getOptions() {
  var options = await chrome.storage.local.get(DEFAULT_OPTIONS);
  return {
    create: parseInt(options.create, 10),
    close: parseInt(options.close, 10)
  };
}

chrome.tabs.onCreated.addListener(function(tab) {
  (async function() {
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
    var tabs = await getTabs(activeInfo.windowId);
    var cachedTabs = await getCachedTabs(activeInfo.windowId);

    if (cachedTabs.length <= tabs.length) {
      await setCachedTabs(activeInfo.windowId, tabs);
    }
  })().catch(logError);
});

chrome.tabs.onMoved.addListener(function(_, moveInfo) {
  updateCachedTabs(moveInfo.windowId).catch(logError);
});

chrome.tabs.onAttached.addListener(function(_, attachInfo) {
  updateCachedTabs(attachInfo.newWindowId).catch(logError);
});

chrome.tabs.onDetached.addListener(function(_, detachInfo) {
  updateCachedTabs(detachInfo.oldWindowId).catch(logError);
});

chrome.windows.onFocusChanged.addListener(function(windowId) {
  updateCachedTabs(windowId).catch(logError);
});

chrome.runtime.onInstalled.addListener(function() {
  (async function() {
    await ensureOptions();
    await updateAllCachedTabs();
  })().catch(logError);
});

chrome.runtime.onStartup.addListener(function() {
  (async function() {
    await ensureOptions();
    await updateAllCachedTabs();
  })().catch(logError);
});

(async function() {
  await ensureOptions();
  await updateAllCachedTabs();
})().catch(logError);
