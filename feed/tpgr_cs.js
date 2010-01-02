function isFeed(){
  var feedTags=["rss","feed"];
  for(var i in feedTags){
    var elm=document.getElementsByTagName(feedTags[i])[0];
    if(elm&&(!elm.parentElement||elm.parentElement.tagName.toLowerCase()=="body"))
      return true;
  }
  return false;
}

if(isFeed())
  chrome.extension.sendRequest({msg:"feedView", url:location.href});
