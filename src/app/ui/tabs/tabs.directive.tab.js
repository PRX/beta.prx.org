(function () {

  angular
    .module('prx.ui.tabs')
    .directive('xiTab', xiTab);

  // xiTab.$inject = [];

  function xiTab() {
    return {
      restrict: 'E',
      require: ['^^xiTabs','xiTab'],
      scope: false,
      link: function (scope, elem, attrs, ctrls) {
        elem.remove();
        ctrls[0].addTab(ctrls[1].tab);
      },
      controller: function ($attrs) {
        this.tab = {
          key: $attrs.key,
          disabled: $attrs.disabled,
          content: function (cb) {
            cb(angular.element('<div>'));
          }
        };
        this.setName = function (nameFn) {
          this.tab.name = nameFn;
        };
        this.setContent = function (contentFn) {
          this.tab.content = contentFn;
        };
      }
    };
  }

}());
