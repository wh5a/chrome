function isBlack() {
  // OK, totally ruins these sites, even with the tiny image check
  var blacklist = [
                  ]
  var host = window.location.host;
  for (var i=0; i<blacklist.length; i++)
    if (blacklist[i].test(host))
      return true;
  return false;
}

function isTiny(img) {
  return img.height * img.width < 40 * 40;
}

function processImg(img) {
  // Don't expand tiny icons
  if (!isTiny(img) && img.title) {
    img.onmouseover = function() {
      // Restore the intended layout
      var imgParent=img.parentNode;
      var div = document.getElementById(img.src);
      img.title = div.textContent;
      imgParent.removeChild(div);
    };
    img.onmouseout = function() {
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

function docTitle() {
//  if (isBlack()) return;
  var imgs = document.images;
  for (var i=0; i<imgs.length; i++)
    processImg(imgs[i]);
}

function ajaxTitle(doc) {
//  if (isBlack()) return;
  if (!doc.getElementsByTagName) return;
  var imgs = doc.getElementsByTagName("img");
  for (var i=0; i<imgs.length; i++)
    // Do not process the image right away because its height and width are uninitialized.
    // Instead, do it on load.
    imgs[i].addEventListener('load', function(ev) {
      processImg(ev.target);
    });
}

document.body.addEventListener('DOMNodeInserted', function(ev) {
  ajaxTitle(ev.target);
});

docTitle();
