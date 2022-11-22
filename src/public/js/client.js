"use strict";

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

socket.on("host-disconnect", () => {
  document.location.reload();
  alert("HOST DC");
});

export { socket, MAX_PLAYERS, MAX_LOBBY };
