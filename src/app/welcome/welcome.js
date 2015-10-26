angular.module('prx.welcome', ['ngStorage', 'prx.player', 'prx.home']);
// .directive('prxWelcome', function () {
//   return {
//     restrict: 'E',
//     replace: true,
//     controller: 'WelcomeCtrl',
//     controllerAs: 'welcome',
//     templateUrl: 'welcome/welcome.html',
//     scope: { picks: '=' }
//   };
// })
// .service('prxWelcome', function () {
//   this.visible = true;
// })
// .controller('WelcomeCtrl', function (prxWelcome, $scope, $localStorage, prxPlayer, prxSoundFactory) {
//
//   var params = $scope.picks[0].story.toSoundParams();
//
//   this.visible = function () {
//     return !$localStorage.welcomed;
//   };
//
//   this.play = function () {
//     params.then(function (sp) {
//       var event = $scope.$emit('$play', sp);
//       if (!event.defaultPrevented) {
//         prxPlayer.play(prxSoundFactory(sp));
//       }
//     });
//   };
//
//   this.dismiss = function () {
//     $localStorage.welcomed = true;
//   };
// });
