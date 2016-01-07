var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var TapTapTaxi;
(function (TapTapTaxi) {
    var Counter = (function (_super) {
        __extends(Counter, _super);
        function Counter(phaserGame, x, y) {
            // We need to call the initializer of the 'super' class
            _super.call(this, phaserGame, x, y);
            // Custom variables for TTTCounter
            this.tween = undefined;
            this.score = '';
            this.game = phaserGame;
        }
        Counter.prototype.setScore = function (score, animated) {
            this.score = score.toString();
            this.render();
            if (animated) {
                this.shacke();
            }
        };
        Counter.prototype.render = function () {
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
        Counter.prototype.shacke = function () {
            // Add a tween to 'this'
            this.tween = this.game.add.tween(this);
            this.tween.to({
                y: [this.y + 5, this.y] // You can chain multiple values in an array
            }, 200, Phaser.Easing.Quadratic.Out);
            this.tween.start();
        };
        return Counter;
    })(Phaser.Sprite);
    TapTapTaxi.Counter = Counter;
})(TapTapTaxi || (TapTapTaxi = {}));
//# sourceMappingURL=TTTCounter.js.map