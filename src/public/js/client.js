"use strict"

var socket = io();

// for hosts and joiners call registerLobbyRoom to update player joing and leaving
function registerLobbyRoom(lobbyId) {
    socket.on(lobbyId, (response) =>{
        
    })
}

function helloWorld() {
    alert('foo boo');
}