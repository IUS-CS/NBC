var InfiniteScroller = InfiniteScroller || {};

InfiniteScroller.Game = function(){};

InfiniteScroller.Game.prototype = {
  preload: function() {
      this.game.time.advancedTiming = true;
    },
  create: function() {

    //set up background and ground layer

    this.game.world.setBounds(0, 0, 3500, this.game.height);
    this.grass = this.add.tileSprite(0,this.game.height-100,this.game.world.width,70,'grass');
    this.ground = this.add.tileSprite(0,this.game.height-70,this.game.world.width,70,'ground');
    
    //create player and walk animation
    this.player = this.game.add.sprite(this.game.width/2, this.game.height-90, 'alien');
    this.player.animations.add('walk');
    
    //create the enemies
    this.generateEnemies();

    this.game.world.bringToTop(this.grass);
    this.game.world.bringToTop(this.ground);

    //enable physics on the player and ground
    this.game.physics.arcade.enable(this.player);
    this.game.physics.arcade.enable(this.ground);

    //player gravity
    this.player.body.gravity.y = 1500;
    
    //so player can walk on ground
    this.ground.body.immovable = true;
    this.ground.body.allowGravity = false;
    
    var playerScratchImg = this.game.cache.getImage('playerHandsUp');
    this.player.animations.add('scratch');
    this.player.scratchDimensions = {width: playerScratchImg.width, height: playerScratchImg.height};
    
    this.player.standDimensions = {width: this.player.width, height: this.player.height};
    this.player.anchor.setTo(0.5, 1);
    
    //the camera will follow the player in the world
    this.game.camera.follow(this.player);
    
    //play the walking animation
    this.player.animations.play('walk', 3, true);

    //move player with cursor keys
    this.cursors = this.game.input.keyboard.createCursorKeys();
    
    //...or by swiping
    this.swipe = this.game.input.activePointer;

    //set some variables we need throughout the game
    this.hits = 0;
    this.wraps = 0;
    this.wrapping = true;
    this.stopped = false;
    this.maxHits = 5;

    //stats
    var style1 = { font: "20px Arial", fill: "#ff0"};
    var t2 = this.game.add.text(this.game.width-300, 20, "Lives:", style1);
    t2.fixedToCamera = true;

    var style2 = { font: "26px Arial", fill: "#00ff00"};
    this.hitsText = this.game.add.text(this.game.width-50, 18, "", style2);
    this.refreshStats();
    this.hitsText.fixedToCamera = true;
    
  },
  
  update: function() {
    //collision
    this.game.physics.arcade.collide(this.player, this.ground, this.playerHit, null, this);
    this.game.physics.arcade.collide(this.player, this.enemies, this.playerBit, null, this);
    
    //only respond to keys and keep the speed if the player is alive
    if(this.player.alive && !this.stopped) {
      
      this.player.body.velocity.x = 300;
      
      //We do a little math to determine whether the game world has wrapped around.
      //If so, we want to destroy everything and regenerate, so the game will remain random
      if(!this.wrapping && this.player.x < this.game.width) {
        //Not used yet, but may be useful to know how many times we've wrapped
        this.wraps++;
        
        //We only want to destroy and regenerate once per wrap, so we test with wrapping var
        this.wrapping = true;
        this.enemies.destroy();
        this.generateEnemies();
        
        //put everything back in the proper order
        this.game.world.bringToTop(this.grass);
        this.game.world.bringToTop(this.ground);
      }
      else if(this.player.x >= this.game.width) {
        this.wrapping = false;
      }
      
      //take the appropriate action for swiping up or pressing up arrow on keyboard
      //we don't wait until the swipe is finished (this.swipe.isUp),
      //  because of latency problems (it takes too long to jump before hitting an enemy)
      if (this.swipe.isDown && (this.swipe.positionDown.y > this.swipe.position.y)) {
        this.playerJump();
      }
      else if (this.cursors.up.isDown) {
        this.playerJump();
      }
    
      //The game world is infinite in the x-direction, so we wrap around.
      //We subtract padding so the player will remain in the middle of the screen when
        //wrapping, rather than going to the end of the screen first.
      this.game.world.wrap(this.player, -(this.game.width/2), false, true, false);
    }

  },
  //show updated stats values
  refreshStats: function() {
    this.hitsText.text = this.maxHits - this.hits;
  },
  playerHit: function(player, blockedLayer) {
    if(player.body.touching.right) {
      //can add other functionality here for extra obstacles later
    }
  },
  //the player has just been bitten by an enemy
  playerBit: function(player, enemy) {
    //remove the flea that bit our player so it is no longer in the way
    enemy.destroy();
    
    //update our stats
    this.hits++;
    this.refreshStats();
    
    //change sprite image
    this.player.loadTexture('playerHandsUp');
    this.player.animations.play('scratch', 10, true);
    
    //wait a couple of seconds for the hit animation to play before continuing
    this.stopped = true;
    this.player.body.velocity.x = 0;
    this.game.time.events.add(Phaser.Timer.SECOND * 0.5, this.playerAttacked, this);
  },

  gameOver: function() {
    this.game.state.start('Game');
  },

  playerJump: function() {
    //when the ground is a sprite, we need to test for "touching" instead of "blocked"
    if(this.player.body.touching.down) {
      this.player.body.velocity.y -= 700;
    }    
  },
  
  playerAttacked: function() {
    this.stopped = false;
    
    if (this.scratches >= 5) {
      //set to dead (even though our player isn't actually dead in this game, just running home)
      //doesn't affect rendering
      this.player.alive = false;
      
      //destroy everything before player runs away so there's nothing in the way
      this.enemies.destroy();

      //We switch back to the standing version of the player
      this.player.loadTexture('alien');
      this.player.animations.play('walk', 10, true); //frame rate is faster for running
      this.player.body.setSize(this.player.standDimensions.width, this.player.standDimensions.height);
      
      //...then run home
      this.player.anchor.setTo(.5, 1);
      this.player.scale.x = -1;
      this.player.body.velocity.x = -1000;

      //we want the player to run off the screen in this case
      this.game.camera.unfollow();

      //go to gameover after a few miliseconds
      this.game.time.events.add(1500, this.gameOver, this);
    } else {
      //change image and update the body size for the physics engine
      this.player.loadTexture('alien');
      this.player.animations.play('walk', 3, true);
      this.player.body.setSize(this.player.standDimensions.width, this.player.standDimensions.height);
    }
  },

  generateEnemies: function() {
    this.enemies = this.game.add.group();
    
    //enable physics in them
    this.enemies.enableBody = true;

    //phaser's random number generator
    var numEnemies = 5
    var enemy;

    for (var i = 0; i < numEnemies; i++) {
      //add sprite within an area excluding the beginning and ending
      //  of the game world so items won't suddenly appear or disappear when wrapping
      var x = this.game.rnd.integerInRange(this.game.width, this.game.world.width - this.game.width);
      enemy = this.enemies.create(x, this.game.height-115, 'enemy');

      //physics properties
      enemy.body.velocity.x = -75
      
      enemy.body.immovable = true;
      enemy.body.collideWorldBounds = false;
    }
  },
  render: function()
    {
        //this.game.debug.text(this.game.time.fps || '--', 20, 70, "#00ff00", "40px Courier");   
    }
};