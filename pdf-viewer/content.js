// Match links against PDF, PPT, PPS, and TIF files
var VIEWER_URL = 'http://docs.google.com/viewer?url=';
var pattern = new RegExp('^[^\\?#]+\\.(pdf|ppt|pps|tif)((#|\\?).*)?$', 'i');
var provideMenu = false;
var targetHref;

/**
 * Checks a link to see if it points to a potential gview supported file.
 * If so, rewrites the link to point to the Docs Viewer.
 */
function checkLink() {
  var href = this.href;
  if (pattern.test(href)) {
    // Show context menu on right click
    $(this).bind('contextmenu', function(e) {
        targetHref = href;
        $('#gview-cmenu').removeClass('gview-hidden').css(
	  {'left':e.pageX, 'top':e.pageY})[0].focus();
        return false;
      });
    // Rewrite link
    this.href = VIEWER_URL + encodeURI(href);
    provideMenu = true;
  }
};

// Ignore checks on docs viewer domain
if (!/^https?:\/\/docs.google.com\/viewer/.test(window.location.href)) {
  // Check all the links in the page
  $('a').each(checkLink);
  // Create context menu
  if (provideMenu) {
    var menu = $("<ul id='gview-cmenu' class='gview-hidden' tabindex='9999'/>");
    // Hide menu on blur
    menu.blur(function (e) {
        $(this).addClass('gview-hidden');
      });
    // Add open in new tab option
    var item = $("<li class='gview-cmenu-item'>Open Link in New Tab</li>");
    item.click(function (e) { window.open(VIEWER_URL + encodeURI(targetHref)); });
    menu.append(item);
    // Add download option
    var item = $("<li class='gview-cmenu-item'>Download</li>");
    item.click(function (e) { window.location.href = targetHref; });
    menu.append(item);
    // Add open as Doc option
/*
    item = $("<li class='gview-cmenu-item'>Save in Google Docs</li>");
    item.click(function (e) {
        window.open(VIEWER_URL + encodeURI(targetHref) + '&a=sv');
      });
*/
    item = $("<li class='gview-cmenu-item'>Extension home</li>");
    item.click(function (e) {
        window.open("https://chrome.google.com/extensions/detail/nnbmlagghjjcbdhgmkedmbmedengocbn");
      });
    menu.append(item);
    $(document.body).append(menu);
  }
}
