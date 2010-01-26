/* Copyright (c) 2009 The Chromium Authors. All rights reserved.
   Use of this source code is governed by a BSD-style license that can be
   found in the LICENSE file.
*/

/* Use only multi-line comments in this file, since during testing
   its contents will get read from disk and stuffed into the
   iframe .src tag, which is a process that doesn't preserve line
   breaks and makes single-line comment out the rest of the code.
*/

/* The maximum number of feed items to show in the preview. */
var maxFeedItems = 50;

window.addEventListener("message", function(e) {
  var parser = new DOMParser();
  var doc = parser.parseFromString(e.data, "text/xml");

  if (doc) {
    buildPreview(doc);
  } else {
    /* Already handled in subscribe.html */
  }
}, false);

function buildPreview(doc) {
  var isAtom = false;
  var elm = doc.getElementsByTagName("rss")[0];
  if (elm) // RSS
    var xmlns = elm.getAttribute("xmlns:content");
  else {
    elm = doc.getElementsByTagName("feed")[0];
    if (elm) // Atom
      isAtom = true;
    else
      console.error("Unknow feed format");
  }
  
  /* Start building the part we render inside an IFRAME. We use a table to
     ensure that items are separated vertically from each other. */
  var table = document.createElement("table");
  var tbody = document.createElement("tbody");
  table.appendChild(tbody);

  /* Now parse the rest. Some use <entry> for each feed item, others use
     <channel><item>. */
  var entries = doc.getElementsByTagName('entry');
  if (entries.length == 0)
    entries = doc.getElementsByTagName('item');

  for (i = 0; i < entries.length && i < maxFeedItems; ++i) {
    item = entries.item(i);

    /* Grab the title for the feed item. */
    var itemTitle = item.getElementsByTagName('title')[0];
    if (itemTitle)
      itemTitle = itemTitle.textContent;
    else
      itemTitle = "Unknown title";

    /* Try to get the full content first. */
    var itemDesc = null;
    if (isAtom)
      itemDesc = item.getElementsByTagName('content')[0];
    else if (xmlns)
      itemDesc = item.getElementsByTagNameNS(xmlns, 'encoded')[0];

    /* Get the summary */
    if (!itemDesc)
      itemDesc = item.getElementsByTagName('description')[0];
    if (!itemDesc)
      itemDesc = item.getElementsByTagName('summary')[0];
    if (!itemDesc)
      itemDesc = item.getElementsByTagName('content')[0];

    if (itemDesc)
      itemDesc = itemDesc.textContent;
    else
      itemDesc = "";

    /* Grab the link URL. */
    var itemLink = item.getElementsByTagName('link');
    var link = "";
    if (itemLink.length > 0) {
      link = itemLink[0].childNodes[0];
      if (link)
        link = itemLink[0].childNodes[0].nodeValue;
      else
        link = itemLink[0].getAttribute('href');
    }

    var tr = document.createElement("tr");
    var td = document.createElement("td");

    /* If we found a link we'll create an anchor element,
    otherwise just use a bold headline for the title. */
    var anchor = (link != "") ? document.createElement("a") :
                                document.createElement("strong");
    anchor.id = "anchor_" + String(i);
    if (link != "")
      anchor.href = link;
    anchor.appendChild(document.createTextNode(itemTitle));
    anchor.className = "item_title";

    var span = document.createElement("span");
    span.id = "desc_" + String(i);
    span.className = "item_desc";
    span.innerHTML = itemDesc;

    td.appendChild(anchor);
    td.appendChild(document.createElement("br"));
    td.appendChild(span);
    td.appendChild(document.createElement("br"));
    td.appendChild(document.createElement("br"));

    tr.appendChild(td);
    tbody.appendChild(tr);
  }

  table.appendChild(tbody);
  document.body.appendChild(table);
}
