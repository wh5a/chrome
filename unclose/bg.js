chrome.tabs.onUpdated.addListener(async function(tabId, changeInfo, tab) {
  await ensureInitialized();
  var updates = {};
  if (tab.url)
    updates["TabList-" + tabId] = tab.url;
  updates["TabIndex-" + tabId] = tab.index;
  if (tab.favIconUrl)
    updates["TabFavicon-" + tabId] = tab.favIconUrl;
  if(tab.title != null)
    updates["TabTitle-" + tabId] = tab.title;
  else if (tab.url)
    updates["TabTitle-" + tabId] = tab.url;
  await storageSet(updates);
});

chrome.tabs.onRemoved.addListener(async function(tabId, info)  {
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
