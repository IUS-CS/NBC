# Alien Breakout Architecture Document


..* The index is the file that will be ran to open the game.  
..* This is where the Phaser library will be included in the game to be used.
..* When the game is started the world will be loaded in automatically.  
..* The boot file will set the game up and load the assets.
..* The preload file loads in the spritesheet and the rest of the images that are used in the world.
..* The game file is where the mechanics of the game are implemented. 
..* In the create function the world is created, then the walk animation, the blocks, the gravity,and the physics.
..* There will be lives for the character while he is running and there is a counter to keep track of the ones he loses.
..* We will also set up the font and size of the lives counter.  
..* The update function is where the game checks for collision, moves the blocks, and jumps. 
