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
});