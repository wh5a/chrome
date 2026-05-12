// Serialize all storage writes to prevent counter races on rapid tab events.
var _writeQueue = Promise.resolve();
function enqueueWrite(asyncFn) {
  _writeQueue = _writeQueue.then(asyncFn).catch((err) => {
    console.error('[unclose] storage write failed:', err);
  });
  return _writeQueue;
}

async function restoreTab(tabId) {
  await ensureInitialized();

  var state = await storageGet({
    actualCount: 0,
    ["TabList-" + tabId]: null,
    ["TabIndex-" + tabId]: null
  });
  var url = state["TabList-" + tabId];
  var index = parseInt(state["TabIndex-" + tabId], 10);
  if (!url)
    return false;

  var createProperties = {"url": url};
  if (!isNaN(index))
    createProperties.index = index;

  await chrome.tabs.create(createProperties);
  await clear(tabId);
  await storageSet({
    actualCount: Math.max((parseInt(state.actualCount, 10) || 0) - 1, 0)
  });
  await setBadgeText();
  return true;
}

chrome.tabs.onUpdated.addListener(async function(tabId, changeInfo, tab) {
  await enqueueWrite(async () => {
    await ensureInitialized();
    var tabKey = "TabList-" + tabId;
    var currentUrl = tab.url || await storageGet(tabKey);
    var updates = {};
    if (tab.url)
      updates[tabKey] = tab.url;
    updates["TabIndex-" + tabId] = tab.index;
    if (tab.favIconUrl)
      updates["TabFavicon-" + tabId] = tab.favIconUrl;
    if (tab.title != null)
      updates["TabTitle-" + tabId] = tab.title;
    else if (currentUrl)
      updates["TabTitle-" + tabId] = currentUrl;
    await storageSet(updates);
  });
});

chrome.tabs.onRemoved.addListener(async function(tabId, info) {
  await enqueueWrite(async () => {
    await ensureInitialized();
    // Should we record this tab?
    var tabKey = "TabList-" + tabId;
    var state = await storageGet({
      closeCount: 0,
      actualCount: 0,
      [tabKey]: null
    });
    var url = state[tabKey];
    var re = /^(http:|https:|ftp:|file:)/;
    if (url && re.test(url)) {
      var closeCount = parseInt(state.closeCount, 10) || 0;
      var actualCount = (parseInt(state.actualCount, 10) || 0) + 1;
      var updates = {
        closeCount: closeCount + 1,
        actualCount: actualCount
      };
      updates["ClosedTab-" + closeCount] = tabId;
      updates["ClosedTabTime-" + closeCount] = new Date().getTime();
      await storageSet(updates);
      await setBadgeText();
    }
    else
      await clear(tabId);
  });
});

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (!message || message.method !== "restoreTab")
    return false;

  enqueueWrite(async function() {
    return restoreTab(message.tabId);
  }).then(function(restored) {
    sendResponse({ok: restored});
  }).catch(function(error) {
    console.error('[unclose] restore failed:', error);
    sendResponse({ok: false});
  });

  return true;
});
