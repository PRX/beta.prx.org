describe('angular-hal-mock', function () {

  beforeEach(module('angular-hal-mock', function (ngHalProvider) {
    ngHalProvider.defineModule('http://meta.nghal.org/object', {
      getId: function () { return this.id; },
      name: 'foo'
    });
  }));

  it('allows mocking objects with mixins', inject(function (ngHal) {
    var mock = ngHal.mock('http://meta.nghal.org/object', {id: 1});
    expect(mock.getId()).toBe(1);
  }));

  it('generates an object from nothing if no object is passed', inject(function (ngHal) {
    var mock = ngHal.mock('http://meta.nghal.org/object');

    expect(mock.name).toBe('foo');
  }));

  describe ('with real ngHal requests', function () {
    beforeEach(module(function (ngHalProvider) {
      ngHalProvider.setRootUrl('/');
    }));

    it('can wrap real ngHal documents', inject(function (ngHal, $httpBackend) {
      var ngHalDoc;
      $httpBackend.when('GET', '/').respond({a:1, _links: {foo: {href: '/'}}});
      ngHal.then(function (doc) {
        ngHalDoc = doc;
      });
      $httpBackend.flush();

      var mock = ngHal.mock('http://meta.nghal.org/object', ngHalDoc);
      expect(mock.a).toBe(1);
      expect(mock.name).toEqual('foo');
      expect(mock.link('foo').href()).toEqual('/');
    }));
  });

  it('can stub followings', inject(function (ngHal, $rootScope) {
    var doc1 = ngHal.mock('http://meta.nghal.org/object');
    var doc2 = ngHal.mock('http://meta.nghal.org/object');
    var doc3 = ngHal.mock({b:{c:function(a) { return a; }}});
    var rDoc, result;

    doc1.stubFollow('foo', doc2);
    doc2.stubFollow('bar', doc3);

    doc1.follow('foo').then(function (d) {
      rDoc = d;
      return d;
    }).follow('bar').get('b').call('c', 2).then(function (b) {
      result = b;
    });

    $rootScope.$digest();

    expect(result).toBe(2);
    expect(rDoc).toBe(doc2);
  }));

  it('does not interfere with regular following', inject(function (ngHal, $httpBackend) {
    var doc1 = ngHal.mock('http://meta.nghal.org/object', {_links: {asd: {href: '/asd'}}});
    var doc2 = ngHal.mock({b:2});
    doc1.stubFollow('fgh', doc2);

    var asd, fgh;

    $httpBackend.whenGET('/asd').respond({c:3});

    doc1.follow('fgh').then(function (d) { fgh = d; });
    doc1.follow('asd').then(function (d) { asd = d; });

    $httpBackend.flush();

    expect(asd.c).toBe(3);
    expect(fgh.b).toBe(2);
  }));
});