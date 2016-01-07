module TapTapTaxi {

    export class Main {

        public static GAME_WIDTH: number = 480;
        public static GAME_HEIGHT: number = 640;
    }

}

window.onload = () => {

    var state = {
        init: init,
        preload: preload,
        update: update,
        create: create
    };

    var phaserGame = new Phaser.Game(
        TapTapTaxi.Main.GAME_WIDTH, // Width
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

}