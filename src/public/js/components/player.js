import { socket } from "../client.js";
import PlayerHelper from "./playerHelper.js";

export default class Player {
  pixelheightDisplacement = 15;
  cardWidthDifference = 30;
  compare;
  handXorigin = 200;
  handYorigin = 500;

  lastPlayed = {};
  validSelection = false;

  constructor(scene, passButton, playButton) {
    this.scene = scene;
    this.hand = [];
    this.cardSelected = [];
    this.handGameObjects = [];
    this.passButton = passButton;
    this.playButton = playButton;
  }

  // addHand will call render. registerEvents and register data
  addHand(hand, respPlayer) {
    this.hand = hand;
    this.respPlayer = respPlayer;

    this.hand.sort(function compare(a, b) {
      if (PlayerHelper.calcFaceValue(a) === PlayerHelper.calcFaceValue(b)) {
        return PlayerHelper.calcSuitValue(a) - PlayerHelper.calcSuitValue(b);
      } else {
        return PlayerHelper.calcFaceValue(a) - PlayerHelper.calcFaceValue(b);
      }
    });

    this.render(this.handXorigin, this.handYorigin);
    this.registerEvents();
  }

  render(startX, startY) {
    let widthIncrement = 0;
    for (let card of this.hand) {
      widthIncrement += this.cardWidthDifference;

      let cardGameObj = this.scene.add
        .image(startX + widthIncrement, startY, "cards", card)
        .setName(card)
        .setData("faceValue", PlayerHelper.calcFaceValue(card))
        .setData("suitValue", PlayerHelper.calcSuitValue(card))
        .setInteractive();

      this.handGameObjects.push(cardGameObj);
    }
  }

  destroyHandGameObjects() {
    for (let cardGameObj of this.handGameObjects) {
      cardGameObj.destroy();
    }
  }

  // Add card to cardsSelected array when clicked
  registerEvents() {
    for (let card of this.handGameObjects) {
      card.on("pointerdown", () => {
        if (this.cardSelected.includes(card)) {
          let remIndex = this.cardSelected.findIndex(
            (obj) => obj.name === card.name
          );
          this.cardSelected.splice(remIndex, 1);

          this.cardSelected.sort(this.gameObjectCompare);
          this.updateSelectedValidation();

          this.deselectedAnimation(card);

          console.log(this.cardSelected.length);
        } else {
          console.log(card);
          this.cardSelected.push(card);

          this.cardSelected.sort(this.gameObjectCompare);
          this.updateSelectedValidation();

          this.selectedAnimation(card);
        }
      });
    }
  }

  gameObjectCompare(gameObjA, gameObjB) {
    if (gameObjA.getData("faceValue") === gameObjB.getData("faceValue")) {
      return gameObjA.getData("suitValue") - gameObjB.getData("suitValue");
    } else {
      return gameObjA.getData("faceValue") - gameObjB.getData("faceValue");
    }
  }

  updateSelectedValidation() {
    // first turn/free turn = highestCard is blank
    if (!this.cardSelected.length) {
      this.validSelection = false;
    } else if (this.lastPlayed.highestCard === "") {
      this.validSelection =
        PlayerHelper.calcRepitionCount(this.cardSelected) >= 1 &&
        PlayerHelper.calcSequenceCount(this.cardSelected) >= 1 &&
        PlayerHelper.calcSequenceCount(this.cardSelected) != 2 &&
        PlayerHelper.isSequential(this.cardSelected);
    } else {
      console.log(JSON.stringify(this.cardSelected.map((obj) => obj.name)));
      // we have to look at the last played to tell whether it is valid or not
      this.validSelection =
        this.lastPlayed.repitition ===
          PlayerHelper.calcRepitionCount(this.cardSelected) &&
        this.lastPlayed.sequence ===
          PlayerHelper.calcSequenceCount(this.cardSelected) &&
        // Test if the selections highest card is greater than the last played highest card if they equal then compare suits
        PlayerHelper.calcFaceValue(this.lastPlayed.highestCard) <
          PlayerHelper.calcFaceValue(
            this.cardSelected[this.cardSelected.length - 1].name
          )
          ? true
          : PlayerHelper.calcFaceValue(this.lastPlayed.highestCard) ===
            PlayerHelper.calcFaceValue(
              this.cardSelected[this.cardSelected.length - 1].name
            )
          ? PlayerHelper.calcSuitValue(this.lastPlayed.highestCard) <
            PlayerHelper.calcSuitValue(
              this.cardSelected[this.cardSelected.length - 1].name
            )
            ? true
            : false
          : false;
    }

    if (this.lastPlayed.requiredCard) {
      this.validSelection =
        this.validSelection &&
        this.cardSelected
          .map((gameObject) => gameObject.name)
          .includes(this.lastPlayed.requiredCard);
    }
  }

  disableButtons() {
    this.playButton.setVisible(false);
    this.passButton.setVisible(false);

    this.removeButtonEvents();
  }

  enableButtons() {
    this.playButton.setVisible(true);
    this.passButton.setVisible(true);

    this.addButtonEvents();
  }

  addButtonEvents() {
    this.playButton.on("pointerdown", () => {
      if (this.validSelection) {
        alert(this.validSelection);

        let lastPlayed = {
          repitition: PlayerHelper.calcRepitionCount(this.cardSelected),
          sequence: PlayerHelper.calcSequenceCount(this.cardSelected),
          highestCard: this.cardSelected[this.cardSelected.length - 1].name,
          cardsPlayed: this.cardSelected.map((gameObj) => gameObj.name),
        };
        socket.emit(
          "play-card",
          sessionStorage.getItem("lobbyId"),
          lastPlayed,
          this.respPlayer.name
        );

        // Update hand to remove selected cards
        this.hand = this.hand.filter((cardFrameName) => {
          return !this.cardSelected
            .map((obj) => obj.name)
            .includes(cardFrameName);
        });

        this.destroyHandGameObjects();
        this.handGameObjects = [];
        this.cardSelected = [];

        this.render(this.handXorigin, this.handYorigin);
        this.registerEvents();

        this.disableButtons();
      } else {
        alert("not a valid play");
      }
    });

    this.passButton.on("pointerdown", () => {
      delete this.lastPlayed.requiredCard;

      socket.emit(
        "pass-button",
        sessionStorage.getItem("lobbyId"),
        this.lastPlayed
      );

      this.disableButtons();
    });
  }
  removeButtonEvents() {
    this.playButton.off("pointerdown");
    this.passButton.off("pointerdown");
  }

  selectedAnimation(gameObj) {
    gameObj.y -= this.pixelheightDisplacement;
  }

  deselectedAnimation(gameObj) {
    gameObj.y += this.pixelheightDisplacement;
  }

  printCardGameObj() {
    for (let card of this.handGameObjects) {
      console.log(card);
    }
  }
}

export { Player };
