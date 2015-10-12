describe('prx.ui.overflow', function () {
  beforeEach(module('prx.ui.overflow', 'angular-hal-mock'));

  describe('OverflowCheck', function () {
    var OverflowCheck, $timeout;
    beforeEach(inject(function (_OverflowCheck_, _$timeout_) {
      OverflowCheck = _OverflowCheck_;
      $timeout = _$timeout_;
    }));

    it ('schedules a timeout when the watch is requested', function () {
      var elem = angular.element('<div>')[0],
        spy = jasmine.createSpy('cb');
      OverflowCheck.watch(elem, spy);
      $timeout.flush();
      expect(spy.calls.mostRecent().args[0]).toBe(false);
    });

    it ('cancels existing timeouts and schedules a new one when watches are requested back to back', function () {
      var elem = angular.element('<div>')[0];
      var elem2 = angular.element(elem).clone()[0];
      spyOn($timeout, 'cancel').and.callThrough();

      OverflowCheck.watch(elem, function () {});
      OverflowCheck.watch(elem2, function () {});
      expect($timeout.cancel).toHaveBeenCalled();
    });

    it ('allows unwatches', function () {
      var elem = angular.element('<div>');
      var elem2 = elem.clone();

      OverflowCheck.watch(elem[0], watcher);
      OverflowCheck.unwatch(elem[0], watcher2);
      OverflowCheck.unwatch(elem[0], watcher);
      OverflowCheck.unwatch(elem[0], watcher);
      OverflowCheck.watch(elem2[0], watcher);
      OverflowCheck.watch(elem2[0], watcher2);
      OverflowCheck.unwatch(elem2[0], watcher2);

      function watcher() {}
      function watcher2() {}
    });
  });
});
