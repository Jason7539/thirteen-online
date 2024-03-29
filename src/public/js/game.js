import mainScene from "./scenes/mainScene.js";
const config = {
  type: Phaser.AUTO,
  parent: "gameRoom",
  width: 1200,
  height: 600,
  backgroundColor: "#34ebae",
  scene: [mainScene],
};

function initGame() {
  let game = new Phaser.Game(config);
  document.querySelector(".private_lobby_screen").classList.add("hide");
  document.querySelector(".public_lobby_screen").classList.add("hide");

  document.querySelector(".signup_page").classList.add("hide");
  document.querySelector(".login_page").classList.add("hide");
  document.querySelector(".lobby_screen").classList.add("hide");
  document.querySelector(".join_lobby_screen").classList.add("hide");
}
export { initGame };
