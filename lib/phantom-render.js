var server = require('webserver').create(),
  args     = require('system').args;

function parseQueryString (string) {
  var result = {}, a = document.createElement("a");
  a.href = string;

  a.search.replace(/([^?=&]+)(?:=([^&]*))?/g, function (match, key, val) {
    result[key] = val;
  });

  return result;
}

server.listen(args[1], function (request, response) {
  var page = require('webpage').create();
  page.settings.loadImages = false;
  if (/\?/.test(request.url)) {
    request.url += "&_skip_prerender_";
  } else {
    request.url += "?_skip_prerender_";
  }

  page.onCallback = function() {
    response.statusCode = 200;
    response.write(page.content);
    response.close();
    page.close();
  };

  page.open('http://localhost:8080' + request.url);
});
