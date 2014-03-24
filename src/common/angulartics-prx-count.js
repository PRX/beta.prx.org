(function (angular) {
  angular.module('angulartics.prx.count', ['angulartics', 'prx.url-translate'])
  .config(['$provide', function ($provide) {
    $provide.decorator('$analytics', ['$delegate', '$window', 'urlTranslate', function ($delegate, $window, urlTranslate) {
      var pageTrack = $delegate.pageTrack;
      var eventTrack = $delegate.eventTrack;
      var prefix = window.location.protocol + '//' + window.location.host;

      $delegate.pageTrack = function (url) {
        TheCount.logAction({action: 'view', url: prefix + urlTranslate(url)});
        pageTrack.call(this, url);
      };

      $delegate.eventTrack = function (eventName, eventValue) {
        TheCount.logAction({action: eventName, action_value: JSON.stringify(eventValue)});
        eventTrack.call(this, eventName, eventValue);
      };

      return $delegate;
    }]);
  }]);
})(window.angular);
  //     var startTime = -1;
  //     var pieceId, audioFileId, player, startedAt;
  //     var beating = false;
  //     var action_value = {};

  //     var startTimer = function(clip, seekTo){
  //         if (this && this.getTime) {
  //             player = this;
  //         }

  //         if (seekTo) {
  //             startedAt = seekTo;
  //         } else if (player && player.getTime && (sa = player.getTime())) {
  //             startedAt = sa;
  //         } else if (!startedAt) {
  //             startedAt = 0;
  //         }

  //         if (clip) {
  //             audioFileId = clip.fileId;
  //             pieceId = clip.pieceId;
  //         }

  //         if (startTime == -1){
  //             startTime = currentTime();
  //         }
  //     },

  //     stopTimer = function(){
  //         sendHeartbeat(true);
  //         startTime = -1;
  //     },

  //     currentTime = function(){
  //         return(new Date()).getTime();
  //     },

  //     handleSeek = function(clip, seekTo){
  //         stopTimer();
  //         startTimer(clip, seekTo);
  //     },

  //     sendHeartbeat = function(force){
  //         if (beating) return;
  //         beating = true;
  //         if (startTime != -1){
  //             var elapsed = currentTime() - startTime;
  //             if (( force === true && elapsed > 500) || elapsed > 15000){
  //                 action_value.audioFileId = parseInt(audioFileId);
  //                 action_value.pieceId     = parseInt(pieceId);
  //                 action_value.duration    = parseInt(elapsed/1000);
  //                 action_value.startedAt   = parseInt(startedAt);

  //                 TheCount.logAction({action:'listen', action_value: JSON.stringify(action_value)});

  //                 if (player && player.getTime) { startedAt = player.getTime(); }

  //                 startTime = currentTime();
  //             }
  //         }
  //         beating = false;
  //     };

  //     window.setInterval(sendHeartbeat, 1000);

  //     // We attempt to grab the last event, but we may or may not get it.
  //     if (window['addEventListener']) {
  //       window.addEventListener('unload', stopTimer, false);
  //     } else {
  //       window.attachEvent('unload', stopTimer, false);
  //     }
  //     window.TheCountListenActions = {'startTimer': startTimer, 'stopTimer': stopTimer, 'handleSeek': handleSeek };
  // })(window.angular);
