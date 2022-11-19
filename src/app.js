"use strict";

import express from "express";
const app = express();
const port = 8080;
import path from "path";
import http from "http";
import { Server } from "socket.io";
import { Player, Lobby } from "./lobby.js";

const server = http.createServer(app);
const io = new Server(server);
const __dirname = path.resolve("./");

app.use(express.static(path.join(__dirname, "src", "public")));

// TODO set max allowed lobbies
let lobbies = [];
// TODO: future improvement, remove socket.io used to keep track of players -> generate unique id
// how to keep better track of user disconnect

io.on("connection", (socket) => {
  console.log("a user connected: " + socket.id);

  //export lobbies

  socket.emit("Test", "test");

  socket.on("disconnect", () => {
    console.log("a user disconnected:" + socket.id);

    // remove lobby when host disconnect
    let delRoomIndex = lobbies.findIndex((lobby) => lobby.hostId === socket.id);

    console.log("room index" + delRoomIndex);
    if (delRoomIndex > -1) {
      // TODO:
      // emit lobby deletion to all players

      // sockets disconnect from room(lobby) to be deleted
      io.of(lobbies[delRoomIndex].id).disconnectSockets(true);

      console.log("deleted room at index: " + delRoomIndex);
      lobbies.splice(delRoomIndex, 1);
      return;
    }

    // remove joiners from lobbies on DC and call update-lobby
    for (let i = 0; i < lobbies.length; i++) {
      let delPlayerIndex = lobbies[i].players.findIndex(
        (player) => player.id === socket.id
      );
      if (delPlayerIndex > -1) {
        lobbies[i].players.splice(delPlayerIndex, 1);
        io.to(lobbies[i].id).emit("update-lobby", lobbies[i]);
        return;
      }
    }

    // alert joiners when host DC
  });

  socket.on("lobby-creation", (lobbyname, username, callback) => {
    console.log("created lobby name is : " + lobbyname);

    let lobby = new Lobby(lobbyname, socket.id).addPlayers(
      new Player(socket.id, username)
    );
    lobbies.push(lobby);

    socket.join(lobby.id);

    console.log(lobbies);
    console.log(socket.rooms);

    callback({
      status: "ok",
      lobby: lobby,
    });
  });

  socket.on("lobby-join", (username, lobbyId) => {
    console.log(username + " on " + lobbyId);

    let lobbyToJoinIndex = lobbies.findIndex((l) => l.id === lobbyId);
    lobbies[lobbyToJoinIndex].addPlayers(new Player(socket.id, username));

    console.log(lobbies[lobbyToJoinIndex].players);
    console.log("inside join");
    console.log(lobbyId);
    console.log(lobbies[lobbyToJoinIndex].id);

    socket.join(lobbyId);
    // emit lobbyid so players get updated player list
    io.to(lobbyId).emit("update-lobby", lobbies[lobbyToJoinIndex]);
  });

  // send all lobbies for joining players
  socket.on("fetch-lobbies", (callback) => {
    callback({
      status: "ok",
      lobbies: lobbies,
    });
  });

  socket.on("lobby-deletion", () => {});

  socket.on("player-creation", () => {});
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "src", "public", "html", "index.html"));
  //res.sendFile(__dirname + "/public/html/index.html");
});

server.listen(port, () => {
  console.log(`example app listening on port ${port}`);
});
