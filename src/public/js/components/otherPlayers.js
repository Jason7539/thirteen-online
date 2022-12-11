export default class OtherPlayers {
  playerPos = [
    [500, 50],
    [50, 275],
    [800, 275],
  ];
  constructor(scene) {
    this.scene = scene;
    this.otherPlayerCard = [];
    this.playerIconList = [];
  }

  addPlayer(player, pos) {
    this.render(player, pos);
  }

  checkTurn(player) {}

  addPlayerIcon(playerList) {
    playerList.forEach((x, i) => {
      this.playerIconList[x.name] = i;
    });
  }

  render(player, pos) {
    let card = this.scene.add
      .image(
        this.playerPos[pos][0] + 100,
        this.playerPos[pos][1],
        "cards",
        "back"
      )
      .setScale(0.5);
    let playerIcon = this.scene.add
      .image(
        this.playerPos[pos][0],
        this.playerPos[pos][1],
        `catIcon${this.playerIconList[player.name]}`
      )
      .setScale(1.5);

    let style = { backgroundColor: "yellow", color: "black" };
    let text = this.scene.add.text(0, 0, player.name, style);

    let cardNum = this.scene.add.text(0, 0, 13);
    cardNum.setFontSize(60);
    this.otherPlayerCard[player.name] = cardNum;

    Phaser.Display.Align.In.Center(cardNum, card);
    Phaser.Display.Align.In.TopCenter(text, playerIcon);

    if (player.isTurn) {
      console.log(`${player.name}'s Turn`);
    }
  }

  updateHand() {}
}
