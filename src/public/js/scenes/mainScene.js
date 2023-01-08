import Player from "../components/player.js";
import { socket } from "../client.js";
import OtherPlayers from "../components/otherPlayers.js";

// eslint-disable-next-line no-undef
export default class mainScene extends Phaser.Scene {
  lastPlayedXorigin = 550;
  lastPlayedYorigin = 250;
  cardWidthDifference = 30;

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

    this.lastPlayedCardFrames = [];
    this.lastPlayedGameObjects = [];
  }

  renderLastPlayed() {
    let widthIncrement = 0;
    for (let card of this.lastPlayedCardFrames) {
      widthIncrement += this.cardWidthDifference;
      this.lastPlayedGameObjects.push(
        this.add.image(
          this.lastPlayedXorigin + widthIncrement,
          this.lastPlayedYorigin,
          "cards",
          card
        )
      );
    }
  }

  destroyLastPlayed() {
    for (let gameObj of this.lastPlayedGameObjects) {
      gameObj.destroy();
    }
    this.lastPlayedGameObjects = [];
  }

  preload() {
    this.load.atlas(
      "cards",
      "../../assets/cards.png",
      "../../assets/cards.json"
    );

    this.load.image("star", "../../assets/star.png");
    this.load.image("catIcon0", "../../assets/catIcon0.png");
    this.load.image("catIcon1", "../../assets/catIcon1.png");
    this.load.image("catIcon2", "../../assets/catIcon2.png");
    this.load.image("catIcon3", "../../assets/catIcon3.png");

    this.load.image("pass_button", "../../assets/pass_button.png");
    this.load.image("play_button", "../../assets/play_button.png");
  }

  create() {
    let passButton = this.add.image(900, 540, "pass_button").setInteractive();
    let playButton = this.add.image(1100, 540, "play_button").setInteractive();

    let player = new Player(this, passButton, playButton);
    let otherPlayers = new OtherPlayers(this);
    player.disableButtons();

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
    socket.on(
      "delt-cards",
      (respPlayer, currentLobby, otherPlayerList, firstTurn) => {
        otherPlayers.addPlayerIcon(currentLobby);

        console.log(firstTurn);
        for (let i = 1; i < otherPlayerList.length; i++) {
          otherPlayers.addPlayer(otherPlayerList[i], i - 1);
        }

        let playerList = otherPlayerList.map(({ name }) => name);
        otherPlayers.addPlayerList(playerList);

        otherPlayers.showPlayerTurn(firstTurn);

        console.log(respPlayer.hand);
        console.log(respPlayer.isTurn);
        player.addHand(respPlayer.hand, respPlayer);
      }
    );

    // Unhide buttons/ enable buttons
    socket.on("isTurn", (lastPlayed) => {
      alert("your turn");
      player.lastPlayed = lastPlayed;
      player.registerEvents();
      player.enableButtons();
    });

    //update playerTurn
    socket.on("player-turn", (playerName) => {
      otherPlayers.removePlayerTurn();
      otherPlayers.showPlayerTurn(playerName);
    });

    // update last-played card
    socket.on("last-played", (lastPlayed, playerName) => {
      // Render the most recent played cards in the middle
      player.lastPlayed = lastPlayed;
      this.lastPlayedCardFrames = lastPlayed.cardsPlayed;
      this.destroyLastPlayed();
      this.renderLastPlayed();
      console.log("someone played:" + JSON.stringify(lastPlayed));

      let cards = lastPlayed.cardsPlayed.length;
      console.log(playerName);
      otherPlayers.updateCard(playerName, cards);

      otherPlayers.removePlayerTurn();
    });
  }
  update() {}
}
