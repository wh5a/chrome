// Match links against supported file formats
var VIEWER_URL = 'http://docs.google.com/viewer?url=';
var pattern =
    new RegExp('^[^\\?#]+\\.(doc|docx|pdf|ppt|pps|tif|tiff)((#|\\?).*)?$', 'i');
var provideMenu = false;
var targetHref;
var inDomUpdate = false;

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
    this.href = VIEWER_URL + encodeURIComponent(href);
    provideMenu = true;
  }
};

function handleDomUpdate(e) {
  if (!inDomUpdate) {
    inDomUpdate = true;
    $('a', e.target).each(checkLink);
    inDomUpdate = false;
  }
}

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
    var item = $("<li class='gview-cmenu-item'>" +
        chrome.i18n.getMessage('open_in_new_tab') + "</li>");
    item.click(function (e) {
      window.open(VIEWER_URL + encodeURIComponent(targetHref));
      menu.blur();
    });
    menu.append(item);
    // Add download option
    var item = $("<li class='gview-cmenu-item'>" +
        chrome.i18n.getMessage('download') + "</li>");
    item.click(function (e) {
      window.location.href = targetHref;
      menu.blur();
    });
    menu.append(item);
    // Add open as Doc option
/*
    item = $("<li class='gview-cmenu-item'>" +
        chrome.i18n.getMessage('save_in_docs') + "</li>");
    item.click(function (e) {
        window.open(VIEWER_URL + encodeURIComponent(targetHref) + '&a=sv');
      });
*/
    menu.append(item);
    $(document.body).append(menu);

    // Inject menu CSS
    var style = $('<style type="text/css"></style>');
    style.get(0).innerText =
        '#gview-cmenu {' +
        '  position: absolute;' +
        '  border: 1px solid #ccc;' +
        '  background: #fff;' +
        '  margin: 0;' +
        '  padding: 0;' +
        '  top: 0;' +
        '  left: 0;' +
        '  z-index: 10000;' +
        '  list-style-type: none;' +
        '  -webkit-box-shadow: 0 3px 5px rgba(0, 0, 0, .5);' +
        '}' +

        '#gview-cmenu:focus {' +
        '  outline: none;' +
        '}' +

        '.gview-cmenu-item {' +
        '  margin: 0;' +
        '  padding: 5px 7px;' +
        '  cursor: default;' +
        '  font-size: 13px;' +
        '  font-family: arial, san-serif;' +
        '  color: #000;' +
        '  -webkit-user-select: none;' +
        '}' +

        '.gview-cmenu-item:hover {' +
        '  background-color: #F0F7F9;' +
        '}' +

        '.gview-cmenu-item:first-child {' +
        '  border-bottom: 1px solid #ddd;' +
        '}' +

        '.gview-hidden {' +
        '  display: none;' +
        '}';
    $(document.head).prepend(style);
  }

  // Look for dom changes
  $(document.body).bind("DOMNodeInserted", handleDomUpdate);
}
