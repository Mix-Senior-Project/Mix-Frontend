import style from "./AccountManagement.module.css";
import InputBox from "../Utilities/InputBox";
import standardStyle from "../Utilities/MixStandardizedStyle.module.css";
import React, {useState} from "react";

const CreateAccount = (props) => {
  //Account Management states
  const [accountInfo, setAccountInfo] = useState({
    username: "",
    bio: "",
    email: "",
    password: "",
    confirmPassword: "",
    profile_picture: "null",
    banner_picture: "null",
    interests: []
  });

  const [pass, setPass] = useState(true);
  const [policyAcceptance, setPolicyAcceptance] = useState(false);

  //API Cooldown variables
  const [lastRequest, setLastRequest] = useState(0);
  const requestCooldown = 5;


  //Handles account form user input
  const handleAccountForm = (name, value) => {
    let username = accountInfo.username;
    let bio = accountInfo.bio;
    let emailVal = accountInfo.email;
    let password = accountInfo.password;
    let confirmPassword = accountInfo.confirmPassword;


    if (name === "username") {
      username = value;
    }
    if (name === "email") {
      emailVal = value;
    }
    if (name === "password") {
      password = value;
    }
    if (name === "confirmPassword") {
      confirmPassword = value;
    }
    if (name === "bio") {
      bio = value;
    }

    setAccountInfo({
      username: username,
      email: emailVal,
      password: password,
      confirmPassword: confirmPassword,
      bio: bio,
      interests: accountInfo.interests,
      profile_picture: accountInfo.profile_picture,
      banner_picture: accountInfo.banner_picture,
    })
  }

  //Handles Account Creation click
  const handleAccountCreationRequest = async (e) => {
    e.preventDefault();
    if(accountInfo.username.indexOf(' ') !== -1) {
      props.toggleErrorBanner(true, "Please refrain from having spaces in your username.");
      return;
    }

    if ((accountInfo.username === "") || (accountInfo.email === "") || (accountInfo.password === "") || (accountInfo.confirmPassword === "")) {
      props.toggleErrorBanner(true, "Please input account credentials");
      return;
    }

    if (accountInfo.email.indexOf(' ') !== -1 || accountInfo.email.indexOf('@') === -1 || accountInfo.email.indexOf('.') === -1 ) {
      props.toggleErrorBanner(true, "Invalid Email!");
      return;
    }

    if (accountInfo.password !== accountInfo.confirmPassword) {
      props.toggleErrorBanner(true, "Confirm password is not matching.");
      return;
    }

    if (!policyAcceptance) {
      props.toggleErrorBanner(true, "Please accept the terms of service before continuing.");
      return;
    }

    //API Throttle
    var currTime = new Date();
    if (requestCooldown >= (currTime.getSeconds() - lastRequest)) {
      return;
    } else {
      setLastRequest(currTime.getSeconds());
    }

    //Create account api request
    const timeNow = new Date();
    let currTimeStamp = timeNow.getFullYear() + "-" + (timeNow.getMonth()+1) + "-" + (timeNow.getDate()) + " " + timeNow.getHours() + ":" + timeNow.getMinutes() + ":" + timeNow.getSeconds();

    let accountObj = "";
    try {
       await fetch('/* CREATE ACCOUNT API */', {
        method: 'POST',
        body: JSON.stringify({
          "user_id": " ",
          "username" : accountInfo.username,
          "email" : accountInfo.email,
          "password" : accountInfo.password,
          "creation_date" : currTimeStamp,
          "groups_joined" : [],
          "interests" : accountInfo.interests,
          "s3_pfp" : accountInfo.profile_picture,
          "posts_made" : null,
          "friend_list" : null,
          "bio" : accountInfo.bio,
          "s3_banner" : accountInfo.banner_picture
          }),
      })
      .then((response) => response.json())
      .then((json) => accountObj = json);
    } catch (error) {
      console.log("API Request Failed: CreateAccount");
      console.log(error);
      return;
    }
    console.log("API Request Sent: CreateAccount");

    if (accountObj === "INTEGRITY ERROR: the username is already in use.") {
      props.toggleErrorBanner(true, "Username already in use!");
      return;
    }

    if (accountObj === "INTEGRITY ERROR: the email is already in use.") {
      props.toggleErrorBanner(true, "Invalid email! Try using a different email.");
      return;
    }

    //Save data and send user to recommended groups step
    props.updateAccount({
      user_id: accountObj.ID,
      banner_picture: accountObj.banner,
      bio: accountObj.bio,
      email: accountObj.email,
      friends_list: [],
      groups_joined: [],
      interests: accountInfo.interests,
      profile_picture: accountObj.pfp,
      username: accountObj.username,
      posts_made: [],
      events: [],
      blocked: []
    });
    props.updateWizardPage("createAccountStepTwo", "createAccount");
  }

  const updateMedia = async (name, value) => {
    //Handle file upload and API processing
    const file = value;
    const fileReader = new FileReader();
    fileReader.readAsDataURL(file);
    fileReader.onload = async () => {
      let fileName = (Math.round(100000000*Math.random())) + "." + file.type.split("/")[1];
      let binaryString = fileReader.result + "=="; 
      let s3Response = "";
      let response;

      //Save image as an S3 Object with AWS
      try {
          response = await fetch("/* MAKE S3 IMAGE V2 API*/", {
          method: 'POST',
          body: JSON.stringify({
              "name": fileName,
              "file": binaryString
          }),
          });
          s3Response = await response.json();
      } catch (error) {
          console.log("MakeS3ImageV2 API Failure");
          return;
      }

      if (name === "pfp") {
        setAccountInfo({
          username: accountInfo.username,
          email: accountInfo.email,
          password: accountInfo.password,
          confirmPassword: accountInfo.confirmPassword,
          bio: accountInfo.bio,
          interests: accountInfo.interests,
          profile_picture: s3Response.URI,
          banner_picture: accountInfo.banner_picture,
        });
      }

      if (name === "banner") {
        setAccountInfo({
          username: accountInfo.username,
          email: accountInfo.email,
          password: accountInfo.password,
          confirmPassword: accountInfo.confirmPassword,
          bio: accountInfo.bio,
          interests: accountInfo.interests,
          profile_picture: accountInfo.profile_picture,
          banner_picture: s3Response.URI,
        });
      }
    }
  }

  //Navigates the user to the previous account wizard page
  const goBack = () => {
    props.updateWizardPage("default");
  }

  const changeType = () => {
    setPass(!pass);
  }

  const privacyPolicyAccept = () => {
    setPolicyAcceptance(!policyAcceptance);
  }

  return (
    <div id={style.createAccountBody}>
        <div id={style.headerGrouping}>
            <div id={style.header}>
              <h2>Create Account</h2>
              <p><b>Enter your account information below.</b></p>
            </div>
            <button className={style.closeWindow} onClick={goBack}>Go Back</button>
        </div>
        <div id={standardStyle.inputSectionFormatting}>
          <InputBox type={"text"} name={"username"} headerText={"Username:"} value={accountInfo.username} onChange={handleAccountForm}/>
          <InputBox type={"text"} name={"email"} headerText={"Email:"} value={accountInfo.email} onChange={handleAccountForm}/>
          <InputBox type={"text"} name={"bio"} headerText={"Bio:"} value={accountInfo.bio} onChange={handleAccountForm}/>
          <InputBox type={pass ? "password" : "text"} name={"password"} headerText={"Password:"} value={accountInfo.password} onChange={handleAccountForm} changeType={changeType}/>
          <InputBox type={pass ? "password" : "text"} name={"confirmPassword"} headerText={"Confirm Password:"} value={accountInfo.confirmPassword} onChange={handleAccountForm} changeType={changeType}/>
          <InputBox type={"image"} name={"pfp"} headerText={"Profile Photo:"} buttonText={"Upload Photo"} onChange={updateMedia}/>
          <InputBox type={"image"} name={"banner"} headerText={"Banner:"} buttonText={"Upload Photo"} onChange={updateMedia}/>
          <br></br>
          <div>
            <h3>Mix Terms of Service</h3>
            <p id={style.policy}>
            By creating an account and using Mix, you agree to the following terms:
            <ol type="1">
              <li><b>User Data:</b> We collect and store the following data when you use Mix: your username, creation date and time, user email, user password, bio, user likes, user comments, user shared post content including text, videos, photos, user messages, user friends, users groups, user selected interests, and user verification status. By using Mix, you agree to share this data with us.</li>
              <li><b>Group Data:</b> When users create a group on Mix, we only collect information you provide us. This includes the group name, privacy status, creation date and time, group interests, banner picture, profile picture, group owner, bio, and group events. We also store data on users banned from the group, number of members in the group, group members and roles, and all data pertaining to posts made to the group. Details on the data collected regarding posts made are highlighted in bullet point 6.</li>
              <li><b>Data Privacy:</b> We take the privacy of our users seriously and do not share your data with any third-party entities. Please note that Mix uses cloud service providers such as Amazon Web Services to store user data, where only your password and email are encrypted at rest. Your data is not encrypted while in transit. We cannot guarantee that your data will always be private from other users. If required by law through a government agency, Mix is obligated to share user data that must be legally disclosed.</li>
              <li><b>Group Deletion:</b> Only the group owner can delete a group. Deleting a group will permanently delete all data listed in bullet point 3. When a user profile is deleted, the following will occur with respect to the groups you've created:</li>
              <ol type="i">
                <li>If there is only one member in the group (the owner), deleting your account will also permanently delete all data listed in bullet point 3 for the group.</li>
                <li>If the group has at least one other member besides the owner, ownership will be transferred to either a moderator or a community member. Preference is given to a moderator.</li>
              </ol>
              <li><b>Account Deletion:</b> If you choose to delete your Mix account, all of your personally identifiable information and data will be permanently deleted and cannot be restored. This includes all posts, your profile picture, your banner picture, comments, your username, your email, your password, events you've created, and direct messages sent from your account. User-created interests are not deleted from Mix when you delete your account, but all personally identifiable data is removed from the interest metadata.</li>
              <li><b>Post Deletion:</b> If you choose to delete a post that you created on Mix, it will be permanently deleted and cannot be restored. The post's text, image, video, comments, group and user association data, date and time of posting, likes, and dislikes will be deleted. We cannot delete content posted on a third-party platform, but any data pointing to it (such as media links) will be removed from our platform.</li>
              <li><b>Self-Moderation Tools:</b> We provide tools for self-moderation, such as the ability to block a user or ban a group member. By using Mix, you agree to use these tools responsibly and understand that they are a privilege. Mix does not delete any user content (including both posts and groups created) unless they are in direct violation of local government laws and regulations (in compliance with your geographic location).</li>
            </ol>
            By using Mix, you agree to comply with these terms. We reserve the right to suspend or terminate any account that violates these terms.
            </p>
            <label>
              <input type="checkbox" checked={policyAcceptance} onChange={privacyPolicyAccept} />
              {policyAcceptance ? "Decline Terms of Service" : "Accept Terms of Service"}
            </label>
          </div>
          
          <button className={standardStyle.submitButton} onClick={handleAccountCreationRequest}>Create Account!</button>
        </div>
    </div>
  );

}
 
export default CreateAccount;