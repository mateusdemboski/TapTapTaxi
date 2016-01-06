var TTTGame = (function () {

    const ANGLE = 26.55;
    const TILE_WIDTH = 68;
    const SPEED = 5;
    const TAXI_START_X = 30;
    const JUMP_HEIGHT = 7;

    function TTTGame(phaserGame) {
        this.game = phaserGame;

        // Assets
        this.gameOverGraphic = undefined;

        // Game variables
        this.hasStarted = false;
        this.mouseTouchDown = false;
        this.isDead = false;
        this.roadCount = 0; // Number of road tiles
        this.nextObstacleIndex = 0; // Index of where the obstacle tile should render
        this.numberOfInterations = 0;
        this.arrTiles = [];

        // Taxi Jump variables
        this.jumpSpeed = JUMP_HEIGHT;
        this.isJumping = false;
        this.currentJumpHeight = 0;

        this.arrObstacles = []; // Array of all the objects that are deadly for the taxi

        // Taxi variables
        this.taxi = undefined;
        this.taxiX = TAXI_START_X;

        this.roadStartPosition = {
            x: GAME_WIDTH + 100,
            y: GAME_HEIGHT / 2 - 100
        }
    }

    TTTGame.prototype.taxiJump = function () {
        this.currentJumpHeight -= this.jumpSpeed;
        this.jumpSpeed -= 0.5;
        if (this.jumpSpeed < -JUMP_HEIGHT) {
            this.isJumping = false;
            this.jumpSpeed = JUMP_HEIGHT;
        }
    }

    TTTGame.prototype.reset = function () {
         // Game variables
        this.hasStarted = false;
        this.isDead = false;

        // Jump variables
        this.jumpSpeed = JUMP_HEIGHT;
        this.isJumping = false;
        this.currentJumpHeight = 0;

        // Road variables
        this.nextObstacleIndex = 0;
        this.arrObstacles = [];

        this.mouseTouchDown = false;

        // Taxi properties
        this.game.tweens.removeFrom(this.taxi);
        this.taxi.rotation = 0;
        this.taxiX = TAXI_START_X;

        // Reset graphic visibility
        this.gameOverGraphic.visible = false;
    };

    TTTGame.prototype.gameOver = function () {

        this.gameOverGraphic.visible = true;
        this.isDead = true;
        this.hasStarted = false;
        this.arrObstacles = [];

        var dieSpeed = SPEED / 10;

        var tween_1 = this.game.add.tween(this.taxi);
        tween_1.to({
            x: this.taxi.x + 20,
            y: this.taxi.y -40
        }, 300 * dieSpeed, Phaser.Easing.Quadratic.Out);

        var tween_2 = this.game.add.tween(this.taxi);
        tween_2.to({
            y: GAME_HEIGHT + 40
        }, 1000 * dieSpeed, Phaser.Easing.Quadratic.In);

        tween_1.chain(tween_2);
        tween_1.start();

        var tween_rotate = this.game.add.tween(this.taxi);
        tween_rotate.to({
          angle: 200
        }, 1300 * dieSpeed, Phaser.Easing.Linear.None);
        tween_rotate.start();
    };

    TTTGame.prototype.calculatePositionOnRoadWithXPosition = function (xpos) {
        var adjacent = this.roadStartPosition.x - xpos;
        var alpha = ANGLE * Math.PI / 180;
        var hypotenuse = adjacent / Math.cos(alpha);
        var opposite = Math.sin(alpha) * hypotenuse;
        return {
            x: xpos,
            y: opposite + this.roadStartPosition.y - 57 // -57 to position the taxi on the road
        }
    }

    TTTGame.prototype.calculateNextObstacleIndex = function () {
        // We calculate an index in the future, with some randomness (between 3 and 10 tiles in the future).
        var minimumOffset = 3;
        var maximumOffset = 10;
        var num = Math.random() * (maximumOffset - minimumOffset);
        this.nextObstacleIndex = this.roadCount + Math.round(num) + minimumOffset;
    };

    TTTGame.prototype.checkObstacles = function () {
        var i = this.arrObstacles.length -1;

        while (i >= 0) {

            var sprite = this.arrObstacles[i];

            // We don't want to check on items that are past the taxi
            if(sprite.x < this.taxi.x - 10) {
                this.arrObstacles.splice(i, 1);
            }

            // Distance formula
            var dx = sprite.x - this.taxi.x;
            dx = Math.pow(dx, 2);
            var dy = (sprite.y - sprite.height / 2) - this.taxi.y; // The anchor point is located at the bottom center of the tile, we want to hittest at the center & middle
            dy = Math.pow(dy, 2);
            var distance = Math.sqrt(dx + dy);

            if(distance < 25) {
                // We have a hit
                if(!this.isDead) {
                    this.gameOver();
                }
            }

            i--;
        }

    };

    TTTGame.prototype.generateRoad = function () {

        this.roadCount++; // Increment the number of road tiles
        var tile = 'tile_road_1'; // Store the basic road tile in here
        var isObstacle = false; // If deadly, we add it to the arrObstacles array

        if(this.roadCount > this.nextObstacleIndex && this.hasStarted) {
            tile = 'obstacle_1';
            isObstacle = true;
            this.calculateNextObstacleIndex();
        }

        // Here we create a sprite manually and add it to the world
        // We have to use the 'addChildAt' method, because we want to add every sprite below the previous one.
        var sprite = new Phaser.Sprite(this.game, 0, 0, tile);
        this.game.world.addChildAt(sprite, 0);

        // Set the anchor to the bottom center
        sprite.anchor.setTo(0.5, 1.0);

        sprite.x = this.roadStartPosition.x;
        sprite.y = this.roadStartPosition.y;

         // Check if isObstacle is true, and if it is, push the sprite to the obstacle array
        if (isObstacle) {
            this.arrObstacles.push(sprite);
        }

        // Push the sprite to the array
        this.arrTiles.push(sprite);
    };

    TTTGame.prototype.moveTilesWithSpeed = function (speed) {
        var i = this.arrTiles.length - 1;

        // Reverse loop over all the tiles
        while (i >= 0) {
            var sprite = this.arrTiles[i];
            // Move the sprite
            sprite.x -= speed * Math.cos( ANGLE * Math.PI / 180 );
            sprite.y += speed * Math.sin(ANGLE * Math.PI / 180);

            if (sprite.x < -120) {
                this.arrTiles.splice(i, 1);
                sprite.destroy();
            }
            i--;
        }
    }

    TTTGame.prototype.init = function () {
        this.game.stage.backgroundColor = '#9bd3e1';
        this.game.add.plugin(Phaser.Plugin.Debug);
    };

    TTTGame.prototype.preload = function () {
        // This.game.load is an instance of the Phaser.Loader class
        this.game.load.image('tile_road_1', 'static/img/assets/tile_road_1.png');
        this.game.load.image('taxi', 'static/img/assets/taxi.png');
        this.game.load.image('obstacle_1', 'static/img/assets/obstacle_1.png');
        this.game.load.image('gameover', 'static/img/assets/gameover.png');
    };

    TTTGame.prototype.create = function () {
        this.generateRoad();

        var x = this.game.world.centerX;
        var y = this.game.world.centerY;
        this.taxi = new Phaser.Sprite(this.game, x, y, 'taxi');
        this.taxi.anchor.setTo(0.5, 1.0);
        this.game.add.existing(this.taxi);

        var x = this.game.world.centerX;
        var y = this.game.world.centerY - 50;

        this.gameOverGraphic = new Phaser.Sprite(this.game, x, y, 'gameover');
        this.gameOverGraphic.anchor.setTo(0.5, 0.5);
        this.game.add.existing(this.gameOverGraphic);

        this.reset();

    };

    TTTGame.prototype.touchDown = function () {
        this.mouseTouchDown = true;

        if(!this.hasStarted) {
          this.hasStarted = true;
        }

        if(this.isDead) {
            this.reset();
            return;
        }

        if (!this.isJumping) {
            this.isJumping = true;
        }
    }

    TTTGame.prototype.touchUp = function () {
        this.mouseTouchDown = false;
    }

    TTTGame.prototype.update = function () {

        if (this.game.input.activePointer.isDown) {
            if (!this.mouseTouchDown) {
                this.touchDown();
            }
        } else {
            if (this.mouseTouchDown) {
                this.touchUp();
            }
        }

        this.numberOfInterations++;
        if (this.numberOfInterations > TILE_WIDTH / SPEED) {
            this.numberOfInterations = 0;
            this.generateRoad();
        };

        if(!this.isDead) {
            if (this.isJumping) {
                this.taxiJump();
            }

            var pointOnRoad = this.calculatePositionOnRoadWithXPosition(this.taxiX);

            this.taxi.x = pointOnRoad.x;
            this.taxi.y = pointOnRoad.y + this.currentJumpHeight; // Add the currentJumpHeight to the taxi.y value

            this.checkObstacles();
        }

        this.moveTilesWithSpeed(SPEED);
    };
    return TTTGame;

})();
