function getTabKeys(tabId) {
  return [
    "TabList-" + tabId,
    "TabIndex-" + tabId,
    "TabTitle-" + tabId,
    "TabFavicon-" + tabId
  ];
}

async function storageGet(keyOrKeys) {
  var data = await chrome.storage.session.get(keyOrKeys);
  if (typeof keyOrKeys == "string")
    return data[keyOrKeys];
  return data;
}

async function storageGetAll() {
  return chrome.storage.session.get(null);
}

async function storageSet(items) {
  return chrome.storage.session.set(items);
}

async function storageRemove(keys) {
  return chrome.storage.session.remove(keys);
}

async function storageClear() {
  return chrome.storage.session.clear();
}
