angular.module('prx.stories.model', ['prx.stories', 'prx.upload'])
.factory('PRXStory', function (PRXImage, $q) {

  function PRXStory(data) {
    if (angular.isDefined(data)) {
      angular.forEach(PRXStory.FIELDS, function(field) {
        if (angular.isDefined(data[field])) {
          this[field] = data[field];
        }
      }, this);
      angular.forEach(PRXStory.MEMBERS, function (deserializer, key) {
        if (angular.isDefined(data[key])) {
          this[key] = deserializer(data[key]);
        }
      }, this);
      if (data && data.follow) {
        this.$image = data.follow('prx:image').then(function (imgDoc) {
          return new PRXImage(imgDoc);
        }, function () {
          return false;
        });
      }
    }
  }
  PRXStory.prototype.constructor = PRXStory;
  PRXStory.prototype.serialize = function () {
    var result = {};
    angular.forEach(PRXStory.FIELDS, function (field) {
      result[field] = this[field];
    }, this);
    angular.forEach(PRXStory.MEMBERS, function (_, member) {
      if (angular.isDefined(this[member])) {
        result[member] = this[member].serialize();
      }
    }, this);

    return result;
  };
  PRXStory.prototype.image = function (setImage) {
    if (setImage) {
      this.$image = $q.when(setImage);
    } else {
      return this.$image;
    }
  };

  PRXStory.deserialize = function (data) {
    return new PRXStory(data);
  };

  PRXStory.FIELDS = "id title shortDescription publishedAt duration points description relatedWebsite broadcastHistory timingAndCues contentAdvisory tags license".split(' ');
  PRXStory.MEMBERS = {'$image': PRXImage.deserialize};

  return PRXStory;
})
.factory('PRXImage', function (URL) {
  function PRXImage(halDocument) {
    if (halDocument) {
      this._copyAttrs(halDocument);
      this.url = halDocument.links.url('enclosure');
    }
  }

  PRXImage.FIELDS = "id filename size caption credit".split(' ');
  PRXImage.prototype.serialize = function () {
    return this._copyAttrs(this, {});
  };

  PRXImage.prototype._copyAttrs = function (data, target) {
    target = target || this;
    angular.forEach(PRXImage.FIELDS, function(field) {
      if (angular.isDefined(data[field])) {
        this[field] = data[field];
      }
    }, target);
    return target;
  };

  PRXImage.deserialize = function (data) {
    var image = new PRXImage();
    image._copyAttrs(data);
    return image;
  };

  PRXImage.fromUpload = function (upload) {
    var image = new PRXImage();

    image.status = 'uploading';
    image.url = URL.createObjectURL(upload.file);

    upload.then(function () {
      image.status = 'uploaded';
    }, function () {
      image.status = 'error';
    }, function (progress) {
      image.progress = progress;
    });

    return image;
  };

  return PRXImage;
});
