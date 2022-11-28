// TODO: add a destructor upon socket disconnect
class GameLogic {
  constructor(io, socket, lobbies) {
    this.io = io;
    this.socket = socket;
    this.lobbies = lobbies;
  }

  init() {
    this.socket.on("deal-cards", (lobbyId, cards) => {
      let currentLobby = this.lobbies.find((lobby) => lobby.id === lobbyId);
      currentLobby.playersInRound = currentLobby.players;

      let shuffledCards = Dealer.shuffleCards(cards);
      currentLobby.players = Dealer.dealCards(
        currentLobby.players,
        shuffledCards
      );

      let names = currentLobby.playersInRound.map((player) => player.name);
      console.log("Players in the current round is: " + JSON.stringify(names));

      // TODO: update the first players turn the case spade3 is not delt players < 4
      //Find the first Players turn. start if they have spade3
      for (let player of currentLobby.players) {
        if (player.hand.find((card) => card === "spades3")) {
          player.isTurn = true;
          // emit is turn for that player/ enable buttons and last played card for player

          let lastPlayed = {
            repitition: 0,
            sequence: 0,
            highestCard: "",
            cardsPlayed: [],
          };
          this.io.to(player.id).emit("isTurn", lastPlayed);

          currentLobby.currentPlayerIndex =
            currentLobby.playersInRound.findIndex(
              (elm) => elm.id === player.id
            );
        }
        this.io.to(player.id).emit("delt-cards", player);
      }
    });

    this.socket.on("play-card", (lobbyId, lastPlayed) => {
      // emit latPlayed to everyone
      console.log("just played: " + JSON.stringify(lastPlayed));

      // sends last played. so all clients renders the most recent played card
      this.io.to(lobbyId).emit("last-played", lastPlayed);

      // send isTurn to the next player
      // have an inner array for the current round of players
      let currentLobby = this.lobbies.find((lobby) => lobby.id === lobbyId);

      currentLobby.currentPlayerIndex += 1;
      currentLobby.currentPlayerIndex %= currentLobby.playersInRound.length;
      console.log("next turn is :" + currentLobby.currentPlayerIndex);
      let newPlayerTurn =
        currentLobby.playersInRound[currentLobby.currentPlayerIndex];
      this.io.to(newPlayerTurn.id).emit("isTurn", lastPlayed);
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

      if (players[playerIndex].hand.length < Dealer.MAX_CARDS) {
        players[playerIndex].hand.push(removedCard);
      }

      playerIndex = (playerIndex + 1) % players.length;
    }
    return players;
  }
}

export { GameLogic, Dealer };
