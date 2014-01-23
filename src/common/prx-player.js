angular.module('prx.player', ['ngPlayerHater'])
.filter('timeCode', function () {
  var zero = timeCode(0);

  function dd(num) {
    if (num < 10) {
      return '0' + num;
    } 
    return num;
  }

  function timeCode(time) {
    var hours, minutes, seconds;
    if (isNaN(time)) {
      return zero;
    } else {
      time = ~~(time / 1000);
    }
    hours = ~~(time / 3600);
    minutes = ~~((time % 3600) / 60);
    seconds = ~~(time % 60);

    return [dd(hours), ":", dd(minutes), ":", dd(seconds)].join('');
  }

  return timeCode;
});