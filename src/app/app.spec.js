describe('prx', function () {
  describe ('appCtrl', function () {
    var $controller, $scope, ctrl;

    beforeEach(module('prx'));
    beforeEach(inject(function (_$controller_, $rootScope) {
      $controller = _$controller_;
      $scope = $rootScope.$new();
      ctrl = $controller('appCtrl', {$scope: $scope});
    }));

    it ('attaches a player', function () {
      expect($scope.player).toBeDefined();
    });

    it ('hides the modal by default', function () {
      expect($scope.$apply('modal.visible')).toBeFalsy();
    });

    it ('quickly shows the modal if loading directly to one', function () {
      $scope.$emit('$stateChangeStart', {data: {modal: true}}, {}, {abstract: true});
      expect($scope.$apply('modal.visible')).toBeTruthy();
    });

    it ('does not quickly show the modal if coming from another state', function () {
      $scope.$emit('$stateChangeStart', {data: {modal: true}}, {}, {abstract: false});
      expect($scope.$apply('modal.visible')).toBeFalsy();
    });

    it ('shows the modal if we have moved to a modal state', function () {
      $scope.$emit('$stateChangeSuccess', {data: {modal: true}});
      expect($scope.$apply('modal.visible')).toBeTruthy();
    });

    it ('hides the modal if we have moved to a non-modal state', function () {
      $scope.modal.visible = true;
      $scope.$emit('$stateChangeSuccess', {});
      expect($scope.$apply('modal.visible')).toBeFalsy();
    });
  });

  describe('prxImg directive', function () {
    var $compile, $scope, element;
    beforeEach(module('prx'));
    beforeEach(inject(function (_$compile_, $rootScope) {
      $compile = _$compile_;
      $scope = $rootScope.$new();
      element = $compile(angular.element('<prx-img src="src"></prx-img>'))($scope);
    }));

    it ('has the img class', function () {
      $scope.src = 1;
      expect(element.hasClass('img')).toBeTruthy();
    });

    it ('has the background-image set to the src prop', function () {
      $scope.src = "foo.jpg";
      $scope.$digest();
      expect(element.css('background-image')).toMatch(/^url\(.*foo\.jpg.*\)$/);
    });
  });
});
