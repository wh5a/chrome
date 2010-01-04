function isFeed(doc, stop){
  // Unfortunately we don't get to see 'view-source:' part.
  //if (/^view-source:/.test(location.href))
  //  return false;
  
  // False negatives when the server gives us an xml as html
  var feedTags=["rss","feed"];
  for(var i in feedTags){
    var elm=doc.getElementsByTagName(feedTags[i])[0];
    if(elm&&(!elm.parentElement||elm.parentElement.tagName.toLowerCase()=="body"))
      return true;
  }
  
  /* False positives when the html does parse as xml
     Test case: http://intertwingly.net/blog/2008/01/22/Best-Standards-Support#c1201006277
                http://scr.im/1yu1
  */
  /*
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
  */

  // Explicitly specified as HTML, or infinite recursion entered
  if (doc.doctype || stop) return false;

  // Try to find feeds in HTML text
  // Test case: http://x264dev.multimedia.cx/?feed=atom
  var parser = new DOMParser();
  var docB = parser.parseFromString(doc.documentElement.innerText, "text/xml");
  return isFeed(docB, true);
}

if(isFeed(document))
  chrome.extension.sendRequest({msg:"feedView", url:location.href});
