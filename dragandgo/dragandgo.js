function dragOver (e) {
  if (start_x == -1 || start_y == -1) {
    // The dragover event is from external, keep original action.
    return true;
  }
  if (e.preventDefault) {
    e.preventDefault ();
  }
  return false;
}

function dragStart(e) {
  start_x = e.screenX;
  start_y = e.screenY;
}
start_x = -1;
start_y = -1;
document.addEventListener('dragstart', dragStart, false);
document.addEventListener('dragover', dragOver, false);
document.addEventListener('drop', function (e) {
  if (start_x == -1 || start_y == -1) {
    // The drop event is from external, keep original action.
    return true;
  }
  var x_dir = 1;
  if (e.preventDefault) {
    e.preventDefault ();
  }
  if (e.screenX < start_x) {
    x_dir = -1;
  }
  var y_dir = 1;
  if (e.screenY < start_y) {
    y_dir = -1;
  }
  start_x = -1;
  start_y = -1;
  var data = e.dataTransfer.getData('URL');
  if (!data) {
    data = e.dataTransfer.getData('Text');
  }
  if (data) {
    chrome.extension.connect().postMessage({
      message: 'tab', values: data, x_dir: x_dir, y_dir: y_dir});
    return false;
  }
  return true;
});
