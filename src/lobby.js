"use strict";

class Lobby {
  static maxPlayers = 4;

  constructor(name, id) {
    this.name = name;
    this._id = "lobby-" + id;
    this._hostId = id;
    this.players = [];
  }

  addPlayers(player) {
    if (!(player instanceof Player)) {
      throw new TypeError("argument not of class Player");
    }

    if (this.players.length < Lobby.maxPlayers) {
      this.players.push(player);
    }
    return this;
  }

  get id() {
    return this._id;
  }

  get hostId() {
    return this._hostId;
  }

  toJSON() {
    return {
      players: this.players,
      id: this.id,
      hostId: this.hostId,
      name: this.name,
    };
  }
}

class Player {
  constructor(id, name) {
    this.id = id;
    this._name = name;
    this.hand = [];
    this.isTurn = false;
  }

  set name(name) {
    this._name = name;
  }

  get name() {
    return this._name;
  }

  toJSON() {
    return {
      name: this._name,
      id: this.id,
      hand: this.hand,
      isTurn: this.isTurn,
    };
  }
}

export { Player, Lobby };
