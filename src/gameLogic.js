import PlayerHelper from "./public/js/components/playerHelper.js";
import moment from "moment";
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

      let lowestCard = Dealer.getLowestCard(currentLobby.players);

      let firstPlayerName;
      for (let player of currentLobby.players) {
        if (player.hand.find((card) => card === lowestCard)) {
          firstPlayerName = player.name;
        }
      }

      let otherplayers = Array.from(currentLobby.players);
      otherplayers.unshift(otherplayers.pop());

      for (let player of currentLobby.players) {
        otherplayers.push(otherplayers.shift());
        this.io
          .to(player.id)
          .emit(
            "delt-cards",
            player,
            currentLobby.players,
            otherplayers,
            firstPlayerName
          );
      }

      for (let player of currentLobby.players) {
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
      }
    });

    //format message coming from users
    function formatMessage(username, text) {
      return {
        username,
        text,
        time: moment().format("h:mm a"),
      };
    }

    //listen to message
    this.socket.on("chatMessage", (lobbyId, username, msg) => {
      this.io.to(lobbyId).emit("message", formatMessage(username, msg));
    });

    this.socket.on("notValid", (playerId) => {
      this.io
        .to(playerId)
        .emit(
          "errorMessage",
          formatMessage("Game", "Not A Valid Play, Please try again")
        );
    });

    this.socket.on("play-card", (lobbyId, lastPlayed, playerName, isWinner) => {
      if (isWinner) {
        this.io.to(lobbyId).emit("win-game", playerName, lobbyId);
      } else {
        // emit lastPlayed to everyone
        console.log("just played: " + JSON.stringify(lastPlayed));

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
      }
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
          "round reset is now: ",
          currentLobby.playersInRound.map((p) => p.name)
        );

        //rest the rounds for other player
        this.io.to(lobbyId).emit(
          "resetRound",
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

        //send current player in the round to mainScene
        this.io.to(lobbyId).emit(
          "currentPlayerInRound",
          currentLobby.playersInRound.map((p) => p.name)
        );
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
