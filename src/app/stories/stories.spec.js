xdescribe('prx.stories', function () {

  beforeEach(module('prx.stories'));
  beforeEach(module('angular-hal-mock'));


  describe ('StoryCtrl', function () {
    it ('attaches the story injected to $scope', inject(function ($controller) {
      var sigil = 'sigil';
      var scope = {};
      $controller('StoryCtrl', {story: sigil, titleSize: 'foo', $scope: scope});
      expect(scope.story).toBe(sigil);
    }));
  });

  describe ('story state', function () {
    var state;
    beforeEach(inject(function ($state) {
      state = $state.get('story');
    }));
  });

  describe ('story module', function () {

    var ngHal, story, playerHater;

    beforeEach(inject(function (_ngHal_, _playerHater_) {
      ngHal = _ngHal_;
      playerHater = _playerHater_;
      story = ngHal.mock('http://meta.prx.org/model/story', {$audioFiles: [{url: '/foo.mp3' }]});
    }));

    it ('can get a sound', function () {
      expect(story.sound).toBeDefined();
    });

    xit ('memoizes the sound', function () {
      expect(story.sound()).toBe(story.sound());
    });

    xit ('pulls the sound from playerHaters nowPlaying property it is the currently playing story', inject(function (playerHater) {
      story = ngHal.mock('http://meta.prx.org/model/story', {id: 1, name: 'foo'});
      story2 = ngHal.mock('http://meta.prx.org/model/story', {id: 1, name: 'foo'});
      expect(story).not.toBe(story2);

      playerHater.nowPlaying = story.sound();

      expect(story2.sound()).toBe(story.sound());
    }));

    it ('can play', function () {
      expect(story.play).toBeDefined();
    });

    describe ('#play', function () {
      xit ('resumes playback if this is the nowPlaying piece', inject(function (playerHater) {
        spyOn(story.sound(), 'resume');
        playerHater.nowPlaying = story.sound();
        story.play();
        expect(story.sound().resume).toHaveBeenCalled();
      }));

      xit ('begins playback if this is not nowPlaying', inject(function (playerHater) {
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

    xdescribe ('#togglePlay', function () {
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