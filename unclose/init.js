var _initializationPromise = null;

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
  _initializationPromise = Promise.resolve();
  await setBadgeText();
}

async function ensureInitialized()
{
  if (_initializationPromise)
    return _initializationPromise;

  _initializationPromise = (async function() {
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
  })().catch(function(error) {
    _initializationPromise = null;
    throw error;
  });

  return _initializationPromise;
}

async function init()
{
  // Deep clean: clear storage otherwise we get old history from previous sessions
  await storageClear();
  _initializationPromise = null;
  await initialize();
}

chrome.runtime.onInstalled.addListener(async function(details) {
  if (details.reason === 'install') await init();
  else await ensureInitialized();
});

chrome.runtime.onStartup.addListener(async function() {
  // chrome.storage.session is cleared automatically on browser restart;
  // just reset the counters and badge.
  await initialize();
});
