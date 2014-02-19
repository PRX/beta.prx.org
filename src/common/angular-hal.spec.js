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

    it ('can define a secondary context', function () {
      module('angular-hal', function (ngHalProvider) {
        ngHalProvider.setRootUrl('http://yahoo.com');
        ngHalProvider.context('search', function () {
          this.setRootUrl('http://bing.com');
        });

        ngHalProvider.context('prx').setRootUrl('http://prx.org/api');
      });

      inject(function (ngHal, $rootScope, $httpBackend) {
        var url, searchUrl, prxUrl;
        $httpBackend.when('GET', 'http://yahoo.com').respond({});
        $httpBackend.when('GET', 'http://bing.com').respond({});
        $httpBackend.when('GET', 'http://prx.org/api').respond({});
        ngHal.url().then(function (u) { url = u; });
        ngHal.context('search').url().then(function (u) { searchUrl = u; });
        $httpBackend.flush();
        expect(url).toBe('http://yahoo.com');
        expect(searchUrl).toBe('http://bing.com');

        $httpBackend.when('GET', 'http://bing.com').respond({name: "NOT AGAIN"});
        ngHal.context('search').then(function (d) { searchUrl = d.name });
        ngHal.context('prx').url().then(function (u) { prxUrl = u; });
        $httpBackend.flush();
        expect(searchUrl).not.toBeDefined();
        expect(prxUrl).toEqual('http://prx.org/api');
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

    it ('adds to the objects prototype chain with an injectable function', function () {
      module('angular-hal', function (ngHalProvider) {
        ngHalProvider.setRootUrl('/api/v1');
        ngHalProvider.defineModule('http://meta.nghal.org/object', function (ngHal) {
          return {
            notByHal: function () { return ngHal; }
          };
        });
      });

      inject(function (ngHal, $httpBackend) {
        $httpBackend.expectGET('/api/v1').respond({_links: {ducks: {href: '/api/ducks', profile: 'http://meta.nghal.org/object'}}});
        $httpBackend.expectGET('/api/ducks').respond({duckling: 12221});
        var resolvedHal, hald;
        ngHal.then(function (hal) {
          resolvedHal = hal;
        });
        ngHal.follow('ducks').call('notByHal').then(function (hal) {
          hald = hal;
        });
        $httpBackend.flush();
        expect(hald).toBe(resolvedHal);
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

  describe ('relative urls', function () {
    beforeEach(module('angular-hal', function (ngHalProvider) {
      ngHalProvider.setRootUrl('http://example.com/api');
    }));
    beforeEach(inject(function ($httpBackend) {
      var document = {
        _links: {
          foo: {
            href: 'foo'
          },
          bar: {
            href: '/another'
          },
          baz: {
            href: 'http://google.com'
          }
        }
      };
      $httpBackend.whenGET('http://example.com/api').respond(document);
    }));

    it ('appends links that should be appended to the current URL', inject(function (ngHal, $httpBackend) {
      var href;
      $httpBackend.expectGET('http://example.com/api/foo').respond({});
      ngHal.follow('foo').url().then(function (url) { href = url; });
      $httpBackend.flush();
      expect(href).toEqual('http://example.com/api/foo');
    }));

    it ('maintains the host when host-relative links are used', inject(function (ngHal, $httpBackend) {
      var href;
      $httpBackend.expectGET('http://example.com/another').respond({});
      ngHal.follow('bar').url().then(function (url) { href = url; });
      $httpBackend.flush();
      expect(href).toEqual('http://example.com/another');
    }));

    it ('drops all context when absolute urls are used', inject(function (ngHal, $httpBackend) {
      var href;
      ngHal.link('baz').then(function (link) { href = link.href(); });
      $httpBackend.flush();
      expect(href).toEqual('http://google.com');
    }));
  });

  describe ('run phase', function () {
    beforeEach(module('angular-hal', function (ngHalProvider) {
      ngHalProvider.setRootUrl('/api');
    }));

    beforeEach(inject(function ($httpBackend) {
      var document = {
        _links: {
          foo: {
            href: '/api/foo'
          },
          bar: {
            href: '/api/bar'
          },
          baz: {
            href: '/api/{name}'
          },
          lots: [
            {href: '/api/one'},
            {href: '/api/two'},
            {href: '/api/{name}'}
          ]
        },
        foo: 'split:me'
      };

      $httpBackend.when('GET', '/api').respond(document);
      $httpBackend.when('GET', '/api/foo').respond(angular.copy(document));
    }));


    it ('calls the root url requested in configuration', inject(function ($httpBackend, ngHal) {
      $httpBackend.expectGET('/api');
      $httpBackend.flush();
    }));

    it ('can fetch links based on rel', inject(function ($httpBackend, ngHal) {
      $httpBackend.expectGET('/api');
      var href;
      ngHal.link('foo').then(function (link) { href = link.href(); });
      $httpBackend.flush();
      expect(href).toEqual('/api/foo');
    }));

    it ('returns undefined for links when there is no matching template', inject(function ($httpBackend, ngHal) {
      var href;
      ngHal.link('baz').then(function (link) { href = link.href(); });
      $httpBackend.flush();
      expect(href).toBeUndefined();
    }));

    it ('returns compiled paths when there is a matching template', inject(function ($httpBackend, ngHal) {
      var href;
      ngHal.link('baz').then(function (link) { href = link.href({name:'chris'}); });
      $httpBackend.flush();
      expect(href).toEqual('/api/chris');
    }));

    it ('can return a list of hrefs', inject(function ($httpBackend, ngHal) {
      var hrefs;
      ngHal.link('lots').then(function (link) { hrefs = link.hrefs(); });
      $httpBackend.flush();
      expect(hrefs).toEqual(['/api/one', '/api/two']);
    }));

    describe('following', function () {

      beforeEach(inject(function ($httpBackend) {
        $httpBackend.expectGET('/api/bar').respond({_links: {baz: {href: '/api/baz'}, bar: [{href: '/api/bng'}, {href: '/api/bar/{id}', templated: true}]}});
        $httpBackend.whenGET('/api/baz').respond({cool: 'sigil'});
        $httpBackend.whenGET('/api/bng').respond({a: 1});
        $httpBackend.whenGET('/api/bar/1').respond({a: 2});
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

      it ('picks a link when there is more than one available', inject(function ($httpBackend, ngHal) {
        var response;
        ngHal.follow('bar').follow('bar').then(function (data) {
          response = data;
        });
        $httpBackend.flush();
        expect(response.a).toBe(1);
      }));

      it ('picks a link with appropriate templates when required', inject(function ($httpBackend, ngHal) {
        var response;
        ngHal.follow('bar').follow('bar', {id: 1}).then(function (data) {
          response = data;
        });
        $httpBackend.flush();
        expect(response.a).toBe(2);
      }));

    });

    it ('is a promise', inject(function ($httpBackend, ngHal) {
      var o;
      ngHal['finally'](function (e) {
        o = true;
      });
      expect(o).toBeFalsy();
      $httpBackend.flush();
      expect(o).toBeTruthy();
    }));

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

    it ('DELETEs the document URL when destroy is called', inject(function ($httpBackend, ngHal) {
      $httpBackend.expect('DELETE', '/api').respond({});
      ngHal.destroy();
      $httpBackend.flush();
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

    it ('caches constructors', inject(function ($httpBackend, ngHal, $q) {
      var p = ngHal.follow('foo');
      $q.all([p, p.follow('foo')]).then(function (d) {
        expect(d[0].constructor).toBe(d[1].constructor);
      });
      $httpBackend.flush();
    }));

    it ('compiles templated uris', inject(function ($httpBackend, ngHal) {
      $httpBackend.expect('GET', '/api').respond({_links: { foo: { href: '/foo/{id}', templated: true}} });
      $httpBackend.expect('GET', '/foo/123').respond({});

      ngHal.follow('foo', {id: 123});

      $httpBackend.flush();
    }));

    it ('constructs objects based on links', inject(function ($httpBackend, ngHal) {
      var foo;
      ngHal.build('foo').then(function (d) {
        foo = d;
      });
      $httpBackend.flush();
      expect(foo.save).toBeDefined();
    }));

    it ('POSTS to the apropriate url when saving a newly constructed object', inject(function ($httpBackend, ngHal) {
      $httpBackend.expect('POST', '/api/foo', {bar: 'baz'}).respond({});
      ngHal.build('foo').then(function (foo) {
        foo.bar = 'baz';
        foo.save();
      });
      $httpBackend.flush();
    }));

    it ('updates the links for the record when saving is finished', inject(function ($httpBackend, ngHal) {
      var doc;
      $httpBackend.when('POST', '/api/foo').respond({_links: { self: { href: '/api/foo/123' } }, id: 123, name: 'j' });
      ngHal.build('foo').then(function (foo) {
        foo.save().then(function () {
          doc = foo;
        });
      });
      $httpBackend.flush();
      expect(doc.name).toEqual('j');
      expect(doc.url()).toEqual('/api/foo/123');
    }));

    it ('is persisted once saved', inject(function ($httpBackend, ngHal) {
      var doc;
      $httpBackend.when('POST', '/api/foo').respond({});
      ngHal.build('foo').then(function (foo) {
        expect(foo.persisted()).toBeFalsy();
        foo.save();
        doc = foo;
      });
      $httpBackend.flush();
      expect(doc.persisted()).toBeTruthy();
    }));

    describe('embedded documents', function () {
      var ngHal, $httpBackend;

      beforeEach(inject(function (_$httpBackend_, _ngHal_) {
        ngHal = _ngHal_;
        $httpBackend = _$httpBackend_;
        var document = {
          _links: {
            owner: {
              href: '/api/owner'
            },
            versions: {
              href: '/api/versions'
            },
          },
          title: "a title",
          _embedded: {
            owner: {
              _links:  {
                self: { href: '/api/owner' }
              },
              name: 'name'
            },
            audio: [
              {
                _links: {
                  self: { href: '/api/audio1' }
                },
                name: 'audio1'
              },
              {
                _links: {
                  self: { href: '/api/audio2' }
                },
                name: 'audio2'
              }
            ]
          }
        };

        $httpBackend.expect('GET', '/api').respond(document);
      }));

      xit ('can fetch embedded documents using follow as a cache', function () {
        var mDoc;
        ngHal.follow('owner').then(function (doc) {
          expect(doc.name).toEqual('name');
        });
        $httpBackend.flush();
      });
    });
  });
});