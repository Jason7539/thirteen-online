export default class Player {
  constructor(scene) {
    this.scene = scene;
    this.hand = [];
    this.cardSelected = [];
    this.handGameObjects = [];
  }
  addHand(hand) {
    this.hand = hand;
  }

  render(startX, startY) {
    let widthIncrement = 0;
    for (let card of this.hand) {
      widthIncrement += 25;
      let cardGameObj = this.scene.add
        .image(startX + widthIncrement, startY, "cards", card)
        .setInteractive();

      this.handGameObjects.push(cardGameObj);
    }
  }

  printCardGameObj() {
    for (let card of this.handGameObjects) {
      console.log(card);
    }
  }
}
