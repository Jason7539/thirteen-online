"use strict"

const express = require('express');
const app = express();
const port = 8080;
const path = require('path');
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);

const {Player, Lobby} = require('./lobby');

const parentDir = path.resolve(__dirname, '..');

app.use(express.static(path.join(__dirname, "public")));

// TODO set max lobby creation
let lobbies = [];

io.on('connection', (socket) => {
  console.log('a user connected:' + socket.id);

  socket.on('disconnect', (reason) => {
    console.log('a user disconnected:' + socket.id);

    // remove lobby when host disconnect 
    let delRoomIndex = lobbies.findIndex(elm => elm.hostId === socket.id);
    
    let rooms = socket.rooms;
    
    console.log('room index' + delRoomIndex);
    if (delRoomIndex > -1) {
      
      // TODO: 
      // emit lobby deletion to all players

      // sockets disconnect from room(lobby) to be deleted
      io.of(lobbies[delRoomIndex].id).disconnectSockets(true);

      console.log('deleted room at index: ' + delRoomIndex);
      lobbies.splice(delRoomIndex, 1);
    }
    

  });

  socket.on('lobby-creation', (lobbyname, username, callback) => {
    console.log('created lobby name is : ' + lobbyname);

    let lobby = new Lobby(lobbyname, socket.id).addPlayers(new Player(socket.id, username));
    lobbies.push(lobby);

    socket.join(lobby.id);


    console.log(lobbies);
    console.log(socket.rooms);

    callback({
      status: 'ok',
      lobby: lobby
    });

  });

  socket.on('player-join', (lobbies, callback) => {

  });


  // send all lobbies for joining players 
  socket.on('fetch-lobbies', (callback) => {
    callback({
      status: 'ok',
      lobbies: lobbies
    })
  });




  socket.on('lobby-deletion', () => {

  });

  socket.on('player-creation', () => {

  });


});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/html/index.html');
})


server.listen(port, () => {
  console.log(`example app listening on port ${port}`);
})
