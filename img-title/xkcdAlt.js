function isBlack() {
  // OK, totally ruins these sites
  var blacklist = [ /stackoverflow.com/,
                    /serverfault.com/,
                    /superuser.com/,
                    /doctype.com/,
                    /code.google.com/
                  ]
  var host = window.location.host;
  for (var i=0; i<blacklist.length; i++)
    if (blacklist[i].test(host))
      return true;
  return false;
}

function isTiny(img) {
  // Ajax images seem to all return 0x0
  var area = img.height * img.width;
  return (area > 0 && area < 40*40);
}

function addTitle(doc) {
  // if (isBlack()) return;
  if (!doc.getElementsByTagName) return;
  var imgs = doc.getElementsByTagName("img");
  for (var i=0; i<imgs.length; i++) {
    var img = imgs[i];
    // Don't expand tiny icons
    if (isTiny(img)) return;
    if (img.title) {
      img.onmouseover = function(ev) {
        // Restore the intended layout
        var img = ev.target;
        var imgParent=img.parentNode;
        var div = document.getElementById(img.src);
        img.title = div.textContent;
        imgParent.removeChild(div);
      };
      img.onmouseout = function(ev) {
        if (ev)
          img = ev.target;
        var imgParent=img.parentNode;
        var afterImg=img.nextSibling;
        var newNode=document.createElement("div");
        newNode.appendChild(document.createElement("br"));
        newNode.appendChild(document.createTextNode(img.title));
        newNode.setAttribute("style","font-weight:bold" /* "color: red" */);
        newNode.setAttribute("id",img.src);
        imgParent.insertBefore(newNode,afterImg);
        img.removeAttribute("title");
      };
      img.onmouseout();
    }
  }
}

document.body.addEventListener('DOMNodeInserted', function(ev) {
  addTitle(ev.target);
});

addTitle(document);
