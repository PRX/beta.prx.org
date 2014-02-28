angular.module('prx.series', ['ui.router', 'angular-hal', 'prx.stories'])
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
  .mixin('http://meta.prx.org/model/series', ['resolved', function (resolved) {
    resolved.$image = resolved.follow('image');
  }])
  .mixin('http://meta.prx.org/model/image', ['resolved', function (resolved) {
    resolved.$imageUrl = resolved.call('link', 'enclosure').call('url');
  }]);
})
.controller('SeriesCtrl', function ($scope, series, stories) {
  $scope.series = series;
  $scope.stories = stories;
  console.log($scope.series);
  console.log($scope.stories[0]);
});
