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

  describe ('story module', function () {

    var ngHal, story, playerHater, $rs;

    function flush() {
      $rs.$digest();
    }

    beforeEach(inject(function (_ngHal_, _playerHater_, $rootScope) {
      ngHal = _ngHal_;
      $rs = $rootScope;
      playerHater = _playerHater_;
      var storyMock = ngHal.mock('http://meta.prx.org/model/story');
      storyMock.stubFollow('audio', [ngHal.mock({_links:{enclosure:{href:'/foo.mp3'}}})]);
      storyMock.stubFollow('image', ngHal.mock({_links:{enclosure:{href:'/foo.png'}}}));
      ngHal.stubFollow('story', storyMock);
      ngHal.follow('story').then(function (doc) {
        story = doc;
      });
      flush();
    }));

    it ('can get a sound', function () {
      expect(story.sound).toBeDefined();
    });

    it ('memoizes the sound', function () {
      expect(story.sound()).toBe(story.sound());
    });

  //   xit ('pulls the sound from playerHaters nowPlaying property it is the currently playing story', inject(function (playerHater) {
  //     story = ngHal.mock('http://meta.prx.org/model/story', {id: 1, name: 'foo'});
  //     story2 = ngHal.mock('http://meta.prx.org/model/story', {id: 1, name: 'foo'});
  //     expect(story).not.toBe(story2);

  //     playerHater.nowPlaying = story.sound();

  //     expect(story2.sound()).toBe(story.sound());
  //   }));

  //   it ('can play', function () {
  //     expect(story.play).toBeDefined();
  //   });

  //   describe ('#play', function () {
  //     xit ('resumes playback if this is the nowPlaying piece', inject(function (playerHater) {
  //       spyOn(story.sound(), 'resume');
  //       playerHater.nowPlaying = story.sound();
  //       story.play();
  //       expect(story.sound().resume).toHaveBeenCalled();
  //     }));

  //     xit ('begins playback if this is not nowPlaying', inject(function (playerHater) {
  //       spyOn(playerHater, 'play');
  //       story.play();
  //       expect(playerHater.play).toHaveBeenCalled();
  //       expect(playerHater.play.mostRecentCall.args[0]).toBe(story.sound());
  //     }));
  //   });

  //   it ('can pause', function () {
  //     spyOn(playerHater, 'pause');
  //     story.pause();
  //     expect(playerHater.pause).toHaveBeenCalled();
  //   });

  //   xdescribe ('#togglePlay', function () {
  //     it ('plays if currently paused', function () {
  //       spyOn(story, 'play');
  //       story.sound().paused = true;
  //       story.togglePlay();
  //       expect(story.play).toHaveBeenCalled();
  //     });

  //     it ('pauses if currently playing', function () {
  //       spyOn(story, 'pause');
  //       story.sound().paused = false;
  //       story.togglePlay();
  //       expect(story.pause).toHaveBeenCalled();
  //     });
  //   });
  });
});