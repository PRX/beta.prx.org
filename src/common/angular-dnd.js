var angular = require('angular');

// drag and drop components
var app = angular.module('angular-dnd', []);
module.exports = app.name;

// https://github.com/angular/angular.js/blob/ed3f799b5c43f36cd162f3cdcdbdb43c33abde07/src/ngAria/aria.js#L84-L88
var camelCase = function (input) {
  return input.replace(/-./g, function(letter, pos) {
    return letter[1].toUpperCase();
  });
};

// taken from angular compile.js
// https://github.com/angular/angular.js/blob/38d12de661c80467f78b9b7ab4060d3667ae107e/src/ng/compile.js#L2433-L2447
var PREFIX_REGEXP = /^((?:x|data)[\:\-_])/i;

var directiveNormalize = function (name) {
  return camelCase(name.replace(PREFIX_REGEXP, ''));
};

var ngDragAndDropEventDirectives = {};

// similar to events defined in angular itself
// https://github.com/angular/angular.js/blob/d488a894668839f35cc0635abdc8ff24cdd93963/src/ng/directive/ngEventDirs.js#L48
angular.forEach('dragstart dragend dragenter dragleave dragover drop'.split(' '),
  function(eventName) {
    var directiveName = directiveNormalize('ng-' + eventName);
    ngDragAndDropEventDirectives[directiveName] = ['$parse', function($parse) {
      return {
        restrict: 'A',
        compile: function ($element, attr) {
          var fn = $parse(attr[directiveName]);
          return function ngEventHandler(scope, element) {
            element.on(eventName, function(event) {
              scope.$apply( function() { fn(scope, {$event:event}); } );
            });
          };
        }
      };
    }];
  }
);

app.directive(ngDragAndDropEventDirectives);
