var nItems = 20; // Items in a page
var pageNo = 0;

var defaultImgUrl = "http://getfavicon.appspot.com/default.gif";

function createLink(id, url) {
  var link = document.createElement('a');
  link.href = "javascript:showUrl("+ id + ")";
  link.title = url;
  return link;
}

function loadText()
{
  // Don't popup if there's nothing to show
  var n = localStorage["actualCount"];
  if (parseInt(n) == 0)
    window.close();
  
  content = document.getElementById("contentDiv");
  // Clear
  while (content.hasChildNodes())
    content.removeChild(content.firstChild);
  
  // Drop the first (pageNo*nItems) valid items
  for (j = 0, i = localStorage["closeCount"] - 1; i>=0 && j<pageNo*nItems; i--)
  {
    tabId = localStorage["ClosedTab-"+i];
    tabUrl = localStorage["TabList-"+tabId];
    if (tabUrl) j++;
  }

  for (j = 0; i>=0 && j<nItems; i --)
  {
    tabId = localStorage["ClosedTab-"+i];
    tabUrl = localStorage["TabList-"+tabId];
    if (tabUrl) {
      if (/^http/.test(tabUrl)) {
        var img = document.createElement('img');
        // On load, we don't try to pull the favicons.
        img.src = defaultImgUrl;
        // Save the url in alt
        img.alt = tabUrl;
        img.width = 16;
        img.height = 16;
        content.appendChild(img);
      }

      // Create a link node and the anchor encapsulating it.
      var text_link = createLink(tabId, tabUrl);
      text_link.appendChild(document.createTextNode(" " + localStorage["TabTitle-"+tabId]));
      content.appendChild(text_link);

      content.appendChild(document.createElement('hr'));
      j++;
    }
  }

  if (pageNo > 0)
    document.getElementById("prev").disabled = false;
  else document.getElementById("prev").disabled = true;
  if (localStorage["actualCount"] > (pageNo+1) * nItems)
    document.getElementById("next").disabled = false;
  else document.getElementById("next").disabled = true;
}

function loadFavicon() {
  var imgs = document.images;
  for (i=0; i<imgs.length; i++) {
    var img = imgs[i];
    // Send the whole url to a faster but less accurate service
    var domain = img.alt.match('https://[^/]*/');
    if (domain) console.log(domain[0]);
    if (domain)
      img.src = "http://getfavicon.appspot.com/" + domain[0];
    else
      img.src = "http://getfavicon.appspot.com/" + img.alt;
  }
  // After 5 seconds, we will resort to a slower but more accurate service
  // setTimeout(loadFavicon2,5000);
}

function loadFavicon2() {
  var imgs = document.images;
  for (i=0; i<imgs.length; i++) {
    var img = imgs[i];
    // Unfortunately, the url doesn't get updated for failed requests. So this check is only true for https pages.
    if (img.src == defaultImgUrl)
      img.src = "http://www.getfavicon.org/?url=" + img.alt.split('/')[2]; // This service only accepts domain names.
  }
}  

function loadContent() {
  loadText();
  // Delay this function a little bit in order not to halt the popup
  setTimeout(loadFavicon, 10);
}

function next() {
  if (localStorage["actualCount"] > (pageNo+1) * nItems)
    pageNo++;
  loadContent();
}

function prev() {
  if (pageNo > 0)
    pageNo--;
  loadContent();
}

// Show |url| in a new tab.
function showUrl(tabId) {
  var url = localStorage["TabList-"+tabId];
  var index = parseInt(localStorage["TabIndex-"+tabId]);
  chrome.tabs.create({"url": url, "index": index});
  clear(tabId);
  localStorage["actualCount"] --;
  setBadgeText();
  loadContent();
}

function reset()
{
  for(i = localStorage["closeCount"]-1; i >= 0; i--)
  {
    tabId = localStorage["ClosedTab-"+i];
    delete localStorage["ClosedTab-"+i];
    clear(tabId);
  }
  init();
  pageNo = 0;
  window.close();
}
