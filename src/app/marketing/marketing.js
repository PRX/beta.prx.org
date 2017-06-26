angular.module('prx.mailinglists', ['angular-hal'])
.config(function (ngHalProvider) {
  ngHalProvider.context('postmaster', function () {
    this.setRootUrl('https://prx-postmaster.herokuapp.com/alpha');
  });
})
.service('prxMailingList', function (ngHal) {
  return {
    subscribe: function (email, account_id, success, failure) {
      ngHal.context('postmaster').build('prx:subscription').then(function (sub) {
        sub.email = email;
        sub.account_id = account_id;

        return sub.save();
      }).then(success, failure);
    },
  };
});
