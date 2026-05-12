function getLegacyOption(key) {
  var value = localStorage.getItem(key);
  return value === null ? undefined : parseInt(value, 10);
}

chrome.runtime.onMessage.addListener(function(message, _, sendResponse) {
  if (!message || message.type !== "get-legacy-options") {
    return false;
  }

  sendResponse({
    create: getLegacyOption("create"),
    close: getLegacyOption("close")
  });
  return true;
});
