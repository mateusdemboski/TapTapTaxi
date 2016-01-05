const GAME_WIDTH = 480;
const GAME_HEIGHT = 640;

var state = {
  init: init,
  preload: preload,
  update: update,
  create: create
};

var phaserGame = new Phaser.Game(
  GAME_WIDTH,
  GAME_HEIGHT,
  Phaser.AUTO, // Auto will switch between WebGL and Canvas
  'container',
  state
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