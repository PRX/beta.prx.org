module.exports = function donationsService() {
  'ngInject';

  this.forAccount = function (account) {
    var map = {
      '45139': 'http://themoth.org/support?utm_source=PRX&utm_medium=Donate%20Button&utm_campaign=PRX%20-%20Moth%20-%20Donate',
      '103576': 'http://thetruthpodcast.com/Support.html',
      '551': 'http://99percentinvisible.org/donate/?utm_source=PRX&utm_medium=donate_button&utm_campaign=Radiotopia',
      '12248': 'http://loveandradio.org/?utm_source=PRX&utm_medium=donate_button&utm_campaign=Radiotopia',
      '123677': 'http://www.storycentral.org/donate/?utm_source=PRX&utm_medium=donate_button&utm_campaign=Radiotopia',
      '31': 'http://toe.prx.org/?utm_source=PRX&utm_medium=donate_button&utm_campaign=Radiotopia',
      '561': 'http://www.radiodiaries.org/donate/?utm_source=PRX&utm_medium=donate_button&utm_campaign=Radiotopia',
      '579': 'http://www.kitchensisters.org/support/?utm_source=PRX&utm_medium=donate_button&utm_campaign=Radiotopia',
      '179116': 'http://www.theheartradio.org/?utm_source=PRX&utm_medium=donate_button&utm_campaign=Radiotopia',
    };

    return map[account.id.toString()];
  };
};
