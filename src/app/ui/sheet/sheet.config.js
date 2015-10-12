(function () {

  angular
    .module('prx.ui.sheet')
    .config(config);

  // config.$inject = [];

  function config() {
    // console.log("CONFIG IS HAPPENING");
    // $stateProvider
    // .decorator('views', function (state, parent) {
    //   console.log("decorating views");
    //   state.views = parent(state);
    //   if (state.views && state.views.sheet && !state.views['sheet@']) {
    //     state.views['sheet@'] = state.views.sheet;
    //   }
    //   return state.views;
    // });
    // $stateProvider.decorator('data', function (state, parent) {
    //   console.log('decorating state data');
    //   state.data = parent(state) || {};
    //
    //   console.log(state);
    //   if (state.views && typeof state.views['sheet@'] !== 'undefined') {
    //     state.data.sheetVisible = true;
    //   }
    //
    //   return state.data;
    // });
  }

}());
