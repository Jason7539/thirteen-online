export default class Player {
  static pixelDisplacement = 10;

  constructor(scene) {
    this.scene = scene;
    this.hand = [];
    this.cardSelected = [];
    this.handGameObjects = [];
  }

  // addHand will call render. registerEvents and register data
  addHand(hand) {
    this.hand = hand;
    this.render(200, 500);
    this.registerEvents();
  }

  render(startX, startY) {
    let widthIncrement = 0;
    for (let card of this.hand) {
      widthIncrement += 25;

      let cardGameObj = this.scene.add
        .image(startX + widthIncrement, startY, "cards", card)
        .setName(card)
        .setInteractive();

      this.handGameObjects.push(cardGameObj);
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

  selectedAnimation(gameObj) {
    gameObj.y -= Player.pixelDisplacement;
  }

  deselectedAnimation(gameObj) {
    gameObj.y += Player.pixelDisplacement;
  }

  initEventData() {}

  printCardGameObj() {
    for (let card of this.handGameObjects) {
      console.log(card);
    }
  }
}
