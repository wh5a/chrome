/*
 * taken from http://userscripts.org/scripts/show/24955
 */
function simulateClick(node) {
//  console.log(node);
  var event = node.ownerDocument.createEvent("MouseEvents");
  event.initMouseEvent("click",
                      true, true, window, 1, 0, 0, 0, 0,
                      false, false, false, false, 0, null);
  node.dispatchEvent(event);
}

function simulateKeyPress(node, keyCode) {
  var e = node.ownerDocument.createEvent("KeyboardEvent");
  e.initKeyboardEvent('keypress', true, true, window, false, false, false, false, 78, 0x4E);
  node.dispatchEvent(e);
}

document.onkeydown = function(e){
  var name = e.target.tagName;
  // Do nothing if the target of this event is an edit box
  if (name == "TEXTAREA" || name == "INPUT")
    return;
  if (e.keyCode==86 && e.shiftKey){ // 'V'
    // Get the current entry node
    current_entry = document.getElementById('current-entry')
    // open the link in background
    /* Not working in Expanded mode
    url = current_entry.getElementsByClassName('entry-original')[0].href;
    */
    url = current_entry.getElementsByClassName('entry-title-link')[0].href;
    chrome.extension.sendRequest({"func":"open_in_background", "url":url});
    // mark the entry as read
    simulateClick(current_entry.childNodes[0]);
    simulateClick(current_entry.childNodes[0]);

    // make sure the event doesn't propate
    e.stopPropagation();
    e.preventDefault();
  }
}
