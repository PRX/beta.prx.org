module.exports = function donationsDirective(prxDonateURL, $analytics, $window, $timeout, Bus) {
  // TODO: look into switching to ng-click for binding, and replacing with an A
  //       tag so that open in new tab is possible
  return {
    restrict: 'E',
    replace: true,
    template: '<div class="donate">Donate</div>',
    scope: {account: '='},
    link: function(scope, elem, attrs, ctrl) {

      var account = scope.account;
      var url = prxDonateURL.forAccount(account);

      if (!url) {
        elem.remove();
      } else {
        elem.on('click', function(event) {
          event.preventDefault();

          Bus.emit('donate.outbound', account, url);
          $timeout(function() { $window.location.href = url; }, 200);
        });
      }

      scope.$on('$destroy', function () {
        elem.off('click');
      });
    }
  };
};
