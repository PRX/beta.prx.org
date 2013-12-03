describe('a sandwich', function () {
  beforeEach(module('main'));

  it('has an object', inject(function (object) {
    expect(object).toEqual({});
  }));
});