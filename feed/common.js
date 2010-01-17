// Whether we can modify the list of readers.
var storageEnabled = window.localStorage != null;

function getReaderWithUrl(engine, feedUrl) {
  if (engine.indexOf("%S") > -1) {
    var url = feedUrl.replace(/^http(s)?:\/\//,"");
    url = engine.replace("%S", escape(encodeURI(url)));
    return url;
  }
  var url = engine.replace("%s", escape(encodeURI(feedUrl)));
  return url;
}

/**
*  Returns the default list of feed readers.
*/
function defaultReaderList() {
  // This is the default list, unless replaced by what was saved previously.
  return [
    { 'url': 'http://www.google.com/reader/view/feed/%s',
      'description': 'Google Reader'
    },
    { 'url': 'http://www.google.com/ig/adde?moduleurl=%s',
      'description': 'iGoogle'
    },
    { 'url': 'http://www.bloglines.com/login?r=/sub/%s',
      'description': 'Bloglines'
    },
    { 'url': 'http://add.my.yahoo.com/rss?url=%s',
      'description': 'My Yahoo'
    },
    { 'url': 'http://feedex.net/url/%S',
      'description': 'FeedEx'
    }
  ];
}

/**
* Check to see if the current item is set as default reader.
*/
function isDefaultReader(url) {
  defaultReader = window.localStorage.defaultReader ?
                      window.localStorage.defaultReader : "";
  return url == defaultReader;
}
