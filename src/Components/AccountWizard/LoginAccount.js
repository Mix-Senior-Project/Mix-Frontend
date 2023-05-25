import style from "./AccountManagement.module.css";
import InputBox from "../Utilities/InputBox";
import standardStyle from "../Utilities/MixStandardizedStyle.module.css";
import React, {useState} from "react";
import fetch from 'node-fetch'

const LoginAccount = (props) => {
  //API Throttle variables
  const [lastRequest, setLastRequest] = useState(0);
  const requestCooldown = 5;

  //Account Management states
  const [loginInfo, setLoginInfo] = useState({
    username: "",
    password: "",
  });

  const [pass, setPass] = useState(true);
  const [loading, setLoading] = useState(false);
  const [forgot, setForgot] = useState(false);
  const [email, setEmail] = useState("");
  const [username, setUsername]= useState("");
  const [temporary, setTemporary] = useState(false);

  //Handles login form user input
  const handleLoginForm = (name, value) => {
    let username = loginInfo.username;
    let password = loginInfo.password;


    if (name === "username") {
      username = value;
    }
    if (name === "password") {
      password = value;
    }

    setLoginInfo({
      username: username,
      password: password,
    })
  }

  const handleEmail = (e) => {
    setEmail(e.target.value);
  }

  const handleUsername = (e) => {
    setUsername(e.target.value);
  }

  //Handles login submission click
  const handleLogin = async (e) => {
    setLoading(true);
    //Provides a cooldown based on the request cooldown.
    var currTime = new Date();
    if (requestCooldown >= (currTime.getSeconds() - lastRequest)) {
      return;
    } else {
      setLastRequest(currTime.getSeconds());
    }

    //Verify user data is correct format
    e.preventDefault();
    if (loginInfo.username === "") {
      props.toggleErrorBanner(true, "Invalid username");
      return;
    }
    if (loginInfo.password === "") {
      props.toggleErrorBanner(true, "Invalid password");
      return;
    }
    if (loginInfo.username.indexOf(' ') !== -1) {
      props.toggleErrorBanner(true, "Invalid username");
      return;
    }

    //Handle login API request
    let loginResp = "";
    try {
      await fetch('/* VALIDATE USER LOGIN API */', {
        method: 'POST',
        body: JSON.stringify({
          "username": loginInfo.username,
          "password": loginInfo.password
        }),
      })
      .then((response) => response.json())
      .then((json) => loginResp = json);
    } catch (error) {
      props.toggleErrorBanner(true, "Unable to connect, try again later.");
      console.log("API Request Failed: ValidateUserLogin");
      console.log(error);
      return;
    }
    console.log("API Request Sent: ValidateUserLogin");
    console.log(loginResp.verified === 0);
    if (loginResp.verified === 0) {
      console.log({
        user_id: loginResp.user_id,
        username: loginResp.username,
        email: loginResp.email,
        creation_date: loginResp.creation_date,
        groups_joined: [],
        interests: loginResp.interests,
        profile_picture: loginResp.profile_picture,
        posts_made: loginResp.posts,
        friends_list: loginResp.friends,
        bio: loginResp.bio,
        banner_picture: loginResp.banner_picture,
        events: [],
        blocked: loginResp.blocked
      });
      props.updateAccountInfo({
        user_id: loginResp.user_id,
        username: loginResp.username,
        email: loginResp.email,
        creation_date: loginResp.creation_date,
        groups_joined: [],
        interests: loginResp.interests,
        profile_picture: loginResp.profile_picture,
        posts_made: loginResp.posts,
        friends_list: loginResp.friends,
        bio: loginResp.bio,
        banner_picture: loginResp.banner_picture,
        events: [],
        blocked: loginResp.blocked
      });
      props.updateWizardPage("createAccountStepTwo", "login");
      return;
    }
    if (loginResp.username === "FALSE" || loginResp.password === "FALSE") {
      props.toggleErrorBanner(true, "Invalid login credentials");
      return;
    }

    //Preemptively cache groups that the user is part of
    let groupList = [];
    if ((loginResp.groups !== "null") && (loginResp.groups !== null)){
      if (loginResp.groups.length > 0) {
        for (let i = 0; i < loginResp.groups.length; i++) {
          let group_id = loginResp.groups[i];
          let groupObj = "";

          try {
            let fetchResp = await fetch(("/* GET GROUP API */" + group_id));
            groupObj = await fetchResp.json();
            console.log("Group Profile GetGroup Request Sent");
          } catch (error) {
            console.log("API Request Failed: GetGroup");
            console.log(error);
          } 

          if (groupList !== "Failed to get group. src: rds-get-group") groupList.push(groupObj);
        }
      }
    }

    let eventsList = [];
    if (loginResp.events !== null) {
      if (loginResp.events.length > 0 && loginResp.events !== "null") {
        for (var i = 0; i < loginResp.events.length; i++) {
          let eventObj = "";
          try {
          await fetch(("/* GET EVENT API */" + loginResp.events[i]))
              .then(response => response.json())
              .then(json => eventObj = json)
          } catch (error) {
          console.log("API Failure for GetEvent!");
          return;
          }
          eventsList.push(eventObj);
        }
      }  
    }

    let profile_picture = "null";
    if (loginResp.profile_picture !== "") {
      profile_picture = loginResp.profile_picture;
    }

    props.setAccount({
      user_id: loginResp.user_id,
      username: loginResp.username,
      email: loginResp.email,
      creation_date: loginResp.creation_date,
      groups_joined: groupList,
      interests: loginResp.interests,
      profile_picture: profile_picture,
      posts_made: loginResp.posts,
      friends_list: loginResp.friends,
      bio: loginResp.bio,
      banner_picture: loginResp.banner_picture,
      events: eventsList,
      blocked: loginResp.blocked
    });

    props.updatePage("default", "null");
    setLoading(false);
  }

  //Navigates the user to the previous account wizard page
  const goBack = () => {
    props.updateWizardPage("default");
  }

  const changeType = () => {
    setPass(!pass);
  }

  const sendVerify = () => {
    props.updateWizardPage("createAccountStepTwo");
  }

  const forgotPass = () => {
    setForgot(true);
  }

  const sendEmail = async() => {
    try {
      await fetch('/* FORGOT PASSWORD API */', {
        method: 'PATCH',
        body: JSON.stringify({
          "username": username,
          "email": email
        }),
      })
    } catch (error) {
      console.log("API Request Failed: Forgot Password");
      console.log(error);
      return;
    }
    console.log("Forgot Password API Request Sent");
    setTemporary(true);
  }

  return (
    <div>    
        <div id={style.headerGrouping}>
            <div id={style.header}>
              <h2>Login to Mix</h2>
              <p><b>Enter your account information below.</b></p>
            </div>
            <button className={style.closeWindow} onClick={goBack}>Go Back</button>
        </div>
        <div id={style.inputSectionFormatting}>
          <InputBox type={"text"} name={"username"} headerText={"Username:"} value={loginInfo.username} onChange={handleLoginForm}/>
          <InputBox type={pass ? "password" : "text"} name={"password"} headerText={"Password:"} value={loginInfo.password} onChange={handleLoginForm} changeType={changeType}/>
        </div>
        
        <button id={style.forgotPass} onClick={forgotPass}>Forgot Password?</button>
        <br></br><br></br>
        {forgot ?
        <div id={style.sendEmail}>
          {temporary ?
          <div>
            <h3>Please sign in with the temporary password sent to your email</h3>
            <h3>After signing in you must change your password in your settings</h3>
          </div>
          :
          <div>
            Please provide your username and email:<br></br><br></br>
            <input type="text" name={"username"} className={style.email} value={username} onChange={handleUsername} placeholder="username"></input>
            <br></br><br></br>
            <input type="text" name={"email"} className={style.email} value={email} onChange={handleEmail} placeholder="email@domain.com"></input>
            <br></br><br></br>
            <button id={style.send} onClick={sendEmail}>Send Temporary Password</button>
          </div>
          }
        </div>
        :React.Fragment}
        <button className={standardStyle.submitButton} onClick={handleLogin} data-testid="verifyLoginButton">Login</button>
        <br></br>
        {loading ?
          <b>Please wait while we load your account</b>
          :React.Fragment
        }
    </div>
  );
}

export default LoginAccount;