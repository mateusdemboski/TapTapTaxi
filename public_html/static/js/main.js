const GAME_WIDTH = 480;
const GAME_HEIGHT = 640;

var state = {
  init: init,
  preload: preload,
  update: update,
  create: create
};

var phaserGame = new Phaser.Game(
  GAME_WIDTH, // Width
  GAME_HEIGHT, // Width
  Phaser.AUTO, // Renderer. Auto will switch between WebGL and Canvas
  'container', // ID For the containing tag
  state // State object
);

var taxiGame = new TTTGame(phaserGame);

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
