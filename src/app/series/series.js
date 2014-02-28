angular.module('prx.series', ['ui.router', 'angular-hal', 'prx.stories'])
.config(function ($stateProvider, ngHalProvider) {
  $stateProvider.state('series', {
    url: '/series/:seriesId',
    controller: 'SeriesCtrl',
    templateUrl: 'series/series.html',
    resolve: {
      series: ['ngHal', '$stateParams', function (ngHal, $stateParams) {
        return ngHal.followOne('series', {id: $stateParams.seriesId});
      }],
      stories: ['series', function(series) {
        return series.follow('stories').follow('items');
      }]
    }
  });

ngHalProvider.setRootUrl(FEAT.apiServer)
  .mixin('http://meta.prx.org/model/series', ['resolved', function (resolved) {
    resolved.imageUrl = resolved.follow('image').call('link', 'enclosure').call('url');
  }]);
})
.controller('SeriesCtrl', function ($scope, series, stories) {
  $scope.series = series;
  $scope.stories = stories;
});
