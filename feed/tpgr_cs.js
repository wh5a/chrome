function isFeed(){
  // Unfortunately we don't get to see 'view-source:' part.
  //if (/^view-source:/.test(location.href))
  //  return false;
  
  // Imprecise detection
  var feedTags=["rss","feed"];
  for(var i in feedTags){
    var elm=document.getElementsByTagName(feedTags[i])[0];
    if(elm&&(!elm.parentElement||elm.parentElement.tagName.toLowerCase()=="body"))
      return true;
  }
  
  // Now try to parse the page
  var req = new XMLHttpRequest();
  var isF;
  req.onload = function () {
    if (req.responseXML) isF = true;
    else isF = false;
  }
  req.onerror = function () {isF = false;}
  req.open("GET", location.href, false);
  req.send();
  return isF;
}

if(isFeed())
  chrome.extension.sendRequest({msg:"feedView", url:location.href});
