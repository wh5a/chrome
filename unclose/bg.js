// Replace HTML tags < >
function quote(s) {
  var s1 = s.replace("<", "&lt;");
  var s2 = s1.replace(">", "&gt;");
  return s2;
}

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
//  chrome.browserAction.setBadgeText({text:localStorage["closeCount"] + ""});
  localStorage["TabList-"+tabId] = tab.url;
  localStorage["TabIndex-"+tabId] = tab.index;
  if(tab.title != null)
    localStorage["TabTitle-"+tabId] = quote(tab.title);
  else
    localStorage["TabTitle-"+tabId] = tab.url;
});

chrome.tabs.onRemoved.addListener(function(tabId, info)  {
  // Should we record this tab?
  var url = localStorage["TabList-"+tabId];
  var re = /^(http:|https:|ftp:|file:)/;
  if (url && re.test(url)) {
    localStorage["ClosedTab-"+localStorage["closeCount"]] = tabId;
    localStorage["closeCount"] ++;
    localStorage["actualCount"] ++;
    setBadgeText();
  }
  else clear(tabId);
});
