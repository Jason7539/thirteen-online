"use strict";

// eslint-disable-next-line no-undef
var socket = io();

const MAX_PLAYERS = 4;

socket.on("update-lobby", (lobby) => {
  console.log("inside update-lobby");

  // TODO: add classes to distinguish the current player's name
  for (let i = 0; i < MAX_PLAYERS; i++) {
    document.querySelector("#p" + i).innerHTML = lobby.players[i]
      ? lobby.players[i].name
      : "";
  }
});

export { socket };
