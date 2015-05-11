angular.module('prx.stories.edit', ['ui.router', 'ngSuperglobal', 'prx.ui.nav'])
.config(function ($stateProvider) {
  $stateProvider.decorator('views', function (state, parent) {
    var views = parent(state);

    angular.forEach(views, function (view) {
      if (view.live) {
        if (view.templateUrl) {
          view.templateUrl = view.templateUrl + '#live';
        } else if (view.template) {
          view.template = view.template.replace(/::/g, '');
        }
      }
    });

    return views;
  });

  $stateProvider.state('story.create', {
    url: '^/stories/create?version&section',
    params: {
      uploadIds: [],
      version: "podcast",
      section: "marketing"
    },
    reloadOnSearch: false,
    data: {
      openSheet: true,
      edit: {

      }
    },
    views: {
      '@': {
        controller: 'StoryPreviewCtrl as story',
        templateUrl: 'stories/story.html',
        live: true,
      },
      'contextMenu@': {
        templateUrl: 'stories/edit/context_menu.html',
        controller: function (story) {
          this.current = story;
        },
        controllerAs: 'story'
      },
      'sheet@': {
        templateUrl: 'stories/edit/sheet.html',
        controller: function (story, audioFiles, $scope) {
          this.current = story;
          this.audioFiles = audioFiles;

          var self = this;

          $scope.$watch("story_edit.$dirty", function(newValue) {
            self.current.$dirty = newValue;
          });

          this.removeAudioFile = function (idx) {
            this.audioFiles[idx].upload.cancel();
            this.audioFiles.splice(idx, 1);
          };
        },
        controllerAs: 'story'
      }
    },
    resolve: {
      audioFiles: function ($stateParams, Upload) {
        var audioFiles = [];
        angular.forEach($stateParams.uploadIds, function (uploadId) {
          audioFiles.push({ upload: Upload.getUpload(uploadId) });
        });
        return audioFiles;
      },
      story: function (ngHal, audioFiles, UploadAnalysis, $q, ngSuperGlobals) {
        if (audioFiles.length) {
          return (UploadAnalysis.properties(audioFiles)).then(function (data) {
            return ngHal.build('prx:stories').then(function (story) {
              angular.extend(story, data);
              story.title = story.title || "Add a short, meaningful title which will grab attention";
              story.shortDescription = story.shortDescription || "Grab listener's attention in tweet (<140 characters) form. Make listeners want to hit the play button.";
              story.publishedAt = new Date();

              var obj = {
                story: story,
                audioFiles: audioFiles,
              };

              ngSuperGlobals.bind('createStory', obj);
              if (story.title == 'Adrianne Mathiowetz') {
                story.imageUrl = 'https://dl.dropboxusercontent.com/u/125516/mathiowetz.png';
              }
              return story;
            });
          });
        } else {
          return ngHal.build('prx:stories').then(function (story) {
            ngSuperGlobals.bind('createStory', { story: story });
            return story;
          });
        }
      },
      account: function (ngHal) {
        return ngHal.follow('prx:account', {id: 30890});
      },
      audioVersions: function () {
        return [];
      },
      musicalWorksList: function () {
        return {};
      },
      audioUrls: function () {
        return [];
      },
      musicalWorks: function () {
        return [];
      }
    }
  });
})
.run(function ($templateCache) {
  var matcher = /#live$/;
  var dblColon = /::/g;
  var empty = '';
  var live = '#live';
  var origGet = $templateCache.get;
  $templateCache.get = function (uri) {
    var result = origGet.apply(this, arguments);
    if (!result && matcher.test(uri)) {
      uri = uri.replace(matcher, empty);
      result = origGet.call(this, uri);
      result = result.replace(dblColon, empty);
      this.put(uri + live, result);
    }
    return result;
  };
})
.controller('StoryPreviewCtrl', function ($scope, $window, $state, audioFiles, account, story, prxSoundFactory) {
  this.account = account;
  this.current = story;

  // TODO Get actual duration from dropped file(s)
  this.current.duration = 276;

  var self = this;

  // TODO Should only be active when in Edit Mode
  // $window.onbeforeunload = function(){
  //   return "Are you sure you want to leave Edit Mode?";
  // };

  $scope.$on('dragOver', function (event) {
    event.preventDefault();
  });

  var skipStateChangeConfirm = false;

  $scope.$on('$stateChangeStart', function(event, state, _, fromState) {
    if (!skipStateChangeConfirm) {
      event.preventDefault();

      var confirm = $window.confirm('Are you sure you want to leave Edit Mode?');
      if (confirm) {
        // leave
        skipStateChangeConfirm = true;
        $state.go(state);
      }
    }
  });

  var url;

  // TODO Needs to handle multi-segment versions
  if (audioFiles.length) {
    url = URL.createObjectURL(audioFiles[0].upload.file);
  } else {
    url = 'https://dl.dropboxusercontent.com/u/125516/02%20Adrianne%20Mathiowetz.mp3';
  }

  this.sound = prxSoundFactory({
    audioFiles:[url],
    story: story,
    producer: account
  });
})
.factory('UploadAnalysis', function (Id3Service, $window, Upload) {
  function dataUri(data) {
    // var input = new Uint8Array(data.data);
    // var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    // var output = "";
    // var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
    // var i = 0;
    //
    // while (i < input.length) {
    //     chr1 = input[i++];
    //     chr2 = i < input.length ? input[i++] : Number.NaN; // Not sure if the index
    //     chr3 = i < input.length ? input[i++] : Number.NaN; // checks are needed here
    //
    //     enc1 = chr1 >> 2;
    //     enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
    //     enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
    //     enc4 = chr3 & 63;
    //
    //     if (isNaN(chr2)) {
    //         enc3 = enc4 = 64;
    //     } else if (isNaN(chr3)) {
    //         enc4 = 64;
    //     }
    //     output += keyStr.charAt(enc1) + keyStr.charAt(enc2) +
    //               keyStr.charAt(enc3) + keyStr.charAt(enc4);
    // }
    // data.data.type = data.mime;
    // data.data.name = "id3_extraction";
    // Upload.upload(data.data).then(function () {
    //   console.log(arguments);
    // }, function () {
    //   console.log(arguments);
    // });
    // return "data:" + data.mime + ";base64," + output;
    // var url = URL.createObjectURL(data);
    // console.log(url);
    // return url;
  }

  return {
    properties: function (audioFiles) {
      if (audioFiles.length) {
        return Id3Service.analyze(audioFiles[0].upload.file).then(function (data) {

          return {
            title: data.title && data.title.replace(/.$/, '')
            // imageUrl: dataUri(data.image)
          };
        });
      }
    }
  };
})
.directive('xiProgressBar', function () {
  return {
    restict: 'E',
    template: '<div style="background: red; width: 100%; height: 15px;"></div>',
    scope: {
      progress: '='
    },
    link: function (scope, element, attr) {
      scope.percent = function () {
        return Math.round(this.progress * 1000) / 10;
      };

      var bar = element.children().eq(0);

      scope.$watch('percent()', function (progress) {
        bar.css('width', progress + '%');
      });
    }
  };
})
.directive('lockParentScrolling', function ($timeout) {
  return {
    restrict: 'A',
    scope: {
      'lockParentScrolling': '&'
    },
    link: function (scope, elem, attrs) {
      var always = false, blocking = false, neverScroll = true;
      elem.on('mousewheel', stopScroll);
      scope.$on('$destroy', function () {
        elem.off('mousewheel', stopScroll);
      });

      if (!attrs.lockParentScrolling || attrs.lockParentScrolling == 'lock-parent-scrolling') {
        always = true;
      }

      function stopScroll(event) {
        event.stopPropagation();
        if (always || scope.lockParentScrolling()) {
          var delta = event.wheelDeltaY,
              maxScroll = this.scrollHeight - this.clientHeight;
          if (maxScroll !== 0) { neverScroll = false; }
          if ((delta > 0 && this.scrollTop <= 0) ||
              (delta < 0 && this.scrollTop >= maxScroll)) {
                if (blocking || neverScroll) {
                  scheduleBlock();
                  event.preventDefault();
                }
          } else if (delta !== 0) {
            scheduleBlock();
          }
        }
     }

     function scheduleBlock() {
       if (blocking) {
         $timeout.cancel(blocking);
       }
       blocking = $timeout(removeBlocking, 300);
     }

     function removeBlocking() {
       blocking = false;
     }
    }
  };
});
