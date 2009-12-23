function getClosed()
{		
  var returnString = "<html><body>";
//  var notFirst = false;
  for(i = localStorage["closeCount"]-1; i >= 0; i --)
  {
    tabId = localStorage["ClosedTab-"+i];
    tabUrl = localStorage["TabList-"+tabId];
    if (tabUrl) {
      stringForThisUrl = "<a href = \""+ tabUrl + "\" title = \""+ tabUrl + "\" onclick=\"showUrl("+tabId+")\"/>" + localStorage["TabTitle-"+tabId] + "</a><hr>";
      returnString += stringForThisUrl;
      //notFirst = true;
    }
  }
  
  returnString += "</body></HTML>"	

  return returnString;
}

// Show |url| in a new tab.
function showUrl(tabId) {
  var url = localStorage["TabList-"+tabId];
  var index = parseInt(localStorage["TabIndex-"+tabId]);
  chrome.tabs.create({"url": url, "index": index});
  clear(tabId);
  localStorage["actualCount"] --;
  setBadgeText();
}

function reset()
{
  for(i = localStorage["closeCount"]-1; i >= 0; i --)
  {
    tabId = localStorage["ClosedTab-"+i];
    delete localStorage["ClosedTab-"+i];
    clear(tabId);
  }
  /*
  Deep clean:
  for (x in localStorage)
    delete localStorage[x];
  */
  init();
}
