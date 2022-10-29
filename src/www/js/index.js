



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

document.querySelector('#join_lobby_btn').addEventListener('click', () =>{
    hide_content();
    document.querySelector('.join_lobby_screen').classList.remove('hide');
} )



const hide_content = () => {
    document.querySelector('.private_lobby_screen').classList.add('hide');
    document.querySelector('.public_lobby_screen').classList.add('hide');

    
    document.querySelector('.signup_page').classList.add('hide');
    document.querySelector('.login_page').classList.add('hide');
    document.querySelector('.lobby_screen').classList.add('hide');
    document.querySelector('.join_lobby_screen').classList.add('hide');


}



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
    
})
