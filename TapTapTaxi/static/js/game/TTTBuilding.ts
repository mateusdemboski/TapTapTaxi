module TapTapTaxi {

    export class Building extends Phaser.Sprite {

        public game: Phaser.Game;
        private colors: Array<string>;
        private windowTypes: Array<string>;

        public constructor(phaserGame: Phaser.Game, x: number, y: number) {

            super(phaserGame, x, y, 'gameAssets', this.getRandomBase());

            this.game = phaserGame;

            this.colors = ['brown', 'beige', 'red', 'grey'];
            this.windowTypes = ['big', 'small'];

            this.buildFloors(Math.round(Math.random() * 4) + 1);
        }

        public getRandomBase(): string {
            var numberOfVariations = 4;
            var num = Math.ceil(Math.random() * numberOfVariations - 1) + 1;
            return 'building_base_' + num;
        }

        public getRandomFloorForColor(color, windowType): string {
            var numberOfVariations = 2;
            var num = Math.ceil(Math.random() * numberOfVariations - 1) + 1;
            return 'building_middle_' + windowType + '_' + color + '_' + num;
        }

        public buildFloors(numberOfFloors): void {
        
            // Keep a reference to the previous floor
            var prevFloor: any = this;

            // Get random color
            var randomColorIndex = Math.ceil(Math.random() * this.colors.length) - 1;
            var color = this.colors[randomColorIndex];

            // Get random window type
            var randomWindowTypeIndex = Math.ceil(Math.random() * this.windowTypes.length) - 1;
            var WindowType = this.windowTypes[randomWindowTypeIndex];

            for (var i = 0; i < numberOfFloors; i++) {
                var floor = this.game.make.sprite(
                    0, 0, 'gameAssets',
                    this.getRandomFloorForColor(color, WindowType) // Get a random floor
                );
                floor.anchor.setTo(0.5, 1.0);

                // There's a height difference on the base tiles and the floor tiles, hence this check
                if (prevFloor == this) {
                    floor.y = prevFloor.y - prevFloor.height / 2 - 12;
                } else {
                    floor.y = prevFloor.y - prevFloor.height / 2 + 10;
                }
                this.addChild(floor);
                prevFloor = floor;

            }
        }
    }
}