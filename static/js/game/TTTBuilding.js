var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var TapTapTaxi;
(function (TapTapTaxi) {
    var Building = (function (_super) {
        __extends(Building, _super);
        function Building(phaserGame, x, y) {
            _super.call(this, phaserGame, x, y, 'gameAssets', this.getRandomBase());
            this.game = phaserGame;
            this.colors = ['brown', 'beige', 'red', 'grey'];
            this.windowTypes = ['big', 'small'];
            this.buildFloors(Math.round(Math.random() * 4) + 1);
        }
        Building.prototype.getRandomBase = function () {
            var numberOfVariations = 4;
            var num = Math.ceil(Math.random() * numberOfVariations - 1) + 1;
            return 'building_base_' + num;
        };
        Building.prototype.getRandomFloorForColor = function (color, windowType) {
            var numberOfVariations = 2;
            var num = Math.ceil(Math.random() * numberOfVariations - 1) + 1;
            return 'building_middle_' + windowType + '_' + color + '_' + num;
        };
        Building.prototype.buildFloors = function (numberOfFloors) {
            // Keep a reference to the previous floor
            var prevFloor = this;
            // Get random color
            var randomColorIndex = Math.ceil(Math.random() * this.colors.length) - 1;
            var color = this.colors[randomColorIndex];
            // Get random window type
            var randomWindowTypeIndex = Math.ceil(Math.random() * this.windowTypes.length) - 1;
            var WindowType = this.windowTypes[randomWindowTypeIndex];
            for (var i = 0; i < numberOfFloors; i++) {
                var floor = this.game.make.sprite(0, 0, 'gameAssets', this.getRandomFloorForColor(color, WindowType) // Get a random floor
                );
                floor.anchor.setTo(0.5, 1.0);
                // There's a height difference on the base tiles and the floor tiles, hence this check
                if (prevFloor == this) {
                    floor.y = prevFloor.y - prevFloor.height / 2 - 12;
                }
                else {
                    floor.y = prevFloor.y - prevFloor.height / 2 + 10;
                }
                this.addChild(floor);
                prevFloor = floor;
            }
        };
        return Building;
    })(Phaser.Sprite);
    TapTapTaxi.Building = Building;
})(TapTapTaxi || (TapTapTaxi = {}));
//# sourceMappingURL=TTTBuilding.js.map