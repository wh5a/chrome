async function clear(tabId) {
  return storageRemove(getTabKeys(tabId));
}
  
async function setBadgeText() {
  var n = parseInt(await storageGet("actualCount"), 10) || 0;
  if (n > 0)
      await chrome.action.setBadgeText({text: String(n)});
  else
    await chrome.action.setBadgeText({text:""});
}

async function initialize() {
  await storageSet({
    closeCount: 0,
    actualCount: 0
  });
  await setBadgeText();
}

async function ensureInitialized()
{
  var state = await storageGet({
    closeCount: null,
    actualCount: null
  });
  var updates = {};

  if (state.closeCount === null)
    updates.closeCount = 0;
  if (state.actualCount === null)
    updates.actualCount = 0;

  if (Object.keys(updates).length > 0)
    await storageSet(updates);

  await setBadgeText();
}

async function init()
{
  // Deep clean: clear storage otherwise we get old history from previous sessions
  await storageClear();
  await initialize();
}

chrome.runtime.onInstalled.addListener(function() {
  init();
});

chrome.runtime.onStartup.addListener(function() {
  init();
});
