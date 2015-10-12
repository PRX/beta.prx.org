(function () {

  angular
    .module('prx.picks')
    .filter('groupStandalonePicks', _groupStandalonePicks);

  _groupStandalonePicks.$inject = [];

  function _groupStandalonePicks() {
    return function groupStandalonePicks(picks) {
      var pick;
      if (angular.isArray(picks)) {
        for (var i=0; i<picks.length; i++) {
          if (!picks[i].comment) {
            for(var j=i+1; j<picks.length; j++) {
              if (!picks[j].comment && j - 1 != i) {
                pick = picks.splice(j, 1)[0];
                picks.splice(i+1, 0, pick);
                i = j;
                break;
              } else if (j+1 == picks.length) {
                return picks;
              }
            }
          }
        }
      }
      return picks;
    };
  }

}());
