var TTTGame = (function () {

    const ANGLE = 26.55;
    const TILE_WIDTH = 68;
    const SPEED = 5;
    const TAXI_START_X = 30;
    const JUMP_HEIGHT = 7;

    function TTTGame(phaserGame) {
        this.game = phaserGame;

        this.hasStarted = false;

        this.mouseTouchDown = false;
        this.isDead = false;

        this.arrTiles = [];

        this.jumpSpeed = JUMP_HEIGHT;
        this.isJumping = false;
        this.currentJumpHeight = 0;

        // Road variables
        this.roadCount = 0; // Number of road tiles
        this.nextObstacleIndex = 0; // Index of where the obstacle tile should render
        this.arrObstacles = []; // Array of all the objects that are deadly for the taxi

        this.taxi = undefined;
        this.taxiX = TAXI_START_X;

        this.numberOfInterations = 0;
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

    TTTGame.prototype.gameOver = function () {
        this.taxi.tint = 0xff0000;
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
    };

    TTTGame.prototype.create = function () {
        this.generateRoad();

        this.taxi = new Phaser.Sprite(this.game, this.game.world.centerX, this.game.world.centerY, 'taxi');
        this.taxi.anchor.setTo(0.5, 1.0);
        this.game.add.existing(this.taxi);
    };

    TTTGame.prototype.touchDown = function () {
        this.mouseTouchDown = true;

        if(!this.hasStarted) {
          this.hasStarted = true;
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

        if (this.isJumping) {
            this.taxiJump();
        }

        var pointOnRoad = this.calculatePositionOnRoadWithXPosition(this.taxiX);

        this.taxi.x = pointOnRoad.x;
        this.taxi.y = pointOnRoad.y + this.currentJumpHeight; // Add the currentJumpHeight to the taxi.y value

        this.checkObstacles();

        this.moveTilesWithSpeed(SPEED);
    };
    return TTTGame;

})();
