module.exports = function playerFilters () {
  'ngInject';

  var zero = timeCode(0);

  function dd(num) {
    if (num < 10) {
      return '0' + num;
    }
    return num;
  }

  function timeCode(time, fmt) {
    if (typeof fmt === 'undefined') {
      fmt = 'long';
    }

    var hours, minutes, seconds;
    if (isNaN(time)) {
      return zero;
    } else {
      time = ~~(time / 1000);
    }
    hours = ~~(time / 3600);
    minutes = ~~((time % 3600) / 60);
    seconds = ~~(time % 60);

    if (fmt == 'long' || hours) {
      return [hours, ":", dd(minutes), ":", dd(seconds)].join('');
    } else {
      return [minutes, ":", dd(seconds)].join('');
    }
  }

  return timeCode;
};
