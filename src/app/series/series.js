var angular = require('angular');

// series module
var app = angular.module('prx.series', [
  require('angular-ui-router'),
  require('../../common/angular-hal'),
  require('../stories/stories')
]);
module.exports = app.name;

app.config(function ($stateProvider, ngHalProvider) {
  $stateProvider.state('series', {
    abstract: true,
    title: 'Series',
  }).state('series.show', {
    url: '/series/:seriesId',
    title: ['series', function (series) { return series.title + " Series"; }],
    views: {
      '@': {
        templateUrl: "series/series.html",
        controller: 'SeriesCtrl as series'
      }
    },
    resolve: {
      series: function (ngHal, $stateParams) {
        return ngHal.followOne('prx:series', {id: $stateParams.seriesId});
      },
      storiesList: function (series) {
        return series.follow('prx:stories');
      },
      stories: function (storiesList) {
        return storiesList.follow('prx:items');
      },
      recentStories: function (storiesList) {
        return storiesList.follow('prx:items');
      },
      account: function(series) {
        return series.follow('prx:account');
      },
      currentUser: function(PrxAuth) {
        return PrxAuth.currentUser();
      }
    }
  })
  .state('series.show.details', {
    url: '/details',
    views: {
      'modal@': {
        controller: 'SeriesDetailCtrl as series',
        templateUrl: 'series/detail_modal.html'
      }
    }
  })
  .state('series.show.allStories', {
    views: {
      'modal@': {
        templateUrl: "series/stories_modal.html",
        controller: "SeriesStoriesCtrl as series"
      }
    },
    resolve: {
      list: function (storiesList) { return storiesList; },
      stories: function (recentStories) { return recentStories; }
    }
  });

ngHalProvider.setRootUrl(FEAT.apiServer)
  .mixin('http://meta.prx.org/model/series', ['resolved', function (resolved) {
    resolved.imageUrl = resolved.follow('prx:image').call('link', 'enclosure').call('url').or(null);
  }]);
})
.controller('SeriesCtrl', function (series, stories, account, currentUser) {
  this.current = series;
  this.stories = stories;
  this.account = account;

  this.isEditable = false;
  if (currentUser && currentUser.account) {
    this.isEditable = account.id == currentUser.account.id;
  }
})
.controller('SeriesStoriesCtrl', function (list, stories, series) {
  this.current = series;
  this.stories = stories;
  this.hasMore = angular.isDefined(list.link('next'));

  this.loadMore = function () {
    var ctrl = this;
    if (!ctrl.loadingMore) {
      ctrl.loadingMore = true;
      list.follow('next').then(function (nextList) {
        return nextList.follow('prx:items').then(function (stories) {
          list = nextList;
          Array.prototype.push.apply(ctrl.stories, stories);
        });
      })['finally'](function () {
        ctrl.hasMore = angular.isDefined(list.link('next'));
        ctrl.loadingMore = false;
      });
    }
  };
})
.controller('SeriesDetailCtrl', function (series) {
  this.current = series;
})
.directive('onApproachEnd', function () {
  return {
    restrict: 'A',
    link: function (scope, elem, attrs) {
      elem.on('scroll', function (event) {
        if (elem[0].scrollHeight - (elem[0].scrollTop + elem[0].clientHeight) <= 250) {
          scope.$eval(attrs.onApproachEnd);
        }
      });
    }
  };
});
