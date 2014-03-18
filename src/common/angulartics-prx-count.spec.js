describe ('angulartics prx count', function () {
  var $analytics, args;

  beforeEach(module('angulartics.prx.count'));
  beforeEach(inject(function (_$analytics_) {
    spyOn(TheCount, 'logAction');
    $analytics = _$analytics_;
  }));

  function getArgs() {
    args = TheCount.logAction.calls.mostRecent().args[0];
  }

  describe ('page tracking', function () {
    beforeEach(function () {
      $analytics.pageTrack('/foo');
      getArgs();
    });

    it ('logs page views to the count', function () {
      expect(TheCount.logAction).toHaveBeenCalled();
    });

    it ('uses the view action', function () {
      expect(args.action).toEqual('view');
    });

    it ('passes the url correctly', function () {
      expect(args.url).toEqual(window.location.protocol + '//' + window.location.host + '/foo');
    });

    it ('rewrites urls to the old uri format for stories', function () {
      $analytics.pageTrack('/stories/123');
      getArgs();
      expect(args.url).toEqual(window.location.protocol + '//' + window.location.host + '/pieces/123');
    });
  });

  describe ('event tracking', function () {
    beforeEach(function () {
      $analytics.eventTrack('name', {foo: 'bar'});
      getArgs();
    });

    it ('passes along the data requested', function () {
      expect(args.action).toEqual('name');
      expect(JSON.parse(args.action_value).foo).toEqual('bar');
    });
  });
});