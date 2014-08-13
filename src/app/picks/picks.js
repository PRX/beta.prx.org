angular.module('prx.picks', ['prx.modelConfig'])
.config(function (ngHalProvider) {
  ngHalProvider.mixin('http://meta.prx.org/model/pick/*any', ['resolved', function (resolved) {
    resolved.story = resolved.follow('prx:story');
    resolved.account = resolved.follow('prx:account');
  }]);
})
.directive('prxPick', function () {
  return {
    restrict: 'E',
    replace: true,
    templateUrl: 'picks/pick.html',
    scope: {pick: '='},
    controller: 'PickCtrl as pick'
  };
})
.controller('PickCtrl', function ($scope, $rootScope) {
  if (angular.isDefined($scope.pick)) {
    this.current = $scope.pick;
    this.story = this.current.story;
    this.account = this.current.account;
  }

  this.setCommentOverflow = function (isOverflowing) {
    this.canShowMore = isOverflowing;
    if (!isOverflowing) {
      this.shouldExpandComment = false;
    }
  };

  $scope.$on('collapse', angular.bind(this, function() {
    this.shouldExpandComment = false;
  }));

  this.expandComment = function () {
    $rootScope.$broadcast('collapse');
    this.shouldExpandComment = true;
  };

})
.service('OverflowCheck', function ($window, $rootScope, $timeout) {
  var watches = [];
  var cbs = [];
  var overflowing = [];
  var nonOverflowing = [];
  var timeout;

  angular.element($window).on('resize', checkOverflows);

  this.watch = function (elem, cb) {
    if (watches.indexOf(elem) != -1) {
      cbs[watches.indexOf(elem)].push(cb);
      if (overFlowing.indexOf(elem) != -1) {
        cb(true);
      }
    } else {
      watches.push(elem);
      cbs[watches.length - 1] = [cb];
      if (timeout) {
        $timeout.cancel(timeout);
      }
      $timeout(checkOverflows, 1);
    }
  };

  this.unwatch = function (elem, cb) {
    var check, cIn, index = watches.indexOf(elem);
    if (index != -1) {
      check = cbs[index];
      cIn = check.indexOf(cb);
      if (cIn != -1) {
        check.splice(cIn, 1);
        if (check.length === 0) {
          cbs.splice(index, 1);
          watches.splice(index, 1);
        }
      }
    }
  };

  // $rootScope.$watch(checkOverflows);

  function checkOverflows () {
    var toOverflow  = [];
    var toUnderflow = [];
    angular.forEach(watches, function (elem, index) {
      if (elem.scrollHeight > elem.clientHeight &&
        overflowing.indexOf(elem) == -1) {
          toOverflow.push([elem, index]);
      } else if (elem.scrollHeight <= elem.clientHeight &&
        nonOverflowing.indexOf(elem) == -1) {
          toUnderflow.push([elem, index]);
      }
    });
    var elem, index, iIndex;
    $rootScope.$apply(function () {
      angular.forEach(toOverflow, function (tuple) {
        elem = tuple[0];
        index = tuple[1];
        iIndex = nonOverflowing.indexOf(elem);
        if (iIndex != -1) {
          nonOverflowing.splice(iIndex, 1);
        }
        overflowing.push(elem);
        angular.forEach(cbs[index], function (cb) {
          cb(true);
        });
      });
      angular.forEach(toUnderflow, function (tuple) {
        elem = tuple[0];
        index = tuple[1];
        iIndex = overflowing.indexOf(elem);
        if (iIndex != -1) {
          overflowing.splice(iIndex, 1);
        }
        nonOverflowing.push(elem);
        angular.forEach(cbs[index], function (cb) {
          cb(false);
        });
      });
    });
  }

})
.directive('onOverflow', function (OverflowCheck) {
  return {
    restrict: 'A',
    link: function (scope, el, attrs) {
      var elem = el[0];

      function setOverflow(isOverflowing) {
        scope.$eval(attrs.onOverflow, {'$overflowing': isOverflowing});
      }

      OverflowCheck.watch(elem, setOverflow);

      scope.$on('$destroy', function () {
        OverflowCheck.unwatch(elem, setOverflow);
      });
    }
  };
})
;
