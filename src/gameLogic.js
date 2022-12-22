import PlayerHelper from "./public/js/components/playerHelper.js";
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
      currentLobby.playersInRound = JSON.parse(
        JSON.stringify(currentLobby.players)
      );

      let shuffledCards = Dealer.shuffleCards(cards);
      currentLobby.players = Dealer.dealCards(
        currentLobby.players,
        shuffledCards
      );

      let names = currentLobby.playersInRound.map((player) => player.name);
      console.log("Players in the current round is: " + JSON.stringify(names));

      // Get the lowest delt card and set that player's turn
      let lowestCard = Dealer.getLowestCard(currentLobby.players);
      let otherPlayerList = Array.from(currentLobby.players);
      otherPlayerList.unshift(otherPlayerList.pop());
      let firstTurn;

      for (let player of currentLobby.players) {
        if (player.hand.find((card) => card === lowestCard)) {
          firstTurn = player.name;
        }
      }

      for (let player of currentLobby.players) {
        otherPlayerList.push(otherPlayerList.shift());
        if (player.hand.find((card) => card === lowestCard)) {
          player.isTurn = true;
          // emit is turn for that player/ enable buttons and last played card for player

          let lastPlayed = {
            repitition: 0,
            sequence: 0,
            highestCard: "",
            cardsPlayed: [],
            requiredCard: lowestCard,
          };
          this.io.to(player.id).emit("isTurn", lastPlayed);

          currentLobby.currentPlayerIndex =
            currentLobby.playersInRound.findIndex(
              (elm) => elm.id === player.id
            );
        }
        this.io
          .to(player.id)
          .emit(
            "delt-cards",
            player,
            currentLobby.players,
            otherPlayerList,
            firstTurn
          );
      }
    });

    this.socket.on("play-card", (lobbyId, lastPlayed, playerName) => {
      // emit latPlayed to everyone
      console.log("just played: " + JSON.stringify(lastPlayed));

      // send isTurn to the next player
      // have an inner array for the current round of players
      let currentLobby = this.lobbies.find((lobby) => lobby.id === lobbyId);

      currentLobby.currentPlayerIndex += 1;
      currentLobby.currentPlayerIndex %= currentLobby.playersInRound.length;
      console.log("next turn is :" + currentLobby.currentPlayerIndex);
      let newPlayerTurn =
        currentLobby.playersInRound[currentLobby.currentPlayerIndex];
      // sends last played. so all clients renders the most recent played card
      this.io.to(lobbyId).emit("last-played", lastPlayed, playerName);

      this.io.to(lobbyId).emit("player-turn", newPlayerTurn.name);
      this.io.to(newPlayerTurn.id).emit("isTurn", lastPlayed);
    });

    this.socket.on("pass-button", (lobbyId, lastPlayed) => {
      // remove current player from players in that round
      let currentLobby = this.lobbies.find((lobby) => lobby.id === lobbyId);

      currentLobby.playersInRound.splice(currentLobby.currentPlayerIndex, 1);
      console.log(
        "current players are: ",
        currentLobby.playersInRound.map((p) => p.name)
      );

      currentLobby.currentPlayerIndex =
        currentLobby.currentPlayerIndex % currentLobby.playersInRound.length;
      console.log("the next index is ", currentLobby.currentPlayerIndex);

      if (currentLobby.playersInRound.length === 1) {
        let freePlay = {
          repitition: 0,
          sequence: 0,
          highestCard: "",
          cardsPlayed: [],
        };

        this.io
          .to(currentLobby.playersInRound[currentLobby.currentPlayerIndex].id)
          .emit("isTurn", freePlay);
        this.io
          .to(lobbyId)
          .emit(
            "player-turn",
            currentLobby.playersInRound[currentLobby.currentPlayerIndex].name
          );

        let playersBefore = [];
        let isAfter = false;
        // reset all the players in the round

        for (let player of currentLobby.players) {
          if (
            player.id ===
            currentLobby.playersInRound[currentLobby.currentPlayerIndex].id
          ) {
            isAfter = true;
            continue;
          }
          if (!isAfter) {
            playersBefore.push(JSON.parse(JSON.stringify(player)));
          } else {
            currentLobby.playersInRound.push(
              JSON.parse(JSON.stringify(player))
            );
          }
        }

        let currentPlayer =
          currentLobby.playersInRound[currentLobby.currentPlayerIndex];

        currentLobby.playersInRound = playersBefore.concat(
          currentLobby.playersInRound
        );
        console.log(
          "round rest is now: ",
          currentLobby.playersInRound.map((p) => p.name)
        );

        currentLobby.currentPlayerIndex = currentLobby.players.findIndex(
          (p) => p.id === currentPlayer.id
        );
        console.log("next updated player at ", currentLobby.currentPlayerIndex);
      } else {
        // emit next turn to the next player
        let newPlayerTurn =
          currentLobby.playersInRound[currentLobby.currentPlayerIndex];
        this.io.to(newPlayerTurn.id).emit("isTurn", lastPlayed);
        this.io.to(lobbyId).emit("player-turn", newPlayerTurn.name);
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

  static getLowestCard(players) {
    let cardsInPlay = players.map((player) => player.hand).flat();
    return PlayerHelper.getLowestCard(cardsInPlay);
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
