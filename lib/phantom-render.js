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

console.log(args);

server.listen(args[1], function (request, response) {
  var page = require('webpage').create();
  page.settings.loadImages = false;
  request.url = '/stories/123';
  console.log('http://prx4.dev:8080' + request.url);

  page.onCallback = function() {
    response.statusCode = 200;
    response.write(page.content);
    response.close();
    page.close();
  };
  
  page.open('http://prx4.dev:8080' + request.url);
});