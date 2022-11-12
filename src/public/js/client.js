"use strict"

var socket = io();


socket.on("update-lobby", (players) => {
    console.log("inside update-lobby");

    // get elements update it.
});


// for hosts and joiners call registerLobbyRoom to update player joing and leaving
function registerLobbyRoom(lobbyId) {
    console.log("inside register");
}
