describe('prx.stories', function () {
  beforeEach(module('prx.stories', 'angular-hal-mock'));

  describe ('StoryCtrl', function () {
    it ('attaches the story and accounts injected to $scope', inject(function ($controller) {
      var sigil = 'sigil';
      var scope = {};
      $controller('StoryCtrl', {story: sigil, account: sigil, $scope: scope});
      expect(scope.story).toBe(sigil);
      expect(scope.account).toBe(sigil);
    }));
  });

  describe ('story state', function () {
    var state, $injector;
    beforeEach(inject(function ($state, _$injector_) {
      state = $state.get('story');
      $injector = _$injector_;
    }));

    it ('gets the story based on the storyId', function () {
      var Story = jasmine.createSpyObj('Story', ['get']);

      $injector.invoke(state.resolve.story, null, {Story: Story, $stateParams: {storyId: 123}});
      expect(Story.get.mostRecentCall.args[0]).toBe(123);
    });

    it ('gets the account based on the story', inject(function (ngHal, $rootScope) {
      var story = ngHal.mock(), account;
      story.stubFollow('account', {a:1});

      $injector.invoke(state.resolve.account, null, {story: story}).then(function (a) {
        account = a;
      });

      $rootScope.$digest();

      expect(account.a).toBe(1);
    }));
  });

  describe ('account mixin', function () {
    it ('prefetches the image url and address', inject(function (ngHal, $rootScope) {
      var account = ngHal.mock('account');
      account.stubFollow('image', ngHal.mockEnclosure('image.png'));
      account.stubFollow('address', ngHal.mock('address', {city: 'Springfield', state: "ST"}));
      account.transform();
      expect(account.imageUrl).toEqual('image.png');
      expect(account.address.toString()).toEqual("Springfield, ST");
    }));
  });

  describe ('story module', function () {

    var ngHal, story, playerHater;

    beforeEach(inject(function (_ngHal_, _playerHater_) {
      ngHal = _ngHal_;
      playerHater = _playerHater_;
      story = ngHal.mock('http://meta.prx.org/model/story');
      story.stubFollow('audio', [ngHal.mockEnclosure('/foo.mp3')]);
      story.stubFollow('image', ngHal.mockEnclosure('/foo.png'));
      story.transform();
    }));

    it ('can get a sound', function () {
      expect(story.sound).toBeDefined();
    });

    it ('memoizes the sound', function () {
      expect(story.sound()).toBe(story.sound());
    });

    it ('can play', function () {
      expect(story.play).toBeDefined();
    });

    describe ('#play', function () {
      it ('resumes playback if this is the nowPlaying piece', inject(function (playerHater) {
        spyOn(story.sound(), 'resume');
        playerHater.nowPlaying = story.sound();
        story.play();
        expect(story.sound().resume).toHaveBeenCalled();
      }));

      it ('begins playback if this is not nowPlaying', inject(function (playerHater) {
        spyOn(playerHater, 'play');
        story.play();
        expect(playerHater.play).toHaveBeenCalled();
        expect(playerHater.play.mostRecentCall.args[0]).toBe(story.sound());
      }));
    });

    it ('can pause', function () {
      spyOn(playerHater, 'pause');
      story.pause();
      expect(playerHater.pause).toHaveBeenCalled();
    });

    describe ('#togglePlay', function () {
      it ('plays if currently paused', function () {
        spyOn(story, 'play');
        story.sound().paused = true;
        story.togglePlay();
        expect(story.play).toHaveBeenCalled();
      });

      it ('pauses if currently playing', function () {
        spyOn(story, 'pause');
        story.sound().paused = false;
        story.togglePlay();
        expect(story.pause).toHaveBeenCalled();
      });
    });
  });
});