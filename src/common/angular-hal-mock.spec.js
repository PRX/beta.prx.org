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

  it ('can stubFollow on the root node', inject(function (ngHal, $rootScope) {
    var result;
    ngHal.then(function (d) {
      d.stubFollow('foo', {a: 1});
      return d;
    }).follow('foo').get('a').then(function(a) {
      result = a;
    });

    $rootScope.$digest();

    expect(result).toBe(1);
  }));

  it ('can stub followOnes', inject(function(ngHal, $rootScope) {
    var doc2 = ngHal.mock('http://meta.nghal.org/object');
    var doc3 = ngHal.mock({b:3});
    var rDoc2, rDoc3, result;
    ngHal.stubFollowOne('foo', doc2);
    doc2.stubFollowOne('bar', doc3);

    ngHal.followOne('foo').then(function(d){
      rDoc2 = d;
      return d;
    }).followOne('bar').then(function(d) {
      rDoc3 = d;
      return d;
    }).get('b').then(function(b) {
      result = b;
    });

    expect(rDoc2).toBe(doc2);
    expect(rDoc3).toBe(doc3);
    expect(result).toBe(3);

  }));

  it ('has a shorthand to stubFollow on stubbed promises', inject(function (ngHal, $rootScope) {
    var result;
    ngHal.stubFollow('foo', ngHal.mock('http://meta.nghal.org/object', {id:3}));
    ngHal.follow('foo').call('getId').then(function (id) { result = id; });
    $rootScope.$digest();
    expect(result).toBe(3);
  }));

  it ('does not interfere with contexts', function () {
    module(function (ngHalProvider) {
      ngHalProvider.context('foo').setRootUrl('/asd');
    });

    inject(function (ngHal, $httpBackend) {
      var href;
      $httpBackend.whenGET('/asd').respond({});
      ngHal.context('foo').url().then(function (url) { href = url; });
      $httpBackend.flush();
      expect(href).toBe('/asd');
    });
  });

  it ('has a shorthand for mocking something with an enclosure', inject(function (ngHal) {
    var mock = ngHal.mockEnclosure('http://prx.org');
    expect(mock.link('enclosure').url()).toEqual('http://prx.org');
  }));

  it ('defaults to file.ext when no args passed', inject(function (ngHal) {
    var mock = ngHal.mockEnclosure();
    expect(mock.link('enclosure').url()).toEqual('file.ext');
  }));

  describe ('transformation', function () {
    var ngHal;

    beforeEach(module(function (ngHalProvider) {
      ngHalProvider.mixin('type', function () {
        return function (obj) { obj.value += 1; };
      });
    }));

    beforeEach(inject(function (_ngHal_) {
      ngHal = _ngHal_;
    }));

    it ('requires a manual call for non-resolved (root) mocks', function () {
      var mock = ngHal.mock('type', {value: 1});
      expect(mock.value).toEqual(1);
      mock.transform();
      expect(mock.value).toEqual(2);
    });

    it ('happens automatically for resolved mocks', function () {
      ngHal.stubFollow('foo', ngHal.mock('type', {value: 1}));
      var mock;

      ngHal.follow('foo').then(function (m) {
        mock = m;
      });

      expect(mock.value).toEqual(2);
    });

    it ('does not happen twice', function () {
      var mock1, mock2;
      ngHal.stubFollow('foo', ngHal.mock('type', {value: 1}));

      ngHal.follow('foo').then(function (m) {
        mock1 = m;
      });
      ngHal.follow('foo').then(function (m) {
        mock2 = m;
      });

      expect(mock1.value).toEqual(2);
      expect(mock2).toEqual(mock1);
    });

    it ('lets you match on promise resolutions', function () {
      ngHal.stubFollow('asd', {foo: 'bar'});
      expect(ngHal.follow('asd').get('foo')).toResolveTo('bar');
      expect(ngHal.follow('asd').get('foo')).not.toResolveTo('bang');
    });

    it ('errors on promise resolutions when the promise is not ready', inject(function ($q) {
      expect($q.defer().promise).not.toResolveTo(null);
    }));

    it ('errors on promise resolutions when the promise is not ready', inject(function ($q) {
      expect($q.defer().promise).not.toResolve();
    }));

    it ('succeeds when promise is resolved', inject(function ($q, $rootScope) {
      expect($q.when(true)).toResolve();
    }));
  });
});
