"use strict";

import { socket } from "./client.js";

const MAX_LOBBY = 3;

// TODO: validation for joining full lobby //MAX PLAYER==4 stop user from joining // lobby ---- 2/4

document.querySelector("#login_btn").addEventListener("click", () => {
  hide_content();
  document.querySelector(".login_page").classList.remove("hide");
});

document.querySelector("#signup_btn").addEventListener("click", () => {
  hide_content();
  document.querySelector(".signup_page").classList.remove("hide");
});

document.querySelector("#create_room_btn").addEventListener("click", () => {
  hide_content();
  document.querySelector(".lobby_screen").classList.remove("hide");
});

// Joining public game
document.querySelector("#join_lobby_btn").addEventListener("click", () => {
  hide_content();
  document.querySelector(".join_lobby_screen").classList.remove("hide");

  // Fetch lobbies
  socket.emit("fetch-lobbies", (callback) => {
    console.log(callback.lobbies);

    let lobbyList = document.querySelector("#lobbies-list");

    if (callback.lobbies.length == 0 || callback.lobbies.length == null) {
      document.querySelector("#lobbies-list").innerHTML =
        "no more room available to join";
    } else {
      // create li for each lobby
      for (let lobby of callback.lobbies) {
        console.log(lobby);
        let li = document.createElement("li");
        li.id = lobby.id;
        li.innerHTML = lobby.name;
        li.classList.add("hover");

        // on click join lobbies
        //Check for existing names in the lobby before joining
        li.onclick = () => {
          const usernameCheck = () => {
            let username = prompt("Please enter your username", "username");
            let playerList = lobby.players.map(({ name }) => name);
            if (!playerList.includes(username)) {
              hide_content();
              document
                .querySelector(".public_lobby_screen")
                .classList.remove("hide");
              document.querySelector("#lobby_name").innerHTML = lobby.name;

              // populate player list
              let nextIl = 0;
              for (let [index, player] of lobby.players.entries()) {
                console.log(player);
                document.querySelector("#p" + index).innerHTML = player.name;
                nextIl += 1;
              }

              document.querySelector("#p" + nextIl).innerHTML = username;

              // hide start game button for joiners
              document.querySelector("#host_button").classList.add("hide");

              // send joining player to server
              socket.emit("lobby-join", username, lobby.id);
            } else {
              alert("Username already taken, please choose another name");
              usernameCheck();
            }
          };
          usernameCheck();

          // prompt username

          // update the page with lobby information
        };

        lobbyList.appendChild(li);
      }
    }
  });
});
// Lobby creation
document.getElementById("lobby_screen_form").addEventListener("submit", (e) => {
  e.preventDefault();

  //Max lobby Created
  socket.emit("fetch-lobbies", (callback) => {
    if (callback.lobbies.length >= MAX_LOBBY) {
      alert("Max lobby created, Please join an existing room");
    } else {
      let selected = document.querySelector(
        'input[name="user_lobby"]:checked'
      ).value;
      if (selected == "Public") {
        hide_content();
        document.querySelector(".public_lobby_screen").classList.remove("hide");
      } else {
        hide_content();
        document
          .querySelector(".private_lobby_screen")
          .classList.remove("hide");
      }

      // TODO: Validation if fields are empty
      // set character limits
      let lobbyname = document.querySelector("#user_lobby_name").value;
      let username = document.querySelector("#user_name").value;
      socket.emit("lobby-creation", lobbyname, username, (response) => {
        console.log(response);

        // update name: based on the
        document.querySelector("#lobby_name").innerHTML = response.lobby.name;

        // populate player list
        for (let [index, player] of response.lobby.players.entries()) {
          console.log(player);
          document.querySelector("#p" + index).innerHTML = player.name;
        }
      });
    }
  });
});

const hide_content = () => {
  document.querySelector(".private_lobby_screen").classList.add("hide");
  document.querySelector(".public_lobby_screen").classList.add("hide");

  document.querySelector(".signup_page").classList.add("hide");
  document.querySelector(".login_page").classList.add("hide");
  document.querySelector(".lobby_screen").classList.add("hide");
  document.querySelector(".join_lobby_screen").classList.add("hide");
};
