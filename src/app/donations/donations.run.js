module.exports = function donationsRun(Bus, $analytics) {
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
};
