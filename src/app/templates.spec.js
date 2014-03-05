describe('templates', function () {
  beforeEach(module('prx', 'templates', function ($provide) {
    $provide.decorator('$templateCache', function ($delegate) {
      var put = $delegate.put;
      $delegate.toTest = [];
      $delegate.put = function (uri) {
        this.toTest.push(uri);
        return put.apply(this, [].slice.call(arguments));
      };
      return $delegate;
    });
  }));

  it ('can compile all templates', inject(function ($rootScope, $compile, $templateCache) {
    var scope = $rootScope.$new();
    angular.forEach($templateCache.toTest, function (uri) {
      $compile($templateCache.get(uri))(scope);
    });
  }));
});