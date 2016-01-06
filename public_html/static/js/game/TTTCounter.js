var TTTCounter = (function(){

    function TTTCounter(phaserGame, x, y) {

        // We need to call the initializer of the 'super' class
        Phaser.Sprite.call(this, phaserGame, x, y);

        // Custom variables for TTTCounter
        this.tween = undefined;
        this.score = '';
        this.game = phaserGame;

    }

    // Required for creating custom sprites
    TTTCounter.prototype = Object.create(Phaser.Sprite.prototype);
    TTTCounter.prototype.constructor = TTTCounter;

    TTTCounter.prototype.setScore = function (score, animated) {
        this.score = score.toString();
        this.render();

        if (animated) {
            this.shacke();
        }
    };

    TTTCounter.prototype.render = function () {
        // We always start with a clear sprite
        if (this.children.length != 0) {
            this.removeChildren();
        }

        // Keep track of the x-position
        var xpos = 0;

        // totalWidth = width of every sprite + padding
        var totalWidth = 0;

        // Loop over all the numbers
        for (var i = 0; i < this.score.length; i++) {
            var myChar = this.score.charAt(i);
            var sprite = new Phaser.Sprite(this.game, 0, 0, 'numbers', myChar);
            sprite.x = xpos;
            xpos += sprite.width + 2;
            totalWidth += sprite.width + 2;
            this.addChild(sprite);
        }

        // We don't want the padding at the end
        totalWidth -= 2;

        // Align the 'total number' to the center
        for (var i = 0; i < this.children.length; i++) {
            var child = this.children[i];
            child.x -= totalWidth / 2;
        }

    };

    TTTCounter.prototype.shacke = function () {
        // Add a tween to 'this'
        this.tween = this.game.add.tween(this);
        this.tween.to({
            y: [this.y + 5, this.y] // You can chain multiple values in an array
        }, 200, Phaser.Easing.Quadratic.Out);
        this.tween.start();
    };

    return TTTCounter;

})();
