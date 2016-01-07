var TapTapTaxi;
(function (TapTapTaxi) {
    var Main = (function () {
        function Main() {
        }
        Main.GAME_WIDTH = 480;
        Main.GAME_HEIGHT = 640;
        return Main;
    })();
    TapTapTaxi.Main = Main;
})(TapTapTaxi || (TapTapTaxi = {}));
window.onload = function () {
    var state = {
        init: init,
        preload: preload,
        update: update,
        create: create
    };
    var phaserGame = new Phaser.Game(TapTapTaxi.Main.GAME_WIDTH, // Width
    TapTapTaxi.Main.GAME_HEIGHT, // Width
    Phaser.AUTO, // Renderer. Auto will switch between WebGL and Canvas
    'container', // ID For the containing tag
    state // State object
    );
    var taxiGame = new TapTapTaxi.Game(phaserGame);
    function init() {
        taxiGame.init();
    }
    function preload() {
        taxiGame.preload();
    }
    function update() {
        taxiGame.update();
    }
    function create() {
        taxiGame.create();
    }
};
//# sourceMappingURL=main.js.map