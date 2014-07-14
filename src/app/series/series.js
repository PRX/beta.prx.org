angular.module('prx.series', ['ui.router', 'angular-hal', 'prx.stories'])
.config(function ($stateProvider, ngHalProvider) {
  $stateProvider.state('series', {
    url: '/series/:seriesId',
    controller: 'SeriesCtrl as series',
    templateUrl: 'series/series.html',
    resolve: {
      series: ['ngHal', '$stateParams', function (ngHal, $stateParams) {
        return ngHal.followOne('prx:series', {id: $stateParams.seriesId});
      }],
      stories: ['series', function(series) {
        return series.follow('prx:stories').follow('prx:items');
      }]
    }
  });

ngHalProvider.setRootUrl(FEAT.apiServer)
  .mixin('http://meta.prx.org/model/series', ['resolved', function (resolved) {
    resolved.imageUrl = resolved.follow('prx:image').call('link', 'enclosure').call('url');
  }]);
})
.controller('SeriesCtrl', function (series, stories) {
  this.current = series;
  this.stories = stories;
});
