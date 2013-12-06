describe('angular-hal', function () {

  describe ('configure phase', function() {
    it ('can set the entrypoint url', function () {
      module('angular-hal', function (ngHalProvider) {
        ngHalProvider.setRootUrl('http://google.com');
      });

      inject(function (ngHal, $rootScope, $httpBackend) {
        var url;
        $httpBackend.when('GET', 'http://google.com').respond({});
        ngHal.url().then(function (u) { url = u; });
        $httpBackend.flush();
        expect(url).toBe('http://google.com');
      });
    });

    it ('can add to an objects prototype chain based on link profiles', function () {
      module('angular-hal', function (ngHalProvider) {
        ngHalProvider.setRootUrl('/api/v1');
        ngHalProvider.defineModule('http://meta.nghal.org/object', {
          duckling: 12121,
          bar: 12121,
          foo: function () { return this.duckling; }
        });
      });

      inject(function (ngHal, $httpBackend) {
        $httpBackend.expectGET('/api/v1').respond({_links: {ducks: {href: '/api/ducks', profile: 'http://meta.nghal.org/object'}}});
        $httpBackend.expectGET('/api/ducks').respond({duckling: 12221});
        var duck;
        ngHal.follow('ducks').then(function (object) { duck = object; });
        $httpBackend.flush();
        expect(duck.duckling).toEqual(12221);
        expect(duck.bar).toEqual(12121);
        expect(duck.foo()).toEqual(12221);
      });
    });
  });

  describe ('run phase', function () {
    beforeEach(module('angular-hal', function (ngHalProvider) {
      ngHalProvider.setRootUrl('/api');
    }));

    it ('calls the root url requested in configuration', inject(function ($httpBackend, ngHal) {
      $httpBackend.expectGET('/api').respond({});
      $httpBackend.flush();
    }));

    it ('can fetch links based on rel', inject(function ($httpBackend, ngHal) {
      $httpBackend.when('GET', '/api').respond({_links: {foo: {href: '/api/foo'}}});
      $httpBackend.expectGET('/api');
      var href;
      ngHal.link('foo').then(function (link) { href = link.href; });
      $httpBackend.flush();
      expect(href).toEqual('/api/foo');
    }));

    it ('can follow links that can be fetched', inject(function ($httpBackend, ngHal) {
      $httpBackend.when('GET', '/api').respond({_links: {bar: {href: '/api/bar'}}});
      $httpBackend.expectGET('/api/bar').respond({_links: {baz: {href: '/api/baz'}}});
      $httpBackend.expectGET('/api/baz').respond({cool: 'sigil'});
      var cool;
      var bar = ngHal.follow('bar').follow('baz').then(function (data) {
        cool = data.cool;
      });
      $httpBackend.flush();
      expect(cool).toEqual('sigil');
    }));

    it ('generates its own url based on _links.self', inject(function ($httpBackend, ngHal) {
      $httpBackend.when('GET', '/api').respond({_links: {self: {href: '/api/v1'}}});
      var url;
      ngHal.url().then(function (u) { url = u; });
      $httpBackend.flush();
      expect(url).toEqual('/api/v1');
    }));

    it ('falls back on the request url if there is no _links.self', inject(function ($httpBackend, ngHal) {
      $httpBackend.when('GET', '/api').respond({});
      var url;
      ngHal.url().then(function (u) { url = u; });
      $httpBackend.flush();
      expect(url).toEqual('/api');
    }));

    it ('gets a promise for properties on an object', inject(function ($httpBackend, ngHal) {
      $httpBackend.when('GET', '/api').respond({foo: 'terrific'});
      var d;
      ngHal.get('foo').then(function (data) {
        d = data;
      });
      $httpBackend.flush();
      expect(d).toEqual('terrific');
    }));

    it ('gets a promise for methods called on an object', inject(function ($httpBackend, ngHal) {
      $httpBackend.when('GET', '/api').respond({foo: 'split:me'});
      var a;
      ngHal.get('foo').call('split', ':').then(function (data) {
        a = data;
      });
      $httpBackend.flush();
      expect(a).toEqual(['split', 'me']);
    }));

    it ('PUTs data back to the server to the self url calculated when save is called', inject(function ($httpBackend, ngHal) {
      $httpBackend.when('GET', '/api').respond({_links: { self: { href: '/api/update'}}});
      $httpBackend.expectPUT('/api/update', {foo: 'bar'});
      ngHal.then(function (object) {
        object.foo = 'bar';
        object.save();
      });
      $httpBackend.flush();
    }));
  });
});