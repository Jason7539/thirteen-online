export default class OtherPlayers {
  playerPos = [
    [500, 50],
    [50, 275],
    [800, 275],
  ];
  constructor(scene) {
    this.scene = scene;
    this.otherPlayerCard = [];
  }

  addPlayer(playerName, pos) {
    this.render(playerName, pos);
  }

  render(playerName, pos) {
    let card = this.scene.add
      .image(
        this.playerPos[pos][0] + 100,
        this.playerPos[pos][1],
        "cards",
        "back"
      )
      .setScale(0.5);
    let playerIcon = this.scene.add
      .image(this.playerPos[pos][0], this.playerPos[pos][1], "catIcon0")
      .setScale(1.5);

    let style = { backgroundColor: "yellow", color: "black" };
    let text = this.scene.add.text(0, 0, playerName, style);

    let cardNum = this.scene.add.text(0, 0, 13);
    cardNum.setFontSize(60);
    this.otherPlayerCard[playerName] = cardNum;

    Phaser.Display.Align.In.Center(cardNum, card);
    Phaser.Display.Align.In.TopCenter(text, playerIcon);
  }

  updateHand(playerName) {}
}
