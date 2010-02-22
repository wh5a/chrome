/*
  Test pages:
  http://stackoverflow.com/questions/2284875/why-is-haskell-used-so-little-in-the-industry
  http://serverfault.com/questions/106160/should-network-hardware-be-set-to-autonegotiate-speeds-or-fixed-speeds
  http://superuser.com/questions/106483/interrupting-the-spinning-wheel-of-death
  http://meta.stackoverflow.com/questions/37328/my-godits-full-of-unicorns
*/

var clickevent=document.createEvent("MouseEvents");
clickevent.initEvent("click", true, true);
var total = 0;

// Hack: somehow we may miss some comment links, so do this repeatedly until the count does not change
function clickComment() {
  var comments = document.getElementsByClassName("comments-link");
  if (total == comments.length) return;
  total = comments.length;
  setTimeout(clickComment, 2000);
  for (var i = 0; i < total; i++)
    if (comments[i].title.substring(0,6) == "expand")
      comments[i].dispatchEvent(clickevent);
}

clickComment();
