import './components.css'
import React, {useState} from 'react'


const LandingPage = () => {

    const [loginBtn, setLoginBtn] = useState(false)

    const toggleLoginBtn = () => {
        setLoginBtn(!loginBtn)
    }
    


    return (

        <>
            <nav>
                <button onClick={toggleLoginBtn}>Login</button>
                <button>Sign Up</button>
            </nav>

            {loginBtn && (
                <div className="loginScreen">
                    <form>
                        <h3>Login</h3>
                        <input type="text" id="login_username" placeholder="Username"/> 
                        <input type="text" id="login-password" placeholder="Password"/>
                        <button onClick={toggleLoginBtn}>Continue</button>
                        <a href="#">Forgot your password?</a>
                        <a href="#">Don't have an account? Create One</a>
                    </form>

                </div>
            )
            
            
            }


            <div className="lobbyBtn">
                <button>Join Lobby</button>
                <button>Create Lobby</button>
            </div>
        </>
    );
}

export default LandingPage;