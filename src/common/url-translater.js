angular.module('prx.url-translate', ['angular-hal'])
.provider('urlTranslate', function () {
  var mappings = [];

  getTranslator.$inject = ['halUriMatcher', 'UriTemplate'];
  function getTranslator(UriMatcher, UriTemplate) {
    var compiledMappings = [];
    angular.forEach(mappings, function (mapping) {
      compiledMappings.push([new UriMatcher(mapping[0]),
        UriTemplate.parse(mapping[1])]);
    });
    return function (uri) {
      var found = false, result = uri;
      angular.forEach(compiledMappings, function (mapping) {
        if (!found && mapping[0].test(uri)) {
          found = true;
          result = mapping[1].expand(mapping[0].match(uri));
        }
      });
      return result;
    };
  }

  var urlTranslateProvider = {
    translate: function (from, to) {
      mappings.push([from, to]);
      return urlTranslateProvider;
    },
    $get: getTranslator
  };

  return urlTranslateProvider;
});
