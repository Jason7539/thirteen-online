export default class Player {
  pixelheightDisplacement = 15;
  cardWidthDifference = 30;
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
    gameObj.y -= this.pixelheightDisplacement;
  }

  deselectedAnimation(gameObj) {
    gameObj.y += this.pixelheightDisplacement;
  }

  initEventData() {}

  printCardGameObj() {
    for (let card of this.handGameObjects) {
      console.log(card);
    }
  }
}
