xdescribe("prx.stories.model", function () {
  beforeEach(module('prx.stories.model', 'angular-hal-mock'));
  describe ('PRXStory', function () {
    var PRXStory;
    beforeEach(inject(function (_PRXStory_) {
      PRXStory = _PRXStory_;
    }));

    describe ('constructor', function () {
      var ngHal;
      beforeEach(inject(function (_ngHal_) {
        ngHal = _ngHal_;
      }));

      it ('is callable', function () {
        new PRXStory();
      });

      it ('accepts a hal document', function () {
        var doc = ngHal.mock({});
        new PRXStory(doc);
      });

      it ('copies the story attributes from a passed hal document', function () {
        var doc = ngHal.mock({id: 212});
        expect(new PRXStory(doc).id).toEqual(212);
      });

      it ('pulls an associated prx:image from passed hal documents', function () {
        var doc = ngHal.mock({
          _links: {
            'prx:image': {
              href: '/foo'
            }
          }
        });
        doc.stubFollow('prx:image', ngHal.mock({
          caption: 'terrific'
        }));

        var story = new PRXStory(doc);
        expect(story.image().then(function (img) {
          return img.caption;
        })).toResolveTo('terrific');
      });
    });

    describe ('static methods', function () {
      it ('has a deserialize method', function () {
        PRXStory.deserialize({});
      });

      it ('succesfully pulls the attributes from deserialized objects', function () {
        var story = PRXStory.deserialize({title: 'foo', duration: 10});
        expect(story.title).toEqual('foo');
        expect(story.duration).toEqual(10);
      });

      it ('includes all specified fields in resulting object', function () {
        var obj = {};
        angular.forEach(PRXStory.FIELDS, function (field) {
          obj[field] = Math.random(200);
        });
        var result = PRXStory.deserialize(obj);
        angular.forEach(PRXStory.FIELDS, function (field) {
          expect(result[field]).toEqual(obj[field]);
        });
      });

      it ('does not include fields that are excluded from the whitelist', function () {
        var obj = {'neverGonnaBeAField': 123};
        expect(PRXStory.deserialize(obj).neverGonnaBeAField).not.toBeDefined();
      });
    });

    describe ('instance methods', function () {
      var story;

      beforeEach(function () {
        story = PRXStory.deserialize({title: 'foo', duration: 10});
      });

      describe ('#serialize', function () {
        it ('is callable', function () {
          story.serialize();
        });

        it ('includes object data in serialized representation', function () {
          story.title = "ASDF";
          expect(story.serialize().title).toEqual("ASDF");
        });

        it ('includes only whitelisted fields in serialized form', function () {
          story.neverGonnaBeAField = '123';
          expect(story.serialize().neverGonnaBeAField).not.toBeDefined();
        });

        it ('can be round-tripped', function () {
          story.title = 'a title';
          expect(PRXStory.deserialize(story.serialize()).title).toEqual('a title');
        });

        it ('can round trip image', inject(function (PRXImage) {
          var image = PRXImage.deserialize({caption: 'a caption'});
          story.image(image);
          expect(PRXStory.deserialize(story.serialize()).image().then(function (img) {
            return img.caption;
          })).toResolveTo('a caption');
        }));
      });

      describe ('#image()', function () {
        it ('is callable', function () {
          story.image();
        });

        it ('can set image', inject(function (PRXImage) {
          var image = new PRXImage();
          story.image(image);
          expect(story.image()).toEqual(image);
        }));

        it ('returns undefined when there is no image', function () {
          expect(story.image()).not.toBeDefined();
        });
      });
    });
  });

  describe ('PRXImage', function () {
    var PRXImage, $q, $scope, URL, ngHal;
    beforeEach(inject(function (_PRXImage_, _$q_, $rootScope, _URL_, _ngHal_) {
      PRXImage = _PRXImage_;
      $q = _$q_;
      $scope = $rootScope;
      URL = _URL_;
      ngHal = _ngHal_;
    }));

    describe ('persisted', function () {
      var imageObj;
      beforeEach(function () {
        imageObj = ngHal.mock({
          _links: {
            self: {
              href: "/api/v1/story_images/173037",
              profile: "http://meta.prx.org/model/image/story"
            },
            enclosure: {
              href: "/pub/8cc702ad0b9c029986cd608e241bf8bc/0/web/user_image/18670/medium/27709_122076281156821_100000633491172_176838_3515366_n.jpg",
              type: "image/jpeg"
            }
          },
          id: Math.floor(Math.random() * 10000),
          filename: "27709_122076281156821_100000633491172_176838_3515366_n.jpg",
          size: 18340,
          caption: "The Immediate Aftermath",
          credit: ""
        });
      });

      it ('constructs an image from a HAL document', function () {
        var image = new PRXImage(imageObj);
      });

      it ('pulls attributes from the HAL Document', function () {
        var image = new PRXImage(imageObj);
        expect(image.id).toEqual(imageObj.id);
      });

      it ('pulls the URL from a document if it exists', function () {
        var image = new PRXImage(imageObj);
        expect(image.url).toEqual('/pub/8cc702ad0b9c029986cd608e241bf8bc/0/web/user_image/18670/medium/27709_122076281156821_100000633491172_176838_3515366_n.jpg');
      });

      describe ('deserializing', function () {
        it ('has a deserialize method', function () {
          PRXImage.deserialize({});
        });

        it ('succesfully pulls the attributes from deserialized objects', function () {
          var story = PRXImage.deserialize({id: 42, filename: 'file.name'});
          expect(story.id).toEqual(42);
          expect(story.filename).toEqual('file.name');
        });
      });

      describe ('serializing', function () {
        it ('has a serialize method', function () {
          var image = new PRXImage();
          image.serialize();
        });

        it ('includes FIELDS data from the object', function () {
          var image = new PRXImage(imageObj);
          var serialized = image.serialize();
          angular.forEach(PRXImage.FIELDS, function (field) {
            expect(serialized[field]).toEqual(imageObj[field]);
          });
        });

        it ('includes only whitelisted fields in serialized form', function () {
          var image = new PRXImage(imageObj);
          image.neverGonnaBeAField = '123';

          expect(image.serialize().neverGonnaBeAField).not.toBeDefined();
        });
      });
    });

    describe ('being uploaded', function () {
      it ('has a fromUpload static method', function () {
        PRXImage.fromUpload($q.when());
      });

      it ('copies progress from the upload', function () {
        var deferred = $q.defer();
        var image = PRXImage.fromUpload(deferred.promise);
        deferred.notify(0.5);
        $scope.$digest();
        expect(image.progress).toEqual(0.5);
        deferred.notify(0.75);
        $scope.$digest();
        expect(image.progress).toEqual(0.75);
      });

      it ('is in the uploading state until the upload is complete', function () {
        var deferred = $q.defer();
        var image = PRXImage.fromUpload(deferred.promise);
        expect(image.status).toEqual('uploading');
      });

      it ('is uploaded once the upload is complete', function () {
        var image = PRXImage.fromUpload($q.when('file'));
        $scope.$digest();
        expect(image.status).toEqual('uploaded');
      });

      it ('is error if the upload fails', function () {
        var image = PRXImage.fromUpload($q.reject('file'));
        $scope.$digest();
        expect(image.status).toEqual('error');
      });

      it ('is persisted once written to the server');

      it ('generates a URL from the blob while uploading', function () {
        spyOn(URL, 'createObjectURL').and.returnValue('sigil');
        var promise = $q.defer().promise;
        promise.file = 'fileProperty';
        var image = PRXImage.fromUpload(promise);
        expect(URL.createObjectURL).toHaveBeenCalled();
        expect(URL.createObjectURL.calls.mostRecent().args[0]).toEqual('fileProperty');
        expect(image.url).toEqual('sigil');
      });

      it ('updates the URL to the server URL once upload is complete');
    });
  });
});
