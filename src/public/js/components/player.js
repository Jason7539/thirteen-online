export default class Player {
  pixelheightDisplacement = 15;
  cardWidthDifference = 30;
  compare;
  handXorigin = 200;
  handYorigin = 500;

  constructor(scene) {
    this.scene = scene;
    this.hand = [];
    this.cardSelected = [];
    this.handGameObjects = [];
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

          this.deselectedAnimation(card);

          console.log(this.cardSelected.length);
        } else {
          console.log(card);
          this.cardSelected.push(card);

          this.selectedAnimation(card);
        }
      });
    }
  }

  initGameData(handGameObjects) {
    for (let gameObjects of handGameObjects) {
      let cardFrameName = gameObjects.name;
      gameObjects.setData(
        "faceValue",
        PlayerHelper.calcFaceValue(cardFrameName)
      );
      gameObjects.setData(
        "suitValue",
        PlayerHelper.calcSuitValue(cardFrameName)
      );
    }
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
      // faceValues.push(handGameObject.get("faceValue"));

      faceValues.push(handGameObject.faceValue);
    }

    // remove duplicates
    faceValues = [...new Set(faceValues)];
    return faceValues.length;
  }

  static isSequential(handGameObjects) {
    // put all the face values in an array
    let faceValues = [];
    for (let handGameObject of handGameObjects) {
      // faceValues.push(handGameObject.get("faceValue"));

      faceValues.push(handGameObject.faceValue);
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
      //let cardFaceValue = card.getData("faceValue");
      let cardFaceValue = card.faceValue;

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
