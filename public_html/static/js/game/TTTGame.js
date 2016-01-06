var TTTGame = (function () {

    const ANGLE = 26.55;
    const TILE_WIDTH = 68;
    const TILE_HEIGHT = 63;
    const SPEED = 5;
    const TAXI_START_X = 30;
    const JUMP_HEIGHT = 7;

    function TTTGame(phaserGame) {
        this.game = phaserGame;

        // Assets
        this.gameOverGraphic = undefined;
        this.counter = undefined;
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
        };
    }

    TTTGame.prototype.taxiJump = function () {
        this.currentJumpHeight -= this.jumpSpeed;
        this.jumpSpeed -= 0.5;
        if (this.jumpSpeed < -JUMP_HEIGHT) {
            this.isJumping = false;
            this.jumpSpeed = JUMP_HEIGHT;
        }
    };

    TTTGame.prototype.reset = function () {

        this.taxiTargetX = 0;
        this.scoreCount = 0;
        this.counter.setScore(0, false);

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
        };
    };

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
                // Increase the score
                this.scoreCount++;

                // Set the score & animate it!
                this.counter.setScore(this.scoreCount, true);
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

    TTTGame.prototype.addTileAtIndex = function (sprite, index) {
        sprite.anchor.setTo(0.5,1.0);

        var middle = 4; // The middle layer

        // < 0 if it's a layer below the middle
        // > 0 it's a layer above the middle
        var offset = index - middle;

        sprite.x = this.roadStartPosition.x;
        sprite.y = this.roadStartPosition.y + offset * TILE_HEIGHT;
        this.arrTiles[index].addChildAt(sprite, 0);
    }

    TTTGame.prototype.createTileAtIndex = function (tile, index) {
        var sprite = new Phaser.Sprite(this.game, 0, 0, tile);

        this.addTileAtIndex(sprite, index);

        return sprite;
    };

    TTTGame.prototype.rightQueueOrEmpty = function () {
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

    TTTGame.prototype.generateRoad = function () {

        this.roadCount++; // Increment the number of road tiles
        var tile = 'tile_road_1'; // Store the basic road tile in here
        var isObstacle = false; // If deadly, we add it to the arrObstacles array

        if(this.roadCount > this.nextObstacleIndex && this.hasStarted) {
            tile = 'obstacle_1';
            isObstacle = true;
            this.calculateNextObstacleIndex();
        }

        this.addTileAtIndex(new TTTBuilding(this.game, 0, 0), 0);
        this.addTileAtIndex(new TTTBuilding(this.game, 0, 0), 3);

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

    TTTGame.prototype.moveTilesWithSpeed = function (speed) {
        var i = this.arrTiles.length - 1;

        // Reverse loop over all the tiles
        while (i >= 0) {

            var children = this.arrTiles[i].children;
            var j = children.length - 1;
            while (j >= 0) {
                var sprite = children[j];
                // Move the sprite
                sprite.x -= speed * Math.cos( ANGLE * Math.PI / 180 );
                sprite.y += speed * Math.sin(ANGLE * Math.PI / 180);

                if (sprite.x < -120) {
                    this.arrTiles[i].removeChild(sprite);
                    sprite.destroy();
                }

                j--;
            }

            i--;
        }
    };

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
        this.game.load.image('empty', 'static/img/assets/empty.png');
        this.game.load.image('building_base_1', 'static/img/assets/buildingTiles_124.png'); // Grey

        //Building assets
        this.game.load.image('building_base_2', 'static/img/assets/buildingTiles_107.png'); // Semi-Red
        this.game.load.image('building_base_3', 'static/img/assets/buildingTiles_100.png'); // Green
        this.game.load.image('building_base_4', 'static/img/assets/buildingTiles_099.png'); // Full red

        this.game.load.image('building_middle_small_brown_1', 'static/img/assets/buildingTiles_047.png'); // Small windows brown
        this.game.load.image('building_middle_small_brown_2', 'static/img/assets/buildingTiles_038.png'); // Big windows brown
        this.game.load.image('building_middle_big_brown_1', 'static/img/assets/buildingTiles_000.png'); // 2 Big windows brown
        this.game.load.image('building_middle_big_brown_2', 'static/img/assets/buildingTiles_007.png'); // 1 Big window brown

        this.game.load.image('building_middle_small_beige_1', 'static/img/assets/buildingTiles_051.png'); // Small windows beige
        this.game.load.image('building_middle_small_beige_2', 'static/img/assets/buildingTiles_044.png'); // Big windows beige
        this.game.load.image('building_middle_big_beige_1', 'static/img/assets/buildingTiles_008.png'); // 2 Big windows beige
        this.game.load.image('building_middle_big_beige_2', 'static/img/assets/buildingTiles_015.png'); // 1 Big window beige

        this.game.load.image('building_middle_small_red_1', 'static/img/assets/buildingTiles_054.png'); // Small windows red
        this.game.load.image('building_middle_small_red_2', 'static/img/assets/buildingTiles_049.png'); // Big windows red
        this.game.load.image('building_middle_big_red_1', 'static/img/assets/buildingTiles_016.png'); // 2 Big windows red
        this.game.load.image('building_middle_big_red_2', 'static/img/assets/buildingTiles_023.png'); // 1 Big window red

        this.game.load.image('building_middle_small_grey_1', 'static/img/assets/buildingTiles_056.png'); // Small windows grey
        this.game.load.image('building_middle_small_grey_2', 'static/img/assets/buildingTiles_053.png'); // Big windows grey
        this.game.load.image('building_middle_big_grey_1', 'static/img/assets/buildingTiles_024.png'); // 2 Big windows grey
        this.game.load.image('building_middle_big_grey_2', 'static/img/assets/buildingTiles_031.png'); // 1 Big window grey
        this.game.load.image('water', 'static/img/assets/water.png');
        this.game.load.image('green_start', 'static/img/assets/green_start.png');
        this.game.load.image('green_middle_empty', 'static/img/assets/green_middle_empty.png');
        this.game.load.image('green_middle_tree', 'static/img/assets/green_middle_tree.png');
        this.game.load.image('green_end', 'static/img/assets/green_end.png');
        this.game.load.atlasJSONArray('numbers',
            'static/img/spritesheets/numbers.png',
            'static/img/spritesheets/numbers.json'
        );
    };

    TTTGame.prototype.create = function () {

        var numberOfLayers = 9;

        for (var i = 0; i < numberOfLayers; i++) {
            var layer = new Phaser.Sprite(this.game, 0, 0);
            this.game.world.addChild(layer);
            // this.arrTiles will now hold layers
            this.arrTiles.push(layer);
        }

        this.generateRoad();

        var x = this.game.world.centerX;
        var y = this.game.world.centerY;
        this.taxi = new Phaser.Sprite(this.game, x, y, 'taxi');
        this.taxi.anchor.setTo(0.5, 1.0);
        this.game.add.existing(this.taxi);

        x = this.game.world.centerX;
        y = this.game.world.centerY - 50;

        this.gameOverGraphic = new Phaser.Sprite(this.game, x, y, 'gameover');
        this.gameOverGraphic.anchor.setTo(0.5, 0.5);
        this.game.add.existing(this.gameOverGraphic);

        this.counter = new TTTCounter(this.game, 0, 0);
        this.game.add.existing(this.counter);
        this.counter.x = this.game.world.centerX;
        this.counter.y = 40;

        this.reset();

    };

    TTTGame.prototype.generateGreenQueue = function () {
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

    TTTGame.prototype.calculateTaxiPosition = function () {
        var multiplier = 0.025;
        var num = TAXI_START_X + (this.scoreCount * GAME_WIDTH * multiplier);

        // Limit it to 60% of the game width
        if (num > GAME_WIDTH * 0.60) {
            num = 0.60 * GAME_WIDTH;
        }

        // Assign the target X value to taxiTarget
        this.taxiTargetX = num;

        // Gradually increase taxiX to approach taxiTargetX
        if (this.taxiX < this.taxiTargetX) {
            var easing = 15;
            this.taxiX += (this.taxiTargetX - this.taxiX) / easing;
        }

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
    };

    TTTGame.prototype.touchUp = function () {
        this.mouseTouchDown = false;
    };

    TTTGame.prototype.generateRightQueue = function () {
        var minimumOffset = 5;
        var maximumOffset = 15;
        var num = Math.random() * (maximumOffset - minimumOffset);
        this.nextQueueIndex = this.roadCount + Math.round(num) + minimumOffset;
        this.rightQueue.push(this.generateGreenQueue());
    };

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

        if (this.roadCount > this.nextQueueIndex) {
            this.generateRightQueue();
        }

        this.numberOfInterations++;
        if (this.numberOfInterations > TILE_WIDTH / SPEED) {
            this.numberOfInterations = 0;
            this.generateRoad();
        }

        if(!this.isDead) {
            if (this.isJumping) {
                this.taxiJump();
            }

            this.calculateTaxiPosition();

            var pointOnRoad = this.calculatePositionOnRoadWithXPosition(this.taxiX);

            this.taxi.x = pointOnRoad.x;
            this.taxi.y = pointOnRoad.y + this.currentJumpHeight; // Add the currentJumpHeight to the taxi.y value

            this.checkObstacles();
        }

        this.moveTilesWithSpeed(SPEED);
    };
    return TTTGame;

})();
