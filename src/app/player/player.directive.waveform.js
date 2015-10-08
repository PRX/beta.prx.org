(function () {

  angular
    .module('prx.player')
    .directive('waveform', waveform);

  waveform.$inject = ['$window', '$timeout'];

  function waveform($window, $timeout) {
    return {
      restrict: 'C',
      require: '^prxPlayer',
      link: function (scope, elem, attrs, ctrl) {
        var animated = false,
            _window = angular.element($window),
            timeout, setSound = ctrl.setSound,
            ctx = elem[0].getContext('2d');

        _window.on('resize', scheduleWaveform);

        scope.$on('$destroy', function() {
          ctrl.setSound = setSound;
          _window.off('resize', scheduleWaveform);
        });

        ctrl.setSound = function (sound) {
          setSound.call(ctrl, sound);
          if (sound && !sound.$waveform) {
            sound.$waveform = [];

            for (var i=0; i < 15; i+= 0.3) {
              sound.$waveform.push(Math.sin(i) * 49 + 51);
            }
          }
          scheduleWaveform();
        };

        function scheduleWaveform () {
          // If the user is continuously resizing,
          // we basically avoid redrawing until they have
          // stopped for at least 300ms
          if (timeout) {
            $timeout.cancel(timeout);
          }
          timeout = $timeout(generateWaveform, 300);
        }

        function generateWaveform () {
          var count = Math.floor(elem[0].offsetWidth / 5),
            waveform = ctrl.sound && ctrl.sound.$waveform;
          /* istanbul ignore if: Count will always be 0 in testing (the window does not exist)*/
          if (count && waveform) {
            elem[0].width = elem[0].offsetWidth * 2;
            elem[0].height = elem[0].offsetHeight * 2;
            if (elem[0].currentStyle) {
              ctx.strokeStyle = elem[0].currentStyle['border-color'];
            } else if (window.getComputedStyle) {
              var style = window.getComputedStyle(elem[0], null);
              ctx.strokeStyle = style['borderRightColor'] || style.getPropertyValue('border-color');
            }

            ctx.lineWidth = 6;

            var points = [];
            var perBar = (waveform.length - 1) / count;
            var i = perBar / 2, x, start;

            do {
              start = Math.min(i, waveform.length - 1);
              if (start == ~~start) {
                points.push(waveform[start]);
              } else if (start < waveform.length - 1) {
                x = start - ~~start;
                points.push(waveform[~~start] * (1 - x) + waveform[~~start+1] * (x));
              }

              i += perBar;
            } while (i <= waveform.length - 1);

            if (!animated && window.requestAnimationFrame) {
              animateIn(points, ctx, elem[0].height, elem[0].width).then(function () {
                timeout = undefined;
              });
            } else {
              angular.forEach(points, function (point, index) {
                ctx.beginPath();
                ctx.moveTo(10 * index + 5, elem[0].height);
                ctx.lineTo(10 * index + 5, (100-point) / 100 * elem[0].height);
                ctx.stroke();
              });
              timeout = undefined;
            }
          } else {
            timeout = undefined;
          }
        }

        /* istanbul ignore next: Purely display logic */
        function animateIn(points, ctx, height, width) {
          animated = ~~new Date();
          animate();
          function animate() {
            var time = Math.pow(Math.min((~~new Date() - animated) / 500, 1) - 1, 3) + 1;
            ctx.clearRect(0, 0, width, height);
            angular.forEach(points, function (point, index) {
              ctx.beginPath();
              ctx.moveTo(10 * index + 5, height);
              ctx.lineTo(10 * index + 5, Math.max(100 - point * time + (point * index/points.length * (1 - Math.pow(time, 3))), 1) / 100 * height);
              ctx.stroke();
            });
            if (time < 1) {
              window.requestAnimationFrame(animate);
            }
          }
          return $timeout(angular.noop, 510);
        }
      }
    };
  }

}());
