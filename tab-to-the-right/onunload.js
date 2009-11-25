window.addEventListener('unload',function (_) {
  chrome.extension.sendRequest({"func":"updateCachedTabs"});
},false)
