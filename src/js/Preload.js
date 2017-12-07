var InfiniteScroller = InfiniteScroller || {};

//loading the game assets
InfiniteScroller.Preload = function(){};

InfiniteScroller.Preload.prototype = {
  preload: function() {
    //show loading screen
    this.preloadBar = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'preloadbar');
    this.preloadBar.anchor.setTo(0.5);
    this.preloadBar.scale.setTo(3);

    this.load.setPreloadSprite(this.preloadBar);

    //load game assets
    this.load.spritesheet('alien', 'assets/images/manrun.png', 115.5, 155, 4);
    this.load.image('playerHandsUp', 'assets/images/manjump.png');
    this.add.image('background', 'assets/images/background.jpg');
    this.load.image('ground', 'assets/images/ground.png');
    this.load.image('grass', 'assets/images/grass.png');
    this.load.image('enemy', 'assets/images/red-square.png');
  },
  create: function() {
    this.state.start('Game');
  }
};