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

var cachedTabs;

function cloneTabInfo(a) {
  /*
  console.log("Update cache from old to new:");
  console.log(cachedTabs);
  console.log(a);
  */
  cachedTabs = new Array();
  for (var tab in a) {
    cachedTabs[tab] = new Object();
    cachedTabs[tab].id = a[tab].id;
    cachedTabs[tab].selected = a[tab].selected;
  }
}

function updateCachedTabs(){
  chrome.tabs.getAllInWindow(null, function(tabs) {
    cloneTabInfo(tabs);
  });
}

function findIndex(p) {
  for (var i in cachedTabs)
    if (p(cachedTabs[i]))
      return parseInt(i);
  return null;
}

function restore_options() {
  var pos = localStorage["create"];
  if (!pos) localStorage["create"] = 0;
  pos = localStorage["close"];
  if (!pos) localStorage["close"] = 0;
}

chrome.tabs.onCreated.addListener(function(tab) {
  //console.log("New tab created.");
  var create = localStorage["create"];
  var myIndex = tab.index;
  var selIndex = findIndex(function(x) { return x.selected; });
  if (create == 2 || selIndex == null) { // Do nothing?
    updateCachedTabs();
    return;
  }
  if (create == 0) { // Smart move?
    chrome.tabs.getAllInWindow(null, function(tabs) {
      var maxIndex = tabs.length - 1;
      if (myIndex == maxIndex)
        chrome.tabs.move(tab.id, {
          index: selIndex + 1
        }, updateCachedTabs);
      else // Don't forget to update the cache!!
        updateCachedTabs();
    });    
  }
  else // Always move?
    chrome.tabs.move(tab.id, {
      index: selIndex + 1
    }, updateCachedTabs);
});

chrome.tabs.onRemoved.addListener(function(tabId) {
  chrome.tabs.getAllInWindow(null, function(tabs) {
    /*
    console.log("Deleting a tab, the cached tabs are.");
    console.log(cachedTabs);
    console.log("The current tabs are.");
    console.log(tabs);
    console.log("The deleted tab is.");
    console.log(tabId);
    */
    var close = localStorage["close"];
    if (close > 0) {
      var closedIndex = findIndex(function(x) {return (x.id == tabId);});
      if (closedIndex == null) { // Shouldn't happen!
        console.error(tabId);
        console.error(tabs);
        console.error(cachedTabs);
      }
      // Change focus to the left or right only if the tab being closed was focused, and the window had >1 tabs
      else if (cachedTabs[closedIndex].selected && cachedTabs.length>1) {
        var nextIndex = closedIndex; // Select right
        if (close == 1 && nextIndex > 0) // Select left
          nextIndex -= 1;
        if (nextIndex > cachedTabs.length - 1) nextIndex = cachedTabs.length - 1;
        chrome.tabs.update(cachedTabs[nextIndex].id, {
          selected: true
        }, updateCachedTabs);
      }
    }
    cloneTabInfo(tabs);
  });
});

chrome.tabs.onSelectionChanged.addListener(function(tabId, _) {
  chrome.tabs.getAllInWindow(null, function(tabs) {
    // Don't update selection if a tab is being closed, and this function gets called before onRemoved
    /*
    console.log("Selection changed: current tabs and cached tabs");
    console.log(tabs);
    console.log(cachedTabs);
    */
    if (cachedTabs.length <= tabs.length) {
      for (var tab in cachedTabs) {
        if (cachedTabs[tab].id == tabId)
          cachedTabs[tab].selected = true;
        else
          cachedTabs[tab].selected = false;
      }
    }
  });
});

chrome.tabs.onMoved.addListener(function(_, _) {
  updateCachedTabs();
});

chrome.tabs.onAttached.addListener(function(_, _) {
  updateCachedTabs();
});

chrome.windows.onFocusChanged.addListener(function(_) {
  updateCachedTabs();
});

chrome.runtime.onStartup.addListener(function() {
  restore_options();
});
