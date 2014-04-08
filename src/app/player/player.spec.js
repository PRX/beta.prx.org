describe('prx.player', function () {

  beforeEach(module('prx.player'));

  it('has a timeCode filter', inject(function ($filter) {
    expect($filter('timeCode')).toBeDefined();
  }));

  describe('timeCode filter', function () {
    var timeCode;

    beforeEach(inject(function ($filter){
      timeCode = $filter('timeCode');
    }));

    it('returns 00:00:00 when a non-number is passed', function () {
      expect(timeCode('foo')).toEqual('00:00:00');
    });

    it('pads seconds smaller than 10 with a leading 0', function () {
      expect(timeCode(9000)).toEqual('00:00:09');
    });

    it('pads minutes smaller than 10 with a leading 0', function () {
      expect(timeCode(540000)).toEqual('00:09:00');
    });

    it('pads hours smaller than 10 with a leading 0', function () {
      expect(timeCode(32400000)).toEqual('09:00:00');
    });

    it('handles decimal numbers by rounding down', function () {
      expect(timeCode(9900)).toEqual('00:00:09');
    });

    it('does not pad numbers > 10', function () {
      expect(timeCode(11000)).toEqual('00:00:11');
    });

    it('has a short format', function () {
      expect(timeCode(11000, 'short')).toEqual('0:11');
    });

  });

});
