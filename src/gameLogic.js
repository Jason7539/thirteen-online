class GameLogic {
  constructor(io, socket, lobbies) {
    this.io = io;
    this.socket = socket;
    this.lobbies = lobbies;
  }

  init() {
    this.socket.on("deal-cards", (lobbyId, cards) => {
      let currentLobby = this.lobbies.find((lobby) => lobby.id === lobbyId);

      let shuffledCards = Dealer.shuffleCards(cards);
      currentLobby.players = Dealer.dealCards(
        currentLobby.players,
        shuffledCards
      );

      for (let player of currentLobby.players) {
        if (player.hand.find((card) => card === "spades3")) {
          player.isTurn = true;
        }
        this.io.to(player.id).emit("delt-cards", player);
      }
    });
  }
}

class Dealer {
  static MAX_CARDS = 13;
  static shuffleCards(cards) {
    for (let i = cards.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      let temp = cards[i];

      cards[i] = cards[j];
      cards[j] = temp;
    }
    return cards;
  }

  static dealCards(players, cards) {
    let playerIndex = 0;

    while (cards.length) {
      let removedCard = cards.splice(Math.random() * cards.length, 1)[0];

      if (players[playerIndex].hand.length < 13) {
        players[playerIndex].hand.push(removedCard);
      }

      playerIndex = (playerIndex + 1) % players.length;
    }
    return players;
  }
}

export { GameLogic, Dealer };
