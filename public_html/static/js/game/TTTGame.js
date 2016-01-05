var TTTGame = (function () {

    const ANGLE = 26.55;
    const TILE_WIDTH = 68;
    const SPEED = 5;
    const TAXI_START_X = 30;
    const JUMP_HEIGHT = 7;

    function TTTGame(phaserGame) {
        this.game = phaserGame;

        this.mouseTouchDown = false;

        this.arrTiles = [];

        this.jumpSpeed = JUMP_HEIGHT;
        this.isJumping = false;
        this.currentJumpHeight = 0;

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

    TTTGame.prototype.calculatePositionOnRoadWithXPosition = function (xpos) {
        var adjacent = this.roadStartPosition.x - xpos;
        var alpha = ANGLE * Math.PI / 180;
        var hypotenuse = adjacent / Math.cos(alpha);
        var opposite = Math.sin(alpha) * hypotenuse;
        return {
            x: xpos,
            y: opposite + this.roadStartPosition.y - 57
        }
    }

    TTTGame.prototype.generateRoad = function () {
        //var sprite = this.game.add.sprite(0, 0, 'tile_road_1');
        var sprite = new Phaser.Sprite(this.game, 0, 0, 'tile_road_1');
        this.game.world.addChildAt(sprite, 0);
        sprite.anchor.setTo(0.5, 1.0);
        sprite.x = this.roadStartPosition.x;
        sprite.y = this.roadStartPosition.y;

        this.arrTiles.push(sprite);
    };

    TTTGame.prototype.moveTilesWithSpeed = function (speed) {
        var i = this.arrTiles.length - 1;
        while (i >= 0) {
            var sprite = this.arrTiles[i];
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
    };

    TTTGame.prototype.create = function () {
        this.generateRoad();
        
        this.taxi = new Phaser.Sprite(this.game, this.game.world.centerX, this.game.world.centerY, 'taxi');
        this.taxi.anchor.setTo(0.5, 1.0);
        this.game.add.existing(this.taxi);
    };

    TTTGame.prototype.touchDown = function () {
        this.mouseTouchDown = true;

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
        this.taxi.y = pointOnRoad.y + this.currentJumpHeight;

        this.moveTilesWithSpeed(SPEED);
    };
    return TTTGame;

})();