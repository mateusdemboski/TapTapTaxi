var TapTapTaxi;
(function (TapTapTaxi) {
    var Game = (function () {
        function Game(phaserGame) {
            this.gameOverGraphic = undefined;
            this.blackOverlay = undefined;
            this.counter = undefined;
            this.logo = undefined;
            this.tapToStart = undefined;
            this.scoreCount = 0;
            // Game variables
            this.hasStarted = false;
            this.mouseTouchDown = false;
            this.isDead = false;
            this.roadCount = 0; // Number of road tiles
            this.nextObstacleIndex = 0; // Index of where the obstacle tile should render
            this.numberOfInterations = 0;
            this.taxiTargetX = 0;
            this.arrTiles = [];
            this.nextQueueIndex = 0;
            this.rightQueue = [];
            this.isJumping = false;
            this.currentJumpHeight = 0;
            this.arrObstacles = []; // Array of all the objects that are deadly for the taxi
            // Taxi variables
            this.taxi = undefined;
            this.game = phaserGame;
            // Assets
            this.btnRestart = undefined;
            this.gameOverGraphic = undefined;
            this.blackOverlay = undefined;
            this.counter = undefined;
            this.logo = undefined;
            this.tapToStart = undefined;
            this.scoreCount = 0;
            // Game variables
            this.hasStarted = false;
            this.mouseTouchDown = false;
            this.isDead = false;
            this.roadCount = 0; // Number of road tiles
            this.nextObstacleIndex = 0; // Index of where the obstacle tile should render
            this.numberOfInterations = 0;
            this.taxiTargetX = 0;
            this.arrTiles = [];
            this.nextQueueIndex = 0;
            this.rightQueue = [];
            this.sfx = {};
            // Taxi Jump variables
            this.jumpSpeed = Game.JUMP_HEIGHT;
            this.isJumping = false;
            this.currentJumpHeight = 0;
            this.arrObstacles = []; // Array of all the objects that are deadly for the taxi
            // Taxi variables
            this.taxi = undefined;
            this.taxiX = Game.TAXI_START_X;
            this.roadStartPosition = {
                x: TapTapTaxi.Main.GAME_WIDTH + 100,
                y: TapTapTaxi.Main.GAME_HEIGHT / 2 - 100
            };
        }
        Game.prototype.taxiJump = function () {
            this.currentJumpHeight -= this.jumpSpeed;
            this.jumpSpeed -= 0.5;
            if (this.jumpSpeed < -Game.JUMP_HEIGHT) {
                this.isJumping = false;
                this.jumpSpeed = Game.JUMP_HEIGHT;
            }
        };
        Game.prototype.reset = function () {
            this.taxiTargetX = 0;
            this.scoreCount = 0;
            this.counter.setScore(0, false);
            // Game variables
            this.hasStarted = false;
            this.isDead = false;
            // Jump variables
            this.jumpSpeed = Game.JUMP_HEIGHT;
            this.isJumping = false;
            this.currentJumpHeight = 0;
            // Road variables
            this.nextObstacleIndex = 0;
            this.arrObstacles = [];
            this.mouseTouchDown = false;
            // Taxi properties
            this.game.tweens.removeFrom(this.taxi);
            this.taxi.rotation = 0;
            this.taxiX = Game.TAXI_START_X;
            // Reset graphic visibility
            this.gameOverGraphic.visible = false;
            this.btnRestart.visible = false;
            this.blackOverlay.visible = false;
            this.counter.visible = false;
            this.logo.visible = true;
            this.tapToStart.visible = true;
            this.tapToStart.blinker.startBlinking();
        };
        Game.prototype.gameOver = function () {
            this.sfx.hit.play();
            this.btnRestart.visible = true;
            this.blackOverlay.alpha = 0.6;
            this.blackOverlay.visible = true;
            this.gameOverGraphic.visible = true;
            this.isDead = true;
            this.hasStarted = false;
            this.arrObstacles = [];
            var dieSpeed = Game.SPEED / 10;
            var tween_1 = this.game.add.tween(this.taxi);
            tween_1.to({
                x: this.taxi.x + 20,
                y: this.taxi.y - 40
            }, 300 * dieSpeed, Phaser.Easing.Quadratic.Out);
            var tween_2 = this.game.add.tween(this.taxi);
            tween_2.to({
                y: TapTapTaxi.Main.GAME_HEIGHT + 40
            }, 1000 * dieSpeed, Phaser.Easing.Quadratic.In);
            tween_1.chain(tween_2);
            tween_1.start();
            var tween_rotate = this.game.add.tween(this.taxi);
            tween_rotate.to({
                angle: 200
            }, 1300 * dieSpeed, Phaser.Easing.Linear.None);
            tween_rotate.start();
        };
        Game.prototype.calculatePositionOnRoadWithXPosition = function (xpos) {
            var adjacent = this.roadStartPosition.x - xpos;
            var alpha = Game.ANGLE * Math.PI / 180;
            var hypotenuse = adjacent / Math.cos(alpha);
            var opposite = Math.sin(alpha) * hypotenuse;
            return {
                x: xpos,
                y: opposite + this.roadStartPosition.y - 57 // -57 to position the taxi on the road
            };
        };
        Game.prototype.calculateNextObstacleIndex = function () {
            // We calculate an index in the future, with some randomness (between 3 and 10 tiles in the future).
            var minimumOffset = 3;
            var maximumOffset = 10;
            var num = Math.random() * (maximumOffset - minimumOffset);
            this.nextObstacleIndex = this.roadCount + Math.round(num) + minimumOffset;
        };
        Game.prototype.checkObstacles = function () {
            var i = this.arrObstacles.length - 1;
            while (i >= 0) {
                var sprite = this.arrObstacles[i];
                // We don't want to check on items that are past the taxi
                if (sprite.x < this.taxi.x - 10) {
                    this.arrObstacles.splice(i, 1);
                    // Increase the score
                    this.scoreCount++;
                    this.sfx.score.play();
                    // Set the score & animate it!
                    this.counter.setScore(this.scoreCount, true);
                }
                // Distance formula
                var dx = sprite.x - this.taxi.x;
                dx = Math.pow(dx, 2);
                var dy = (sprite.y - sprite.height / 2) - this.taxi.y; // The anchor point is located at the bottom center of the tile, we want to hittest at the center & middle
                dy = Math.pow(dy, 2);
                var distance = Math.sqrt(dx + dy);
                if (distance < 25) {
                    // We have a hit
                    if (!this.isDead) {
                        this.gameOver();
                    }
                }
                i--;
            }
        };
        Game.prototype.addTileAtIndex = function (sprite, index) {
            sprite.anchor.setTo(0.5, 1.0);
            var middle = 4; // The middle layer
            // < 0 if it's a layer below the middle
            // > 0 it's a layer above the middle
            var offset = index - middle;
            sprite.x = this.roadStartPosition.x;
            sprite.y = this.roadStartPosition.y + offset * Game.TILE_HEIGHT;
            this.arrTiles[index].addChildAt(sprite, 0);
        };
        Game.prototype.createTileAtIndex = function (tile, index) {
            var sprite = new Phaser.Sprite(this.game, 0, 0, 'gameAssets', tile);
            this.addTileAtIndex(sprite, index);
            return sprite;
        };
        Game.prototype.rightQueueOrEmpty = function () {
            var tile = 'empty';
            if (this.rightQueue.length !== 0) {
                // RightQueue is a multi-dimensional array
                tile = this.rightQueue[0][0];
                this.rightQueue[0].splice(0, 1);
                if (this.rightQueue[0].length === 0) {
                    this.rightQueue.splice(0, 1);
                }
            }
            return tile;
        };
        Game.prototype.generateRoad = function () {
            this.roadCount++; // Increment the number of road tiles
            var tile = 'tile_road_1'; // Store the basic road tile in here
            var isObstacle = false; // If deadly, we add it to the arrObstacles array
            if (this.roadCount > this.nextObstacleIndex && this.hasStarted) {
                tile = 'obstacle_1';
                isObstacle = true;
                this.calculateNextObstacleIndex();
            }
            this.addTileAtIndex(new TapTapTaxi.Building(this.game, 0, 0), 0);
            this.addTileAtIndex(new TapTapTaxi.Building(this.game, 0, 0), 3);
            this.createTileAtIndex('tile_road_1', 1);
            this.createTileAtIndex('empty', 2);
            this.createTileAtIndex('empty', 5);
            this.createTileAtIndex(this.rightQueueOrEmpty(), 6);
            this.createTileAtIndex('empty', 7);
            this.createTileAtIndex('water', 8);
            var sprite = this.createTileAtIndex(tile, 4);
            // Push the sprite to the array
            this.arrTiles.push(sprite);
            // Check if isObstacle is true, and if it is, push the sprite to the obstacle array
            if (isObstacle) {
                this.arrObstacles.push(sprite);
            }
        };
        Game.prototype.moveTilesWithSpeed = function (speed) {
            var i = this.arrTiles.length - 1;
            // Reverse loop over all the tiles
            while (i >= 0) {
                var children = this.arrTiles[i].children;
                var j = children.length - 1;
                while (j >= 0) {
                    var sprite = children[j];
                    // Move the sprite
                    sprite.x -= speed * Math.cos(Game.ANGLE * Math.PI / 180);
                    sprite.y += speed * Math.sin(Game.ANGLE * Math.PI / 180);
                    if (sprite.x < -120) {
                        this.arrTiles[i].removeChild(sprite);
                        sprite.destroy();
                    }
                    j--;
                }
                i--;
            }
        };
        Game.prototype.init = function () {
			this.game.scale.currentScaleMode = Phaser.ScaleManager.SHOW_ALL;
            this.game.scale.pageAlignVertically = true;
            this.game.scale.pageAlignHorizontally = true;
            this.game.stage.backgroundColor = '#9bd3e1';
            //this.game.add.plugin(Phaser.Plugin.Debug);
        };
        Game.prototype.preload = function () {
            // Audio
            this.game.load.audio('hit', 'static/audio/hit.wav');
            this.game.load.audio('jump', 'static/audio/jump.wav');
            this.game.load.audio('score', 'static/audio/score.wav');
            // Spritesheets
            this.game.load.atlasJSONArray('numbers', 'static/img/spritesheets/numbers.png', 'static/img/spritesheets/numbers.json');
            this.game.load.atlasJSONArray('gameAssets', 'static/img/spritesheets/gameAssets.png', 'static/img/spritesheets/gameAssets.json');
            this.game.load.atlasJSONArray('playButton', 'static/img/spritesheets/playButton.png', 'static/img/spritesheets/playButton.json');
        };
        Game.prototype.create = function () {
            // Sound Efects Object
            this.sfx = {
                hit: this.game.add.audio('hit'),
                jump: this.game.add.audio('jump'),
                score: this.game.add.audio('score')
            };
            var numberOfLayers = 9;
            for (var i = 0; i < numberOfLayers; i++) {
                var layer = new Phaser.Sprite(this.game, 0, 0);
                this.game.world.addChild(layer);
                // this.arrTiles will now hold layers
                this.arrTiles.push(layer);
            }
            this.generateRoad();
            // Add taxi in the game
            var x = this.game.world.centerX;
            var y = this.game.world.centerY;
            this.taxi = new Phaser.Sprite(this.game, x, y, 'gameAssets', 'taxi');
            this.taxi.anchor.setTo(0.5, 1.0);
            this.game.add.existing(this.taxi);
            //Game Over
            this.blackOverlay = this.game.add.graphics(0, 0);
            this.blackOverlay.beginFill(0x000000, 1);
            this.blackOverlay.drawRect(0, 0, this.game.world.width, this.game.world.height);
            this.blackOverlay.endFill();
            x = this.game.world.centerX;
            y = this.game.world.centerY - 50;
            this.gameOverGraphic = new Phaser.Sprite(this.game, x, y, 'gameAssets', 'gameOver');
            this.gameOverGraphic.anchor.setTo(0.5, 0.5);
            this.game.add.existing(this.gameOverGraphic);
            this.btnRestart = new Phaser.Button(this.game, 0, 0, 'playButton', // Key
            this.restart, // Callback
            this, // Context
            'default', // Over
            'default', // Out
            'hover', // Down
            'default' // Up
            );
            this.game.add.existing(this.btnRestart); // Add it to the world
            this.btnRestart.anchor.setTo(0.5, 0.5); // Anchor point in the middle
            this.btnRestart.x = this.game.world.centerX;
            this.btnRestart.y = this.gameOverGraphic.y + this.gameOverGraphic.height / 2 + 50;
            // Game Logo
            this.logo = this.game.add.sprite(0, 0, 'gameAssets', 'logo');
            this.logo.anchor.setTo(0.5, 0.5);
            this.logo.x = this.game.world.centerX;
            this.logo.y = 100;
            // Score Counter
            this.counter = new TapTapTaxi.Counter(this.game, 0, 0);
            this.game.add.existing(this.counter);
            this.counter.x = this.game.world.centerX;
            this.counter.y = 40;
            // Tap to start animation
            this.tapToStart = this.game.add.sprite(0, 0, 'gameAssets', 'tapToStart');
            this.tapToStart.anchor.setTo(0.5, 0.5);
            this.tapToStart.x = this.game.world.centerX;
            this.tapToStart.y = this.game.world.height - 60;
            this.tapToStart.blinker = new TapTapTaxi.Blinker(this.game, this.tapToStart);
            this.reset();
            this.generateLevel();
        };
        Game.prototype.generateLevel = function () {
            var i = 0;
            // Calculate how many tiles fit on screen
            var numberOfTiles = Math.ceil(this.game.world.width / Game.TILE_WIDTH) + 2;
            while (i <= numberOfTiles) {
                this.generateRoad();
                if (i != numberOfTiles) {
                    // Move the tiles by TILE_WIDTH
                    this.moveTilesWithSpeed(Game.TILE_WIDTH);
                }
                i++;
            }
        };
        Game.prototype.generateGreenQueue = function () {
            var retval = [];
            retval.push('green_start');
            // Random amount of middle tiles
            var middle = Math.round(Math.random() * 3);
            var i = 0;
            while (i < middle) {
                retval.push('green_middle_empty');
                i++;
            }
            // Random amount of trees
            var numberOfTrees = Math.round(Math.random() * 3);
            i = 0;
            while (i < numberOfTrees) {
                retval.push('green_middle_tree');
                i++;
            }
            // Before & after the trees we have the same amount of 'middle' tiles
            i = 0;
            while (i < middle) {
                retval.push('green_middle_empty');
                i++;
            }
            retval.push('green_end');
            return retval;
        };
        Game.prototype.calculateTaxiPosition = function () {
            var multiplier = 0.025;
            var num = Game.TAXI_START_X + (this.scoreCount * TapTapTaxi.Main.GAME_WIDTH * multiplier);
            // Limit it to 60% of the game width
            if (num > TapTapTaxi.Main.GAME_WIDTH * 0.60) {
                num = 0.60 * TapTapTaxi.Main.GAME_WIDTH;
            }
            // Assign the target X value to taxiTarget
            this.taxiTargetX = num;
            // Gradually increase taxiX to approach taxiTargetX
            if (this.taxiX < this.taxiTargetX) {
                var easing = 15;
                this.taxiX += (this.taxiTargetX - this.taxiX) / easing;
            }
        };
        Game.prototype.startGame = function () {
            this.hasStarted = true;
            this.logo.visible = false;
            this.counter.visible = true;
            this.tapToStart.visible = false;
            this.tapToStart.blinker.stopBlinking();
        };
        Game.prototype.restart = function () {
            this.reset();
        };
        Game.prototype.touchDown = function () {
            this.mouseTouchDown = true;
            if (!this.hasStarted) {
                this.startGame();
            }
            if (this.isDead) {
                return;
            }
            if (!this.isJumping) {
                this.isJumping = true;
                this.sfx.jump.play();
            }
        };
        Game.prototype.touchUp = function () {
            this.mouseTouchDown = false;
        };
        Game.prototype.generateRightQueue = function () {
            var minimumOffset = 5;
            var maximumOffset = 15;
            var num = Math.random() * (maximumOffset - minimumOffset);
            this.nextQueueIndex = this.roadCount + Math.round(num) + minimumOffset;
            this.rightQueue.push(this.generateGreenQueue());
        };
        Game.prototype.update = function () {
            if (this.game.input.activePointer.isDown) {
                if (!this.mouseTouchDown) {
                    this.touchDown();
                }
            }
            else {
                if (this.mouseTouchDown) {
                    this.touchUp();
                }
            }
            if (this.roadCount > this.nextQueueIndex) {
                this.generateRightQueue();
            }
            this.numberOfInterations++;
            if (this.numberOfInterations > Game.TILE_WIDTH / Game.SPEED) {
                this.numberOfInterations = 0;
                this.generateRoad();
            }
            if (!this.isDead) {
                if (this.isJumping) {
                    this.taxiJump();
                }
                this.calculateTaxiPosition();
                var pointOnRoad = this.calculatePositionOnRoadWithXPosition(this.taxiX);
                this.taxi.x = pointOnRoad.x;
                this.taxi.y = pointOnRoad.y + this.currentJumpHeight; // Add the currentJumpHeight to the taxi.y value
                this.checkObstacles();
            }
            this.moveTilesWithSpeed(Game.SPEED);
        };
        Game.ANGLE = 26.55;
        Game.TILE_WIDTH = 68;
        Game.TILE_HEIGHT = 63;
        Game.SPEED = 5;
        Game.TAXI_START_X = 30;
        Game.JUMP_HEIGHT = 7;
        return Game;
    })();
    TapTapTaxi.Game = Game;
})(TapTapTaxi || (TapTapTaxi = {}));
/*
var TTTGame = (function () {

    TTTGame.prototype.update = function () {

        
    };
    return TTTGame;

})();

*/ 
//# sourceMappingURL=TTTGame.js.map