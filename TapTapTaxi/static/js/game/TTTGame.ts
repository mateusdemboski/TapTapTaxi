module TapTapTaxi {

    export class Game {

        public static ANGLE: number = 26.55;
        public static TILE_WIDTH: number = 68;
        public static TILE_HEIGHT: number = 63;
        public static SPEED: number = 5;
        public static TAXI_START_X: number = 30;
        public static JUMP_HEIGHT: number = 7;
        public game: Phaser.Game;

        // Assets
        private btnRestart: Phaser.Button;
        private gameOverGraphic = undefined;
        private blackOverlay = undefined;
        private counter = undefined;
        private logo = undefined;
        private tapToStart = undefined;
        private scoreCount: number = 0;

        // Game variables
        private hasStarted: boolean = false;
        private mouseTouchDown: boolean = false;
        private isDead: boolean = false;
        private roadCount: number = 0; // Number of road tiles
        private nextObstacleIndex: number = 0; // Index of where the obstacle tile should render
        private numberOfInterations: number = 0;
        private taxiTargetX: number = 0;
        private arrTiles: Array<any> = [];
        private nextQueueIndex: number = 0;
        private rightQueue: Array<any> = [];
        private enabledSfx: boolean = true;
        private sfx;

        // Taxi Jump variables
        private jumpSpeed: number;// = JUMP_HEIGHT;
        private isJumping: boolean = false;
        private currentJumpHeight: number = 0;

        private arrObstacles = []; // Array of all the objects that are deadly for the taxi

        // Taxi variables
        private taxi = undefined;
        private taxiX: number;// = TAXI_START_X;

        private roadStartPosition;

        public constructor(phaserGame) {
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
                x: Main.GAME_WIDTH + 100,
                y: Main.GAME_HEIGHT / 2 - 100
            };
        }

        private taxiJump(): void {
            this.currentJumpHeight -= this.jumpSpeed;
            this.jumpSpeed -= 0.5;
            if (this.jumpSpeed < -Game.JUMP_HEIGHT) {
                this.isJumping = false;
                this.jumpSpeed = Game.JUMP_HEIGHT;
            }
        }

        private reset(): void {
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
        }

        private gameOver(): void {
            if (this.enabledSfx) {
                this.sfx.hit.play();
            }

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
                y: Main.GAME_HEIGHT + 40
            }, 1000 * dieSpeed, Phaser.Easing.Quadratic.In);

            tween_1.chain(tween_2);
            tween_1.start();

            var tween_rotate = this.game.add.tween(this.taxi);
            tween_rotate.to({
                angle: 200
            }, 1300 * dieSpeed, Phaser.Easing.Linear.None);
            tween_rotate.start();
        }

        private calculatePositionOnRoadWithXPosition(xpos: number) {
            var adjacent = this.roadStartPosition.x - xpos;
            var alpha = Game.ANGLE * Math.PI / 180;
            var hypotenuse = adjacent / Math.cos(alpha);
            var opposite = Math.sin(alpha) * hypotenuse;
            return {
                x: xpos,
                y: opposite + this.roadStartPosition.y - 57 // -57 to position the taxi on the road
            };
        }

        private calculateNextObstacleIndex(): void {
            // We calculate an index in the future, with some randomness (between 3 and 10 tiles in the future).
            var minimumOffset = 3;
            var maximumOffset = 10;
            var num = Math.random() * (maximumOffset - minimumOffset);
            this.nextObstacleIndex = this.roadCount + Math.round(num) + minimumOffset;
        }

        private checkObstacles(): void {
            var i = this.arrObstacles.length - 1;

            while (i >= 0) {

                var sprite = this.arrObstacles[i];

                // We don't want to check on items that are past the taxi
                if (sprite.x < this.taxi.x - 10) {
                    this.arrObstacles.splice(i, 1);
                    // Increase the score
                    this.scoreCount++;

                    if (this.enabledSfx) {
                        this.sfx.score.play();
                    }

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
        }

        private addTileAtIndex(sprite: Phaser.Sprite, index: number): void {
            sprite.anchor.setTo(0.5, 1.0);

            var middle = 4; // The middle layer

            // < 0 if it's a layer below the middle
            // > 0 it's a layer above the middle
            var offset = index - middle;

            sprite.x = this.roadStartPosition.x;
            sprite.y = this.roadStartPosition.y + offset * Game.TILE_HEIGHT;
            this.arrTiles[index].addChildAt(sprite, 0);
        }

        private createTileAtIndex(tile: string, index: number): Phaser.Sprite {
            var sprite = new Phaser.Sprite(this.game, 0, 0, 'gameAssets', tile);

            this.addTileAtIndex(sprite, index);

            return sprite;
        }

        private rightQueueOrEmpty(): string {
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
        }

        private generateRoad(): void {
            this.roadCount++; // Increment the number of road tiles
            var tile = 'tile_road_1'; // Store the basic road tile in here
            var isObstacle = false; // If deadly, we add it to the arrObstacles array

            if (this.roadCount > this.nextObstacleIndex && this.hasStarted) {
                tile = 'obstacle_1';
                isObstacle = true;
                this.calculateNextObstacleIndex();
            }

            this.addTileAtIndex(new Building(this.game, 0, 0), 0);
            this.addTileAtIndex(new Building(this.game, 0, 0), 3);

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
        }

        private moveTilesWithSpeed(speed): void {
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
        }

        public init(): void {
            if (this.game.device.desktop) {
                this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
                this.game.scale.maxWidth = Main.GAME_WIDTH;
                this.game.scale.maxHeight = Main.GAME_HEIGHT;
            } else {
                this.game.scale.scaleMode = Phaser.ScaleManager.RESIZE;
                this.game.scale.maxWidth = Main.GAME_WIDTH;
                this.game.scale.maxHeight = Main.GAME_HEIGHT;
                this.game.scale.forceOrientation(false, true);
            }
            this.game.scale.pageAlignVertically = true;
            this.game.scale.pageAlignHorizontally = true;
            this.game.stage.backgroundColor = '#9bd3e1';
            //this.game.add.plugin(Phaser.Plugin.Debug);
        }

        public preload(): void {
            // Audio
            this.game.load.audio('hit', 'static/audio/hit.wav');
            this.game.load.audio('jump', 'static/audio/jump.wav');
            this.game.load.audio('score', 'static/audio/score.wav');

            // Spritesheets
            this.game.load.atlasJSONArray('numbers',
                'static/img/spritesheets/numbers.png',
                'static/img/spritesheets/numbers.json'
            );
            this.game.load.atlasJSONArray('gameAssets',
                'static/img/spritesheets/gameAssets.png',
                'static/img/spritesheets/gameAssets.json'
            );
            this.game.load.atlasJSONArray('playButton',
                'static/img/spritesheets/playButton.png',
                'static/img/spritesheets/playButton.json'
            );
        }

        public create(): void {
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
            this.blackOverlay.drawRect(
                0, 0,
                this.game.world.width,
                this.game.world.height);
            this.blackOverlay.endFill();


            x = this.game.world.centerX;
            y = this.game.world.centerY - 50;

            this.gameOverGraphic = new Phaser.Sprite(this.game, x, y, 'gameAssets', 'gameOver');
            this.gameOverGraphic.anchor.setTo(0.5, 0.5);
            this.game.add.existing(this.gameOverGraphic);

            this.btnRestart = new Phaser.Button(
                this.game,
                0,
                0,
                'playButton', // Key
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
            this.counter = new Counter(this.game, 0, 0);
            this.game.add.existing(this.counter);
            this.counter.x = this.game.world.centerX;
            this.counter.y = 40;

            // Tap to start animation
            this.tapToStart = this.game.add.sprite(0, 0, 'gameAssets', 'tapToStart');
            this.tapToStart.anchor.setTo(0.5, 0.5);
            this.tapToStart.x = this.game.world.centerX;
            this.tapToStart.y = this.game.world.height - 60;
            this.tapToStart.blinker = new Blinker(this.game, this.tapToStart);

            this.reset();
            this.generateLevel();
        }

        private generateLevel(): void {
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
        }

        private generateGreenQueue() {
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
        }

        private calculateTaxiPosition(): void {
            var multiplier = 0.025;
            var num = Game.TAXI_START_X + (this.scoreCount * Main.GAME_WIDTH * multiplier);

            // Limit it to 60% of the game width
            if (num > Main.GAME_WIDTH * 0.60) {
                num = 0.60 * Main.GAME_WIDTH;
            }

            // Assign the target X value to taxiTarget
            this.taxiTargetX = num;

            // Gradually increase taxiX to approach taxiTargetX
            if (this.taxiX < this.taxiTargetX) {
                var easing = 15;
                this.taxiX += (this.taxiTargetX - this.taxiX) / easing;
            }
        }

        private startGame(): void {
            this.hasStarted = true;
            this.logo.visible = false;
            this.counter.visible = true;
            this.tapToStart.visible = false;
            this.tapToStart.blinker.stopBlinking();
        }

        private restart() {
            this.reset();
        }

        private touchDown(): void {

            this.mouseTouchDown = true;

            if (!this.hasStarted) {
                this.startGame();
            }

            if (this.isDead) {
                return;
            }

            if (!this.isJumping) {
                this.isJumping = true;

                if (this.enabledSfx) {
                    this.sfx.jump.play();
                }
            }

        }

        private touchUp(): void {
            this.mouseTouchDown = false;
        }

        private generateRightQueue(): void {
            var minimumOffset = 5;
            var maximumOffset = 15;
            var num = Math.random() * (maximumOffset - minimumOffset);
            this.nextQueueIndex = this.roadCount + Math.round(num) + minimumOffset;
            this.rightQueue.push(this.generateGreenQueue());
        }

        public update(): void {
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

            var speedMultiplier = 0.025;
            var gameSpeed = Game.SPEED + Math.ceil(this.scoreCount * speedMultiplier);

            //this.moveTilesWithSpeed(gameSpeed);
            this.moveTilesWithSpeed(Game.SPEED);
        }

    }

}