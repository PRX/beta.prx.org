angular.module('prx.url-translate', ['angular-hal'])
.provider('urlTranslate', function () {
  var mappings = [];

  getTranslator.$inject = ['halUriMatcher', 'UriTemplate'];
  function getTranslator(UriMatcher, UriTemplate) {
    var compiledMappings = [];
    angular.forEach(mappings, function (mapping) {
      addTranslation(mapping[0], mapping[1]);
    });

    translate.addTranslation = addTranslation;
    
    return translate;

    function translate (uri) {
      var found = false, result = uri;
      angular.forEach(compiledMappings, function (mapping) {
        if (!found && mapping[0].test(uri)) {
          found = true;
          result = mapping[1].expand(mapping[0].match(uri));
        }
      });
      return result;
    }

    function addTranslation (from, to) {
      compiledMappings.push([new UriMatcher(from), UriTemplate.parse(to)]);
    }
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
