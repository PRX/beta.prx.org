angular.module('prx.donations', ['prx.bus', 'angulartics',])
.run(function (Bus, $analytics) {
  var category = 'Outbound';

  Bus.on('donate.outbound', function (account, url) {
    $analytics.eventTrack('Donate', {
      category: category,
      label: 'Account-' + account.id.toString() + '-' + url,
      // hitcallback: function () {
      //   $window.location.href = url;
      // }
    });
  });
})
.service('prxDonateURL', function () {
  this.forAccount = function (account) {
    var map = {
      '45139': 'http://themoth.org/support?utm_source=PRX&utm_medium=Donate%20Button&utm_campaign=PRX%20-%20Moth%20-%20Donate',
      '103576': 'http://thetruthpodcast.com/Support.html',
      '551': 'http://99percentinvisible.org/donate/?utm_source=PRX&utm_medium=donate_button&utm_campaign=Radiotopia',
      '12248': 'http://loveandradio.org/?utm_source=PRX&utm_medium=donate_button&utm_campaign=Radiotopia',
      '123677': 'http://www.storycentral.org/donate/?utm_source=PRX&utm_medium=donate_button&utm_campaign=Radiotopia',
      '31': 'http://toe.prx.org/?utm_source=PRX&utm_medium=donate_button&utm_campaign=Radiotopia',
      '561': 'http://www.radiodiaries.org/donate/?utm_source=PRX&utm_medium=donate_button&utm_campaign=Radiotopia',
      '579': 'http://www.kitchensisters.org/support/?utm_source=PRX&utm_medium=donate_button&utm_campaign=Radiotopia',
      '179116': 'http://www.theheartradio.org/?utm_source=PRX&utm_medium=donate_button&utm_campaign=Radiotopia',
    };

    return map[account.id.toString()];
  };
})
.directive('prxDonate', function(prxDonateURL, $analytics, $window, $timeout, Bus) {
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

          console.log('click');
          Bus.emit('donate.outbound', account, url);
          $timeout(function() { $window.location.href = url; }, 200);
        });
      }

      scope.$on('$destroy', function () {
        elem.off('click');
      });
    }
  };
});
