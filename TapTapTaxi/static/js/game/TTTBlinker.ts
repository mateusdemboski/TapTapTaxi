module TapTapTaxi {

    export class Blinker {

        private tween: Phaser.Tween;
        private game: Phaser.Game;
        private sprite: Phaser.Sprite;

        public constructor(phaserGame: Phaser.Game, spriteToBlink: Phaser.Sprite) {
            this.tween = undefined;
            this.game = phaserGame;
            this.sprite = spriteToBlink;
        }

        public startBlinking(): void {
            this.tween = this.game.add.tween(this.sprite);
            this.tween.to({
                alpha: [0, 1]
            }, 2000, Phaser.Easing.Quadratic.Out, false, 500);
            this.tween.start();
            this.tween.loop(true);
        }

        public stopBlinking(): void {
            this.tween.stop();
        }

    }
}