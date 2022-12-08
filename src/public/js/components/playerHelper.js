export default class PlayerHelper {
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
    let faceValues = [];
    for (let handGameObject of handGameObjects) {
      faceValues.push(handGameObject.getData("faceValue"));
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

  static getLowestCard(cardFrameNames) {
    return cardFrameNames.sort(PlayerHelper.cardFrameNameCompare)[0];
  }

  static cardFrameNameCompare(cardA, cardB) {
    if (
      PlayerHelper.calcFaceValue(cardA) === PlayerHelper.calcFaceValue(cardB)
    ) {
      return (
        PlayerHelper.calcSuitValue(cardA) - PlayerHelper.calcSuitValue(cardB)
      );
    } else {
      return (
        PlayerHelper.calcFaceValue(cardA) - PlayerHelper.calcFaceValue(cardB)
      );
    }
  }
}
