import { socket } from "../client.js";

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
  addHand(hand) {
    this.hand = hand;

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
    if (this.lastPlayed.highestCard === "") {
      this.validSelection =
        PlayerHelper.calcRepitionCount(this.cardSelected) >= 1 &&
        PlayerHelper.calcSequenceCount(this.cardSelected) >= 1 &&
        PlayerHelper.calcSequenceCount(this.cardSelected) != 2 &&
        PlayerHelper.isSequential(this.cardSelected);
    } else {
      // we have to look at the last played to tell whether it is valid or not
      this.validSelection =
        this.lastPlayed.repitition ===
          PlayerHelper.calcRepitionCount(this.cardSelected) &&
        this.lastPlayed.sequence ===
          PlayerHelper.calcSequenceCount(this.cardSelected) &&
        // Test if the selections highest card is greater than the last played highest card if they equal then compare suits
        PlayerHelper.calcFaceValue(this.lastPlayed.highestCard) <
          PlayerHelper.calcFaceValue(
            this.cardSelected[this.cardSelected.length - 1]
          )
          ? true
          : PlayerHelper.calcFaceValue(this.lastPlayed.highestCard) ===
            PlayerHelper.calcFaceValue(
              this.cardSelected[this.cardSelected.length - 1]
            )
          ? PlayerHelper.calcSuitValue(this.lastPlayed.highestCard) <
            PlayerHelper.calcSuitValue(
              this.cardSelected[this.cardSelected.length - 1]
            )
            ? true
            : false
          : false;
    }
  }

  disableButtons() {
    this.playButton.setVisible(false);
    this.passButton.setVisible(false);

    // make button not interactive
  }

  enableButtons() {
    // set button visible and allow them to be interactive
    this.playButton.setVisible(true);
    this.passButton.setVisible(true);
    this.addButtonEvents();
  }

  addButtonEvents() {
    this.playButton.on("pointerdown", () => {
      // If it's a valid selection we emit play card to server
      // and we update the player hand

      if (this.validSelection) {
        alert(this.validSelection);

        let lastPlayed = {
          repitition: PlayerHelper.calcRepitionCount(this.cardSelected),
          sequence: PlayerHelper.calcSequenceCount(this.cardSelected),
          highestCard: this.cardSelected[this.cardSelected.length - 1].name,
          cardsPlayed: this.cardSelected.map((gameObj) => gameObj.name),
        };
        socket.emit("play-card", sessionStorage.getItem("lobbyId"), lastPlayed);

        // Update hand to remove selected cards
        this.hand = this.hand.filter((cardFrameName) => {
          return !this.cardSelected
            .map((obj) => obj.name)
            .includes(cardFrameName);
        });

        alert("new hand is: " + JSON.stringify(this.hand));
        this.destroyHandGameObjects();
        this.handGameObjects = [];
        this.cardSelected = [];
        // Delete all card images
        this.render(this.handXorigin, this.handYorigin);
      } else {
        alert("not a valid play");
      }
    });
  }
  removeButtonEvents() {}

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

class PlayerHelper {
  static faceValueMap = {
    3: 1,
    4: 2,
    5: 3,
    6: 4,
    7: 5,
    8: 6,
    9: 7,
    10: 8,
    Jack: 9,
    Queen: 10,
    King: 11,
    Ace: 12,
    2: 13,
  };

  static suitValueMap = {
    spades: 1,
    clubs: 2,
    diamonds: 3,
    hearts: 4,
  };

  static calcFaceValue(cardFrameName) {
    for (let face in this.faceValueMap) {
      if (cardFrameName.includes(face)) {
        return this.faceValueMap[face];
      }
    }
    return -1;
  }

  static calcSuitValue(cardFrameName) {
    for (let suit in this.suitValueMap) {
      if (cardFrameName.includes(suit)) {
        return this.suitValueMap[suit];
      }
    }
    return -1;
  }

  // assume handGameObjects is a sequence/ called isSequential before use
  static calcSequenceCount(handGameObjects) {
    let faceValues = [];
    for (let handGameObject of handGameObjects) {
      faceValues.push(handGameObject.getData("faceValue"));

      //faceValues.push(handGameObject.faceValue);
    }

    // remove duplicates
    faceValues = [...new Set(faceValues)];
    return faceValues.length;
  }

  static isSequential(handGameObjects) {
    // put all the face values in an array
    let faceValues = [];
    for (let handGameObject of handGameObjects) {
      faceValues.push(handGameObject.getData("faceValue"));

      // faceValues.push(handGameObject.faceValue);
    }

    // remove duplcate values from faceValues
    faceValues = [...new Set(faceValues)];

    // sort faceValues
    faceValues.sort(function (a, b) {
      return a - b;
    });
    console.log("faceValues after sorting:" + faceValues);

    return faceValues.every(
      (element, index) =>
        index === faceValues.length - 1 || element + 1 === faceValues[index + 1]
    );
  }

  static calcRepitionCount(handGameObjects) {
    let dupes = {};

    // Populate dupes object
    for (let card of handGameObjects) {
      let cardFaceValue = card.getData("faceValue");
      // let cardFaceValue = card.faceValue;

      if (cardFaceValue in dupes) {
        dupes[cardFaceValue] += 1;
      } else {
        dupes[cardFaceValue] = 1;
      }
    }

    // Check if each value in dupes are the same
    let duplicateAmount = Object.values(dupes)[0];
    for (let key in dupes) {
      if (duplicateAmount !== dupes[key]) {
        return -1;
      }
    }

    return duplicateAmount;
  }
}

export { Player, PlayerHelper };
