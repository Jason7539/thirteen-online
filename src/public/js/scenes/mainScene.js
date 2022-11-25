import Player from "../components/player.js";
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
    });
  }

  preload() {
    this.load.atlas(
      "cards",
      "../../assets/cards.png",
      "../../assets/cards.json"
    );

    this.load.image("pass_button", "../../assets/pass_button.png");
    this.load.image("play_button", "../../assets/play_button.png");
  }

  create() {
    let pass_button = this.add.image(900, 540, "pass_button").setInteractive();
    let play_button = this.add.image(1100, 540, "play_button").setInteractive();
    let player = new Player(this);

    pass_button.on("pointerdown", () => {
      alert("you click pass");
    });

    let cardFrames = this.textures.get("cards").getFrameNames();

    cardFrames.splice(cardFrames.indexOf("joker"), 1);
    cardFrames.splice(cardFrames.indexOf("back"), 1);

    if (this.isHost) {
      this.dealText = this.add
        .text(75, 350, ["DEAL CARDS"])
        .setFontSize(18)
        .setFontFamily("Trebuchet MS")
        .setColor("#000000")
        .setInteractive();

      this.dealText.on("pointerdown", () => {
        socket.emit(
          "deal-cards",
          sessionStorage.getItem("lobbyId"),
          cardFrames
        );
        this.dealText.destroy();
      });
    }

    // Init each players hand after host selects deal
    socket.on("delt-cards", (respPlayer) => {
      console.log(respPlayer.hand);
      console.log(respPlayer.isTurn);
      player.addHand(respPlayer.hand);
    });

    // let card = this.add
    //   .image(200, 500, "cards", cardFrames[1])
    //   .setInteractive();

    // card.on("pointerdown", () => {
    //   console.log("you clicked the card");
    // });
    // this.input.on("pointerdown", () => {
    //   console.log("hello world");
    // });
  }
  update() {}
}