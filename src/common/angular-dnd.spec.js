var helper = require('./spec-helper');
var dnd    = require('./angular-dnd');

describe('angular-dnd', function () {
  beforeEach(helper.module(dnd));

  describe('ngDrop', function() {

    it('should get called on drop event', inject( function($rootScope, $compile) {
      var element = $compile('<div ng-drop="dropped = true">')($rootScope);

      expect($rootScope.dropped).not.toBeDefined();

      element.triggerHandler('drop');
      expect($rootScope.dropped).toBeDefined();

    }));

  });

});
