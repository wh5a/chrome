var nItems = 20; // Items in a page
var pageNo = 0;

function createLink(id, url) {
  var link = document.createElement('div');
  link.onclick = function(){showUrl(id);};
  link.title = url;
  return link;
}

function loadText()
{
  // Don't popup if there's nothing to show
  var n = localStorage["actualCount"];
  if (parseInt(n) == 0)
    window.close();

  var tabId, tabUrl, tabTime;
  
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
    tabTime = localStorage["ClosedTabTime-"+i];
    tabUrl = localStorage["TabList-"+tabId];
    if (tabUrl) {
      // Create a link node and the anchor encapsulating it.
      var text_link = createLink(tabId, tabUrl);
      
      var img = document.createElement('img');
      // On load, we don't try to pull the favicons.
      img.src = "";
      // Save the url in alt
      if (localStorage["TabFavicon-"+tabId])
        img.alt = localStorage["TabFavicon-"+tabId];
      else img.alt = "empty.png";
      img.width = 16;
      img.height = 16;
      text_link.appendChild(img);

      var textdiv = document.createElement('a');
      textdiv.innerHTML = " " + localStorage["TabTitle-"+tabId]; 
      text_link.appendChild(textdiv);
      var textdiv2 = document.createElement('span');
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

      if ( hoursDifference < 1 &&  minutesDifference < 1 &&secondsDifference < 60) timeTextz = '<b>'+ secondsDifference + ' sec</b>'; 
      else if (hoursDifference < 1 && minutesDifference < 10) timeTextz = '<b>'+ minutesDifference + ' min</b>'; 
      else if (hoursDifference < 1) timeTextz = '<b>'+ minutesDifference + ' min</b>'; 
      else if (hoursDifference < 4) timeTextz= '<b>' + hoursDifference + 'hr ' + minutesDifference + 'm</b>'; 
      else if (hoursDifference < 24) timeTextz='<b>' + hoursDifference + ' hr</b>'; 
      textdiv2.innerHTML=timeTextz;
      text_link.appendChild(textdiv2);
      
      content.appendChild(text_link);
      j++;
    }
  }

  if (pageNo > 0)
    document.getElementById("prev").style.visibility="visible";
  else document.getElementById("prev").style.visibility="hidden";
  if (localStorage["actualCount"] > (pageNo+1) * nItems)
    document.getElementById("next").style.visibility="visible";
  else document.getElementById("next").style.visibility="hidden";
}

function loadFavicon() {
  var imgs = document.images;
  for (i=0; i<imgs.length; i++)
    imgs[i].src = imgs[i].alt;
}

function loadContent() {
  loadText();
  // Delay this function a little bit in order not to halt the popup
  setTimeout(loadFavicon, 500);
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
  // Shallow clean: only forgets history about closed tabs
  for(i = localStorage["closeCount"]-1; i >= 0; i--)
  {
    tabId = localStorage["ClosedTab-"+i];
    delete localStorage["ClosedTab-"+i];
    delete localStorage["ClosedTabTime-"+i];
    clear(tabId);
  }

  initialize();

  pageNo = 0;
  window.close();
}
