describe('accounts', function () {

  describe ('individual', function () {
    beforeEach(function () {
      browser.get('/accounts/89247');
    });

    it ('links to the desktop version using the user short url', function () {
      expect($('a.full-site').getAttribute('href')).toEqual('http://beta.prx.org/user/jeffreybcohen?m=false');
    });
  });


  describe ('group', function () {
    beforeEach(function () {
      browser.get('/accounts/101127');
    });

    it ('links to the desktop version using the group short url', function () {
      expect($('a.full-site').getAttribute('href')).toEqual('http://beta.prx.org/group/SO?m=false');
    });
  });

  describe ('station', function () {
    beforeEach(function () {
      browser.get('/accounts/441');
    });

    it ('links to the desktop version using the station short url', function () {
      expect($('a.full-site').getAttribute('href')).toEqual('http://beta.prx.org/station/wbur?m=false');
    });
  });
});
