describe('angular-uuid', function () {

  describe ('$uuid', function () {
    var $uuid;

    beforeEach(module('angular-uuid'));

    beforeEach(inject(function (_$uuid_) {
      $uuid = _$uuid_;
    }));

    it ('provides the $uuid object', function () {
      expect($uuid).toBeDefined();
      expect($uuid.v4).toBeDefined();
    });

  });

});
