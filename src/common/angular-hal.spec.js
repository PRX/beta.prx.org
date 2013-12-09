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

    it ('adds to the objects prototype chain multiple times', function () {
      module('angular-hal', function (ngHalProvider) {
        ngHalProvider.setRootUrl('/api/v1');
        ngHalProvider.defineModule('http://meta.nghal.org/object', {
          prop1: 1,
          prop2: 2,
          prop3: 3
        });
        ngHalProvider.defineModule('http://meta.nghal.org/object', {
          prop1: 4
        });
      });


      inject(function (ngHal, $httpBackend) {
        $httpBackend.when('GET', '/api/v1').respond({_links: {foo: {href:'/foo', profile: 'http://meta.nghal.org/object'}}});
        $httpBackend.when('GET', '/foo').respond({prop2: 5});

        var resp;

        ngHal.follow('foo').then(function (o) {
          resp = [o.prop1, o.prop2, o.prop3];
        });

        $httpBackend.flush();

        expect(resp).toEqual([4, 5, 3]);
      });
    });
  });

  describe ('run phase', function () {
    beforeEach(module('angular-hal', function (ngHalProvider) {
      ngHalProvider.setRootUrl('/api');
    }));

    beforeEach(inject(function ($httpBackend) {
      $httpBackend.when('GET', '/api').respond({
        _links: {
          foo: {
            href: '/api/foo'
          },
          bar: {
            href: '/api/bar'
          }
        },
        foo: 'split:me'
      });
    }));

    it ('calls the root url requested in configuration', inject(function ($httpBackend, ngHal) {
      $httpBackend.expectGET('/api');
      $httpBackend.flush();
    }));

    it ('can fetch links based on rel', inject(function ($httpBackend, ngHal) {
      $httpBackend.expectGET('/api');
      var href;
      ngHal.link('foo').then(function (link) { href = link.href; });
      $httpBackend.flush();
      expect(href).toEqual('/api/foo');
    }));

    describe('following', function () {

      beforeEach(inject(function ($httpBackend) {
        $httpBackend.expectGET('/api/bar').respond({_links: {baz: {href: '/api/baz'}}});
        $httpBackend.expectGET('/api/baz').respond({cool: 'sigil'});
      }));

      it ('can follow multiple times on a promise', inject(function ($httpBackend, ngHal) {
        var cool;
        ngHal.follow('bar').follow('baz').then(function (data) {
          cool = data.cool;
        });
        $httpBackend.flush();
        expect(cool).toEqual('sigil');
      }));

      it ('can follow on documents', inject(function ($httpBackend, ngHal) {
        var cool;
        ngHal.follow('bar').then(function (bar) {
          bar.follow('baz').then(function (data) {
            cool = data.cool;
          });
        });
        
        $httpBackend.flush();
        expect(cool).toEqual('sigil');
      }));

    });

    it ('generates its own url based on _links.self', inject(function ($httpBackend, ngHal) {
      $httpBackend.expect('GET', '/api').respond({_links: {self: {href: '/api/v1'}}});
      var url;
      ngHal.url().then(function (u) { url = u; });
      $httpBackend.flush();
      expect(url).toEqual('/api/v1');
    }));

    it ('falls back on the request url if there is no _links.self', inject(function ($httpBackend, ngHal) {
      var url;
      ngHal.url().then(function (u) { url = u; });
      $httpBackend.flush();
      expect(url).toEqual('/api');
    }));

    it ('gets a promise for properties on an object', inject(function ($httpBackend, ngHal) {
      var d;
      ngHal.get('foo').then(function (data) {
        d = data;
      });
      $httpBackend.flush();
      expect(d).toEqual('split:me');
    }));

    it ('gets a promise for methods called on an object', inject(function ($httpBackend, ngHal) {
      var a;
      ngHal.get('foo').call('split', ':').then(function (data) {
        a = data;
      });
      $httpBackend.flush();
      expect(a).toEqual(['split', 'me']);
    }));

    it ('PUTs data back to the server to the self url calculated when save is called', inject(function ($httpBackend, ngHal) {
      $httpBackend.expect('GET', '/api').respond({_links: { self: { href: '/api/update'}}});
      $httpBackend.expectPUT('/api/update', {foo: 'bar'}).respond({});
      ngHal.then(function (object) {
        object.foo = 'bar';
        object.save();
      });
      $httpBackend.flush();
    }));

    it ('memoizes property promises', inject(function (ngHal) {
      expect(ngHal.get('foo')).toBe(ngHal.get('foo'));
    }));

    it ('rejects a link when there is no such rel', inject(function ($httpBackend, ngHal) {
      var e = false;
      ngHal.link('rel')['catch'](function (err) {
        e = err;
      });
      expect(e).toBe(false);
      $httpBackend.flush();
      expect(e).toBeTruthy();
    }));
  });
});