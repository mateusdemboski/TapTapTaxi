var TapTapTaxi;
(function (TapTapTaxi) {
    var Blinker = (function () {
        function Blinker(phaserGame, spriteToBlink) {
            this.tween = undefined;
            this.game = phaserGame;
            this.sprite = spriteToBlink;
        }
        Blinker.prototype.startBlinking = function () {
            this.tween = this.game.add.tween(this.sprite);
            this.tween.to({
                alpha: [0, 1]
            }, 2000, Phaser.Easing.Quadratic.Out, false, 500);
            this.tween.start();
            this.tween.loop(true);
        };
        Blinker.prototype.stopBlinking = function () {
            this.tween.stop();
        };
        return Blinker;
    })();
    TapTapTaxi.Blinker = Blinker;
})(TapTapTaxi || (TapTapTaxi = {}));
//# sourceMappingURL=TTTBlinker.js.map