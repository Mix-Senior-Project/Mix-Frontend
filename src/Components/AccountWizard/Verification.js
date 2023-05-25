import style from "./AccountManagement.module.css";
import standardStyle from "../Utilities/MixStandardizedStyle.module.css";
import React, {useState} from "react";
import { useTimer } from 'react-timer-hook';

const Verification = (props) => {
    const [failed, setFailed] = useState(false);
    const [email, setEmail] = useState("email@domain.com");
    const [newEmail, setNewEmail] = useState(false);
    var inputToken = "123abc";

    const changeEmail = (e) => {
        sendNewEmail();
    }

    const inputNewEmail = (e) => {
      setNewEmail(true);
    }

    const handleEmail = (e) => {
        setEmail(e.target.value);
    }

    const handleToken = (e) => {
      // setInputToken(e.target.value);
      inputToken = e.target.value
  }

    const verify = async (token) => {
      //Handle Verification API Request
      let responseObj = "";
      if (props.verified === false) {
        console.log(props.account.user_id);
        console.log(inputToken);
        try {
          await fetch('/* CHECK TOKEN API */', {
            method: 'PATCH',
            body: JSON.stringify({
              "user_id": props.account.user_id,
              "token": inputToken
            }),
          })
          .then((response) => response.json())
          .then((json) => responseObj = json);
          if(responseObj === false){
            setFailed(true);
            return;
          }
        } catch (error) {
          console.log("API Request Failed: checkToken");
          console.log(error);
          return;
        }
        console.log("Check Token API Request Sent");
        props.setVerified(true);

        if (props.subtype === "createAccount") {
          props.updateWizardPage("createAccountStepThree");
        } else {
          props.setLogin(props.account);
        }
        
      }
    }
    console.log(props.account)

    const sendNewEmail = async () => {
      let responseObj = "";
            try {
              await fetch('/* GENERATE NEW EMAIL API */', {
                method: 'PATCH',
                body: JSON.stringify({
                  "user_id": props.account.user_id,
                  "email": props.account.email
                }),
              })
              .then((response) => response.json())
              .then((json) => responseObj = json);
            } catch (error) {
              console.log("API Request Failed: GenerateNewEmail");
              console.log(error);
              return;
            }
            console.log("Generate New Email API Request Sent");
    }


    //set 5 minute timer
    function MyTimer({ expiryTimestamp }) {
        const {
          seconds,
          minutes,
        } = useTimer({ expiryTimestamp, onExpire: () => setFailed(true), sendNewEmail});

        let sec = "";
        if (seconds < 10){
          sec = "0" + seconds;
        } else {
          sec = seconds;
        }
      
        return (
          <div style={{textAlign: 'center'}}>
            <div style={{fontSize: '20px'}}>
              <span>{minutes}</span>:<span>{sec}</span>
            </div>
          </div>
        );
      }

    const time = new Date();
    time.setSeconds(time.getSeconds() + 300);


    return (
        <div>
            <div id={style.headerGrouping}>
                <div id={style.header}>
                  <h2>Account Verification</h2>
                  <p><b>Verify your account with the code sent to your email</b></p>
                </div>
            </div>
            <div id={style.timer}>
                Time remaining:<span id="timer"></span>
                <MyTimer expiryTimestamp={time} />
            </div>
            <input type="text" id={style.code} placeholder="0-0-0-0-0-0" maxLength="6" onChange={handleToken}/><br></br>
            <button className={standardStyle.submitButton} onClick={verify}>Verify Account</button>
            <br></br>
            <button className={style.emailButton} onClick={sendNewEmail}>Resend Email</button>
            {failed ? 
                <div>
                    <h2>Your account has not been verified. A new code has been sent.</h2>
                    If you would like to change the email address associated with this account please click below.<br></br>
                    <button id={style.changeEmail} onClick={inputNewEmail}>Change Email</button>
                    {newEmail ?
                        <div>
                            <input type="text" id={style.newEmail} placeholder="email@domain.com" value={email} onChange={handleEmail}/>
                            <button id={style.submit} onClick={changeEmail}>Change Email</button>
                        </div>
                        :React.Fragment}
                </div>
                :React.Fragment}
        </div>
    );
}

export default Verification;