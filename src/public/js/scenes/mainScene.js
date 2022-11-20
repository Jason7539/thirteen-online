import { socket } from "../client.js";

export default class mainScene extends Phaser.Scene {
  constructor() {
    super({
      key: "Game",
    });

    this.isHost = false;
    socket.emit("fetch-lobbies", (callback) => {
      this.isHost = callback.lobbies.find((lobby) => lobby.hostId === socket.id)
        ? true
        : false;
      console.log("lobbies are");
      console.log(this.isHost);
    });
  }

  preload() {
    this.load.atlas(
      "cards",
      "../../assets/cards.png",
      "../../assets/cards.json"
    );
  }

  create() {
    let cardFrames = this.textures.get("cards").getFrameNames();
    console.log(cardFrames);

    console.log();
    let card = this.add
      .image(200, 200, "cards", cardFrames[1])
      .setInteractive();

    card.on("pointerdown", () => {
      console.log("you clicked the card");
    });
    this.input.on("pointerdown", () => {
      console.log("hello world");
    });
  }
  update() {}
}
