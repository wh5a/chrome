var nItems = 20; // Items in a page
var pageNo = 0;

function createLink(id, url) {
  var link = document.createElement('div');
  link.onclick = function(){showUrl(id);};
  link.title = url;
  return link;
}

function appendTime(parent, label)
{
  if (!label)
    return;

  var textdiv = document.createElement('span');
  var bold = document.createElement('b');
  bold.textContent = label;
  textdiv.appendChild(bold);
  parent.appendChild(textdiv);
}

async function loadText()
{
  await ensureInitialized();

  var state = await storageGetAll();
  var n = parseInt(state.actualCount, 10) || 0;
  if (n == 0) {
    window.close();
    return;
  }

  while (pageNo > 0 && n <= pageNo * nItems)
    pageNo--;

  var tabId, tabUrl, tabTime;
  var content = document.getElementById("contentDiv");
  // Clear
  while (content.hasChildNodes())
    content.removeChild(content.firstChild);
  
  // Drop the first (pageNo*nItems) valid items
  for (var j = 0, i = (parseInt(state.closeCount, 10) || 0) - 1; i>=0 && j<pageNo*nItems; i--)
  {
    tabId = state["ClosedTab-"+i];
    tabUrl = state["TabList-"+tabId];
    if (tabUrl) j++;
  }

  for (j = 0; i>=0 && j<nItems; i --)
  {
    tabId = state["ClosedTab-"+i];
    tabTime = state["ClosedTabTime-"+i];
    tabUrl = state["TabList-"+tabId];
    if (tabUrl) {
      // Create a link node and the anchor encapsulating it.
      var text_link = createLink(tabId, tabUrl);
      
      var img = document.createElement('img');
      // On load, we don't try to pull the favicons.
      img.src = "";
      // Save the url in alt
      if (state["TabFavicon-"+tabId])
        img.alt = state["TabFavicon-"+tabId];
      else img.alt = "empty.png";
      img.width = 16;
      img.height = 16;
      text_link.appendChild(img);

      var textdiv = document.createElement('a');
      textdiv.textContent = " " + (state["TabTitle-"+tabId] || tabUrl);
      text_link.appendChild(textdiv);
      var timeTextz='';
      
      var nowtime = new Date();
      var milliseconds2 = nowtime.getTime(); 
      var difference = milliseconds2 - tabTime; 
      var hoursDifference = Math.floor(difference/1000/60/60); 
      difference = difference - hoursDifference*1000*60*60 
      var minutesDifference = Math.floor(difference/1000/60); 
      difference = difference - minutesDifference*1000*60 
      var secondsDifference = Math.floor(difference/1000); 
      // This next line below looks for entries over a day old 

      if ( hoursDifference < 1 &&  minutesDifference < 1 && secondsDifference < 60) timeTextz = secondsDifference + ' sec'; 
      else if (hoursDifference < 1 && minutesDifference < 10) timeTextz = minutesDifference + ' min'; 
      else if (hoursDifference < 1) timeTextz = minutesDifference + ' min'; 
      else if (hoursDifference < 4) timeTextz = hoursDifference + 'hr ' + minutesDifference + 'm'; 
      else if (hoursDifference < 24) timeTextz = hoursDifference + ' hr'; 
      if (timeTextz)
        appendTime(text_link, timeTextz);
      
      content.appendChild(text_link);
      j++;
    }
  }

  if (pageNo > 0)
    document.getElementById("prev").style.visibility="visible";
  else document.getElementById("prev").style.visibility="hidden";
  if (n > (pageNo+1) * nItems)
    document.getElementById("next").style.visibility="visible";
  else document.getElementById("next").style.visibility="hidden";
}

function loadFavicon() {
  var imgs = document.images;
  for (i=0; i<imgs.length; i++)
    imgs[i].src = imgs[i].alt;
}

async function loadContent() {
  await loadText();
  // Delay this function a little bit in order not to halt the popup
  setTimeout(loadFavicon, 500);
}

async function next() {
  if ((parseInt(await storageGet("actualCount"), 10) || 0) > (pageNo+1) * nItems)
    pageNo++;
  loadContent();
}

function prev() {
  if (pageNo > 0)
    pageNo--;
  loadContent();
}

// Show |url| in a new tab.
async function showUrl(tabId) {
  var state = await storageGet({
    actualCount: 0,
    ["TabList-" + tabId]: null,
    ["TabIndex-" + tabId]: null
  });
  var url = state["TabList-" + tabId];
  var index = parseInt(state["TabIndex-" + tabId], 10);
  if (!url)
    return;

  var createProperties = {"url": url};
  if (!isNaN(index))
    createProperties.index = index;

  await chrome.tabs.create(createProperties);
  await clear(tabId);
  await storageSet({
    actualCount: Math.max((parseInt(state.actualCount, 10) || 0) - 1, 0)
  });
  await setBadgeText();
  await loadContent();
}

async function reset()
{
  // Shallow clean: only forgets history about closed tabs
  var state = await storageGetAll();
  var keys = [];

  for(var i = (parseInt(state.closeCount, 10) || 0) - 1; i >= 0; i--)
  {
    var tabId = state["ClosedTab-"+i];
    keys.push("ClosedTab-"+i, "ClosedTabTime-"+i);
    if (tabId != null)
      keys = keys.concat(getTabKeys(tabId));
  }

  await storageRemove(keys);
  await initialize();

  pageNo = 0;
  window.close();
}

document.addEventListener("DOMContentLoaded", function() {
  document.body.addEventListener("selectstart", function(event) {
    event.preventDefault();
  });
  document.getElementById("prev").addEventListener("click", prev);
  document.getElementById("next").addEventListener("click", next);
  document.getElementById("clear").addEventListener("click", reset);
  loadContent();
});
