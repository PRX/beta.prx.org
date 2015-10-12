(function () {

  angular
    .module('prx.picks')
    .controller('PickCtrl', PickCtrl);

  PickCtrl.$inject = ['$scope', '$rootScope'];

  function PickCtrl($scope, $rootScope) {
    if (angular.isDefined($scope.picki)) {
      this.current = $scope.picki;
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
  }

}());
