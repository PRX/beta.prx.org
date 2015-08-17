angular.module('prx.stories.edit', ['ui.router', 'ngSuperglobal', 'prx.ui.nav', 'prx.upload', 'prx.stories', 'prx.upload.filepicker'])
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
      version: 'podcast',
      section: 'marketing',
      series: null
    },
    reloadOnSearch: false,
    data: {
      openSheet: true
    },
    views: {
      '@': {
        controller: 'StoryPreviewCtrl as story',
        templateUrl: 'stories/story.html',
        live: true,
      },
      'contextMenu@': {
        templateUrl: 'stories/edit/context_menu.html',
        controller: function (story, audioFiles, $q, PrxAuth) {
          this.current = story;
          var token = PrxAuth.currentUser(true).then(function (user) {
            return user.token;
          });

          this.save = function () {
            return token.then(function (t) {
              return story.save({headers: {'Authorization' : 'Bearer ' + t}}).then(function () {
                return story;
              });
            });
          };

          this.publish = function () {
            $q.all([this.save(), token]).then(function (d) {
              d[0].build('prx:publish').then(function (pub) {
                pub.save({headers: {'Authorization' : 'Bearer ' + d[1]}});
              });
            });
          };
        },
        controllerAs: 'story'
      },
      'sheet@': {
        templateUrl: 'stories/edit/sheet.html',
        controller: function (story, audioFiles, imageFiles, $scope, Upload, PRXFilePicker, $stateParams, AudioFile, prxImageFileFactory, $window) {
          this.current = story;
          this.audioFiles = audioFiles;
          this.imageFiles = imageFiles;

          var self = this;

          $scope.$watch("story_edit.$dirty", function(newValue) {
            self.current.$dirty = newValue;
          });

          this.removeAudioFile = function (idx) {
            var confirm = $window.confirm('Are you sure you want to remove this file?');
            if (confirm) {
              this.audioFiles[idx].upload.cancel();
              this.audioFiles[idx].$story = undefined;
              this.audioFiles.splice(idx, 1);
            }
          };

          this.selectAudioFile = function (files) {
            PRXFilePicker.selectFiles(PRXFilePicker.mediaTypes.audio, false).then(function(files) {
              self.audioFiles = [];
              AudioFile.forUpload(Upload.upload(files[0])).then(function (af) {
                af.$story = story;
                self.audioFiles.push(af);
              });
            });
          };

          this.selectImage = function () {
            PRXFilePicker.selectFiles(PRXFilePicker.mediaTypes.image, false).then(function(files) {
              var upload = Upload.upload(files[0]);
              var imageFile = prxImageFileFactory(upload);
              self.imageFiles = [imageFile];
            });
          };

          this.removeImageFile = function (idx) {
            this.imageFiles[idx].upload.cancel();
            this.imageFiles.splice(idx, 1);
          };
        },
        controllerAs: 'story'
      }
    },
    resolve: {
      imageFiles: function () {
        return [];
      },
      audioFiles: function ($stateParams, Upload, AudioFile, $q) {
        var audioFiles = [];

        angular.forEach($stateParams.uploadIds, function (uploadId) {
          var audioFile = AudioFile.forUpload(Upload.getUpload(uploadId));
          audioFiles.push(audioFile);
        });

        return $q.all(audioFiles);
      },
      story: function (ngHal, UploadAnalysis, audioFiles, $q, Story, $stateParams, account) {
        return $q.all({properties: UploadAnalysis.properties(audioFiles), duration: Story.totalDuration(audioFiles)}).then(function (data) {
          return ngHal.build('prx:stories').then(function (story) {
              angular.extend(story, data.properties);
              story.set_series_uri = $stateParams.series;
              story.set_account_uri = account.links.url('self');
              story.title = story.title || "Add a short, meaningful title which will grab attention";
              story.shortDescription = story.shortDescription || "Grab listener's attention in tweet (<140 characters) form. Make listeners want to hit the play button.";
              story.publishedAt = new Date();
              story.duration = data.duration;
              return story;
            });
          });
      },
      account: function (PrxAuth) {
        return PrxAuth.currentUser(true).then(function (user) {
          return user.account;
        });
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
      },
      series: function (ngHal, $stateParams) {
        if ($stateParams.series) {
          var chunks = $stateParams.series.split('/');
          return ngHal.followOne('prx:series', {id: chunks[chunks.length-1]});
        }
        return false;
      }
    }
  });
})
.factory('prxImageFileFactory', function (prxSoundFactory, _$URL) {

  function PrxImageFile(upload) {
    this.upload = upload;
    this.url = _$URL.createObjectURL(upload.file);
  }

  return function (upload) {
    return new PrxImageFile(upload);
  };
})
.factory('prxAudioFileFactory', function (prxSoundFactory, _$URL) {

  function PrxAudioFile(upload) {
    this.upload = upload;
    this.url = _$URL.createObjectURL(upload.file);
  }

  PrxAudioFile.prototype.getSound = function (account, story) {
    if (!this.sound) {
      this.sound = prxSoundFactory({
        audioFiles: [this.url],
        story: story,
        producer: account
      });
    }

    return this.sound;
  };

  return function (upload) {
    return new PrxAudioFile(upload);
  };
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
.controller('StoryPreviewCtrl', function ($scope, $window, $state, audioFiles, account, story, prxSoundFactory, series) {
  this.account = account;
  this.current = story;
  this.sound = prxSoundFactory({
    audioFiles: audioFiles.map(function (x) { return x.url; }),
    story: story,
    producer: account
  });

  var self = this;
  this.series = series;

  angular.forEach(audioFiles, function (file) {
    file.$story = story;
  });

  // TODO Should only be active when in Edit Mode
  // $window.onbeforeunload = function(){
  //   return "Are you sure you want to leave Edit Mode?";
  // };

  $scope.$on('$destroy', function () {
    $window.onbeforeunload = undefined;
  });

  $scope.$on('dragOver', function (event) {
    event.preventDefault();
  });

  $scope.$on('$stateChangeStart', function(event, state, _, fromState) {
    var confirm = $window.confirm('Are you sure you want to leave Edit Mode?');
    if (!confirm) {
      event.preventDefault();
      event.stopPropagation();
      try { event.stopImmediatePropagation(); }  catch (e) { console.log(error); }
    }
  });
})
.factory('UploadAnalysis', function (Id3Service, $window, Upload, $q, AuroraService) {
  function dataUri(data) {
    // var input = new Uint8Array(data.data);
    // var keyStr = "FARSKIGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
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
    template: '<div></div>',
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
}).factory('Story', function ($q) {
  function Story(document) {
    this.$document = document;
  }

  Story.totalDuration = function (audioFiles) {
    return audioFiles.reduce(function (collector, audioFile) {
      return collector + audioFile.duration;
    }, 0);
  };
  return Story;
})
.factory("AudioFile", function (URL, AuroraService, $q, PrxAuth, ngHal, Id3Service) {
  function AudioFile(document) {
    this.$document = document;
  }

  AudioFile.forUpload = function (upload) {
    var token = PrxAuth.currentUser(true).then(function (user) {
      return user.token;
    });
    var file = PrxAuth.currentUser(true).then(function (user) {
      return user.account.build('prx:audio-files');
    });
    var metadata = $q.all({
      label: Id3Service.analyze(upload.file).then(function (data) {
        return data.title && data.title.replace("\u0000", '');
      }),
      duration: AuroraService.duration(upload.file).then(function (duration) {
        return duration / 1000;
      })
    });
    var doc = $q.all([file, metadata]).then(function (args) {
      var file = args[0];
      var metadata = args[1];
      angular.extend(file, metadata, {
        filename: upload.file.filename,
        url: URL.createObjectURL(upload.file),
        upload: upload
      });
      return file;
    });
    $q.all({doc: doc, upload: upload, token: token}).then(function (data) {
      data.doc.upload = 's3://' + FEAT.UPLOADS_AWS_BUCKET + '/' + upload.path;
      if (data.doc.$story && data.doc.$story.links.all('self')) {
        data.doc.$story.followOne('prx:audio-versions').follow('prx:items').
          get(0).get('links').call('url', 'self').then(function (versionUri) {
            data.doc.set_audio_version_uri = versionUri;
            data.doc.save({headers: {'Authorization' : 'Bearer ' + data.token}});
          });
      } else if (data.doc.$story) {
        var sv = data.doc.$story.save;
        data.doc.$story.save = function () {
          return sv.apply(data.doc.$story, arguments).then(function (story) {
            return data.doc.$story.followOne('prx:audio-versions').follow('prx:items');
          }).then(function (versions) {
            return versions[0].links.url('self');
          }).then(function (versionUri) {
            data.doc.set_audio_version_uri = versionUri;
            return data.doc.save({headers: {'Authorization' : 'Bearer ' + data.token}});
          }).then($q.when(story));
        };
      }
    });
    return doc;
  };
  return AudioFile;
});
