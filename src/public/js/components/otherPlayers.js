export default class OtherPlayers {
  playerPos = [
    [50, 275],
    [500, 50],
    [800, 275],
  ];
  constructor(scene) {
    this.scene = scene;
    this.otherPlayerCard = [];
    this.playerIconList = [];
    this.playerTurnList = [];
  }

  addPlayer(player, pos) {
    this.render(player, pos);
  }

  addPlayerList(currentPlayerList) {
    this.currentPlayerList = currentPlayerList;
  }
  showPlayerTurn(playerName) {
    let starPos = 60;
    let playerTurnPos = this.currentPlayerList.indexOf(playerName) - 1;
    if (playerTurnPos >= 0) {
      let playerTurn = this.scene.add
        .image(
          this.playerPos[playerTurnPos][0],
          this.playerPos[playerTurnPos][1] + starPos,
          "star"
        )
        .setScale(0.5);
      this.playerTurnList.push(playerTurn);
    }
  }

  removePlayerTurn() {
    for (let player of this.playerTurnList) {
      player.destroy();
    }
  }

  addPlayerIcon(playerList) {
    playerList.forEach((x, i) => {
      this.playerIconList[x.name] = i;
    });
  }

  render(player, pos) {
    let playerIcon = this.scene.add
      .image(
        this.playerPos[pos][0],
        this.playerPos[pos][1],
        `catIcon${this.playerIconList[player.name]}`
      )
      .setScale(1.5);

    let card = this.scene.add
      .image(
        this.playerPos[pos][0] + 100,
        this.playerPos[pos][1],
        "cards",
        "back"
      )
      .setScale(0.5);

    let style = { backgroundColor: "yellow", color: "black" };
    let text = this.scene.add.text(0, 0, player.name, style);

    let cardNum = this.scene.add.text(0, 0, 13);
    cardNum.setFontSize(60);
    this.otherPlayerCard[player.name] = cardNum;

    Phaser.Display.Align.In.Center(cardNum, card);
    Phaser.Display.Align.In.TopCenter(text, playerIcon);
  }

  updateCard(playerName, cardsPlayed) {
    if (playerName in this.otherPlayerCard) {
      let currentCard = Number(this.otherPlayerCard[playerName]._text);
      currentCard = currentCard - cardsPlayed;
      this.otherPlayerCard[playerName].setText(currentCard);
    }
  }
}
