(function () {

  angular
    .module('prx.donations')
    .run(run);

  run.$inject = ['Bus', '$analytics'];

  function run(Bus, $analytics) {
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
  }

}());
