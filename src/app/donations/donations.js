angular.module('prx.donations', [])
.directive('prxDonate', function($analytics, $window, $timeout) {
  return {
    restrict: 'E',
    replace: true,
    template: '<div class="donate">Donate</div>',
    scope: {account: '='},
    link: function(scope, elem, attrs, ctrl) {
      map = {
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

      if (!map[scope.account.id.toString()]) {
        elem.remove();
      }

      elem.on('mousedown', function(event) {
        event.preventDefault();

        $analytics.eventTrack('Donate', {
          category: 'Outbound',
          label: 'Account-' + scope.account.id.toString() + '-' + map[scope.account.id.toString()],
          // hitcallback: function () {
          //   $window.location.href = url;
          // }
        });
        $timeout(function() { $window.location.href = map[scope.account.id.toString()]; }, 200);
      });
    }
  };
});
