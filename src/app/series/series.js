angular.module('prx.series', ['ui.router', 'angular-hal'])
.config(function ($stateProvider, ngHalProvider, $urlRouterProvider) {
  $stateProvider.state('series', {
    url: '/series/:seriesId',
    controller: 'SeriesCtrl',
    templateUrl: 'series/series.html',
    resolve: {
      series: ['ngHal', '$stateParams', function (ngHal, $stateParams) {
        return ngHal.followOne('series', {id: $stateParams.seriesId});
      }],
      stories: ['series', function(series) {
        return series.follow('stories').then(function(storiesDoc) { return storiesDoc.follow('items'); });
      }]
    }
  });

ngHalProvider.setRootUrl(FEAT.apiServer)
  .defineModule('http://meta.prx.org/model/series', [function () {
    return {};
  }]);
})
.controller('SeriesCtrl', function ($scope, series, stories) {
  $scope.series = series;
  $scope.stories = stories;
  console.log($scope.stories[0]);
});
