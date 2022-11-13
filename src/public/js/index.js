"use strict"

// TODO: highlight current user name upon lobby creation/joining
// TODO: validation for joining full lobby

document.querySelector('#login_btn').addEventListener('click', () =>{
    hide_content();
    document.querySelector('.login_page').classList.remove('hide');
} )


document.querySelector('#signup_btn').addEventListener('click', () =>{
    hide_content();
    document.querySelector('.signup_page').classList.remove('hide');
} )

document.querySelector('#create_room_btn').addEventListener('click', () =>{
    hide_content();
    document.querySelector('.lobby_screen').classList.remove('hide');
} )

// Joining public game
// TODO: when there are no lobbies, display "no rooms available to join"
document.querySelector('#join_lobby_btn').addEventListener('click', () =>{
    hide_content();
    document.querySelector('.join_lobby_screen').classList.remove('hide');

    // Fetch lobbies
    socket.emit('fetch-lobbies', (callback) => {
        console.log(callback.lobbies);

        let lobbyList = document.querySelector('#lobbies-list');
        
        // create li for each lobby 
        // TODO: make li look clickable using classes
        for(let lobby of callback.lobbies) {
            console.log(lobby);
            let li = document.createElement('li');
            li.id = lobby.id;
            li.innerHTML = lobby.name;

            // on click join lobbies 
            li.onclick = () => { 
                // prompt username
                let username = prompt("Please enter your username", "username");

                // update the page with lobby information
                hide_content()
                document.querySelector('.public_lobby_screen').classList.remove('hide');
                document.querySelector("#lobby_name").innerHTML = lobby.name;
                
                // populate player list
                let nextIl = 0;
                for (let [index, player] of lobby.players.entries()){
                    console.log(player)
                    document.querySelector("#p"+ index).innerHTML = player.name;
                    nextIl += 1;
                }

                document.querySelector("#p"+ nextIl).innerHTML = username;


                // hide start game button for joiners 
                document.querySelector('#host_button').classList.add('hide');

                // send joining player to server
                socket.emit('lobby-join', username, lobby.id);
                registerLobbyRoom(lobby.id);
            
            };

            lobbyList.appendChild(li);
        }
    });
} )


// Lobby creation
document.querySelector('#lobby_submit_btn').addEventListener('click' ,()=>{
    let selected = document.querySelector('input[name="user_lobby"]:checked').value;
    if (selected == "Public"){
        hide_content();
        document.querySelector('.public_lobby_screen').classList.remove('hide');
    }
    else{
        hide_content();
        document.querySelector('.private_lobby_screen').classList.remove('hide');

    }
    
    // TODO: Validation if fields are empty
    // set character limits 
    let lobbyname = document.querySelector("#user_lobby_name").value;
    let username = document.querySelector("#user_name").value;
    socket.emit('lobby-creation', lobbyname, username, (response) => {
        console.log(response);

        // update name: based on the 
        document.querySelector("#lobby_name").innerHTML = response.lobby.name;

        // populate player list
        for (let [index, player] of response.lobby.players.entries()){
            console.log(player)
            document.querySelector("#p"+ index).innerHTML = player.name;
        }

        // register client socket to room
        registerLobbyRoom(response.lobby.id);
    });

})

const hide_content = () => {
    document.querySelector('.private_lobby_screen').classList.add('hide');
    document.querySelector('.public_lobby_screen').classList.add('hide');

    
    document.querySelector('.signup_page').classList.add('hide');
    document.querySelector('.login_page').classList.add('hide');
    document.querySelector('.lobby_screen').classList.add('hide');
    document.querySelector('.join_lobby_screen').classList.add('hide');


}