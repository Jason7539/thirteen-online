"use strict";

import { initGame } from "./game.js";

// eslint-disable-next-line no-undef
var socket = io();

const MAX_PLAYERS = 4;
const MAX_LOBBY = 3;

socket.on("update-lobby", (lobby) => {
  console.log("inside update-lobby");

  for (let i = 0; i < MAX_PLAYERS; i++) {
    document.querySelector("#p" + i).innerHTML = lobby.players[i]
      ? lobby.players[i].name
      : "";
    //document.querySelector()
  }
});

socket.on("init-game", (lobbyName) => {
  initGame();
  //hide lobby buttons
  document.querySelector(".lobby_btn").classList.add("hide");
  document.querySelector(".chat-container").classList.remove("hide");
  document.getElementById("lobbyName").innerHTML = `${lobbyName}`;

  // clear player names in lobby when game starts
  for (let i = 0; i < MAX_PLAYERS; i++) {
    document.querySelector("#p" + i).innerHTML = "";
  }
});

socket.on("host-disconnect", () => {
  alert("Host Disconnected: please join another lobby");
  document.location.reload();
});

export { socket, MAX_PLAYERS, MAX_LOBBY };
