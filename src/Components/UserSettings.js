import style from "./SettingsStyle.module.css";
import errorStyle from "./AccountWizard/AccountManagement.module.css";
import React, {useState, useEffect, useCallback} from "react"; 
import InterestSelection from "./Utilities/InterestSelection";
import standardizedStyle from "./Utilities/MixStandardizedStyle.module.css"
import InputBox from "./Utilities/InputBox";
import Dropdown from "./Utilities/Dropdown";

const UserSettings = (props) => {
  const [confirmDeletion, setConfirmDeletion] = useState(false);
  const [formErrorDisplay, setFormErrorDisplay] = useState({ active: false, message: ""});
  const [trendingInterests, setTrendingInterests] = useState([]);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [accountInfo, setAccountInfo] = useState({
    user_id: props.account.user_id,
    banner_picture: props.account.banner_picture,
    bio: props.account.bio,
    email: props.account.email,
    friends_list: props.account.friends_list,
    groups_joined: props.account.groups_joined,
    interests: props.account.interests,
    profile_picture: props.account.profile_picture,
    username: props.account.username,
    password: "",
    posts_made: props.account.posts_made,
    events: props.account.events,
    blocked: props.account.blocked
  });
  const [pass, setPass] = useState(true);

  //This state is used to assess which API calls need to made after the user clicks make changes.
  const [updatedFields, setUpdatedFields] = useState({
    displayName: false,
    email: false,
    password: false,
    bio: false,
    interests: false,
    profile_picture: false,
    banner_picture: false
  })

  //API Throttle variables
  const [lastRequest, setLastRequest] = useState(0);
  const requestCooldown = 5;

  //Handles account form user input
  const handleAccountForm = (name, value) => {
    //Save original information
    let displayName = accountInfo.username;
    let emailVal = accountInfo.email;
    let newPassword = accountInfo.password;
    let newBio = accountInfo.bio;
    let newPfp = accountInfo.profile_picture;
    let newBanner = accountInfo.banner_picture;

    //Track fields that change
    let displayNameChanged = updatedFields.displayName;
    let emailChanged = updatedFields.email;
    let passwordChanged = updatedFields.password;
    let bioChanged = updatedFields.bio;
    let pfpChanged = updatedFields.profile_picture;
    let bannerChanged = updatedFields.banner_picture;

    //Update fields that changed
    if (name === "displayName") {
      displayName = value;
      displayNameChanged = true;
    }
    if (name === "email") {
      emailVal = value;
      emailChanged = true;
    }
    if (name === "password") {
      newPassword = value;
      passwordChanged = true;
    }
    if (name === "bio") {
      newBio = value;
      bioChanged = true;
    }
    if (name === "pfp") {
      console.log(value);

      const file = value;
      const fileReader = new FileReader();

      fileReader.readAsDataURL(file);
      fileReader.onload = () => {
        newPfp = fileReader.result;
      }

      pfpChanged = true;
      console.log(value.type.split("/")[1]);
      console.log(newPfp);
    }
    if (name === "banner") {
      const file = value;
      const fileReader = new FileReader();

      fileReader.readAsDataURL(file);
      fileReader.onload = () => {
      newBanner = fileReader.result;
      bannerChanged = true;
      }
    }

    setAccountInfo({
      user_id: props.account.user_id,
      banner_picture: newBanner,
      bio: newBio,
      email: emailVal,
      friends_list: props.account.friends_list,
      groups_joined: props.account.groups_joined,
      interests: props.account.interests,
      profile_picture: newPfp,
      username: displayName,
      password: newPassword,
      posts_made: props.account.posts_made,
      events: props.account.events,
      blocked: props.account.blocked
    })

    console.log(updatedFields);

    setUpdatedFields({
      displayName: displayNameChanged,
      email: emailChanged,
      password: passwordChanged,
      bio: bioChanged,
      interests: updatedFields.interests,
      pfp: pfpChanged,
      banner: bannerChanged
    })
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
          response = await fetch("/* MAKE S3 IMAGE V2API */", {
          method: 'POST',
          body: JSON.stringify({
              "name": fileName,
              "file": binaryString
          }),
          });
          s3Response = await response.json();
      } catch (error) {
          setFormErrorDisplay({active: true, message: "Unable to process image, try again later!"});
          return;
      }

      let newUserPFP = accountInfo.profile_picture;
      let newUserBanner = accountInfo.banner_picture;
      let editUserResponse = "";
      if (name === "pfp") {
        try {
          response = await fetch('/* EDIT USER PFP API */', {
              method: 'PATCH',
              body: JSON.stringify({
              "user_id": accountInfo.user_id,
              "s3_pfp" : s3Response.URI
              }),
          });
          editUserResponse = await response.json();
          } catch (error) {
          setFormErrorDisplay({active: true, message: "Unable to save new profile picture to your profile, try again later!"});
          return;
          }
          newUserPFP = editUserResponse.pfp;
      }

      if (name === "banner") {
        try {
          response = await fetch('/* EDIT USER BANNER API */', {
            method: 'PATCH',
            body: JSON.stringify({
              "user_id": accountInfo.user_id,
              "s3_banner" : s3Response.URI
              }),
          });  
          editUserResponse = await response.json();
        } catch (error) {
          setFormErrorDisplay({active: true, message: "Unable to save new profile banner to your profile, try again later!"});
          return;
        }
        newUserBanner = editUserResponse.banner;
      }

      //Save pfp to account
      props.setAccount({
        user_id: props.account.user_id,
        banner_picture: newUserBanner,
        bio: props.account.bio,
        email: props.account.email,
        friends_list: props.account.friends_list,
        groups_joined: props.account.groups_joined,
        interests: props.account.interests,
        profile_picture: newUserPFP,
        username: props.account.username,
        posts_made: props.account.posts_made,
        events: props.account.events,
        blocked: props.account.blocked
      });
    }
  }

  //Saves user's settings changes
  const saveChanges = async (e) => {
    //Provides a cooldown based on the request cooldown.
    var currTime = new Date();
    if (requestCooldown >= (currTime.getSeconds() - lastRequest)) {
      return;
    } else {
      setLastRequest(currTime.getSeconds());
    }

    //API update username
    if (updatedFields.displayName) {
      try {
        await fetch('/* EDIT USERNAME API */', {
          method: 'PATCH',
          body: JSON.stringify({
            "user_id": accountInfo.user_id,
            "username": accountInfo.username
          }),
        })
        .then((response) => response.json())
      } catch (error) {
        console.log("API Request Failed: EditUsername");
        console.log(error);
        return;
      }
      console.log("EditUsername API Request Sent");
    }

    //API update email
    if (updatedFields.email) {
      if (accountInfo.email.indexOf(' ') !== -1 || accountInfo.email.indexOf('@') === -1 || accountInfo.email.indexOf('.') === -1 ) {
        setFormErrorDisplay({active: true, message: "Please enter a valid email address!"});
        return;
      }

      try {
        await fetch('/* EDIT USER EMAIL API */', {
          method: 'PATCH',
          body: JSON.stringify({
            "user_id": accountInfo.user_id,
            "email": accountInfo.email
          }),
        })
        .then((response) => response.json())
        .then((json) => console.log("User Settings Email Patch Request Sent"));
      } catch (error) {
        setFormErrorDisplay({active: true, message: "Unable to update your email, please try again later!"});
        return;
      }
    }

    //API update password
    if (updatedFields.password) {
      try {
        await fetch('EDIT USER PASSWORD', {
          method: 'PATCH',
          body: JSON.stringify({
            "user_id": accountInfo.user_id,
            "password": accountInfo.password
          }),
        })
        .then((response) => response.json())
        .then((json) => console.log("User Settings Password Patch Request Sent"));
      } catch (error) {
        setFormErrorDisplay({active: true, message: "Unable to update your password, please try again later!"});
        return;
      }
    }

    //API update bio
    if (updatedFields.bio) {
      try {
        await fetch('/* EDIT USER BIO API */', {
          method: 'PATCH',
          body: JSON.stringify({
            "user_id": accountInfo.user_id,
            "bio": accountInfo.bio
          }),
        })
        .then((response) => response.json())
        console.log("User Settings Bio Patch Request Sent");
      } catch (error) {
        setFormErrorDisplay({active: true, message: "Unable to update your bio, please try again later!"});
        return;
      }
      
    }

    //Updates the user's interests
    if (updatedFields.interests) {
      //Remove all user interests
      try {
        await fetch('/* REMOVE USER INTEREST API */', {
          method: 'PATCH',
          body: JSON.stringify({
            "user_id": accountInfo.user_id,
            "interests": props.account.interests
          }),
        })
        .then((response) => response.json())
        console.log("User Settings Interest Removal Request Sent");
      } catch (error) {
        setFormErrorDisplay({active: true, message: "Unable to your remove old interests, please try again later!"});
        return;
      }

      //Add back the ones the user has selected
      try {
        await fetch('/* ADD USER INTEREST API */', {
          method: 'PATCH',
          body: JSON.stringify({
            "user_id": accountInfo.user_id,
            "interests": accountInfo.interests
          }),
        })
        .then((response) => response.json())
        console.log("User Settings Interest Addition Request Sent");
      } catch (error) {
        setFormErrorDisplay({active: true, message: "Unable to add your new interests, please try again later!"});
        return;
      }
    }

    props.setAccount(accountInfo);
    props.updatePage("user-profile", accountInfo.user_id);
  }

  //Adds newly selected interests to the user's account
  const addInterests = async (newInterests) => {
    let newInterestNames = [];
    for (let i = 0; i < newInterests.length; i++) {
      newInterestNames.push(newInterests[i].interestName);
    }
    try {
      await fetch('/* ADD USER INTEREST API */', {
        method: 'PATCH',
        body: JSON.stringify({
          "user_id": props.account.user_id,
          "interests": newInterestNames
        }),
      })
      .then((response) => console.log(response.json()))
      console.log("Account Creation Interest Addition Request Sent");
    } catch (error) {
      setFormErrorDisplay({active: true, message: "Unable to add your new interests, please try again later!"});
      return;
    }

    //Save data
    let newInterestArray = accountInfo.interests;
    if (accountInfo.interests === "null") {
      newInterestArray = [];
    }
   
    for (let i = 0; i < newInterests.length; i++) {
      let interestAlreadySaved = false;
      for (let j = 0; j < newInterestArray.length; j++) {
        if (newInterestArray[j].interestID === newInterests[i].interestID) {
          interestAlreadySaved = true;
        }
      }

      if (!interestAlreadySaved) {
        newInterestArray.push(newInterests[i]);
      }
    }

    props.setAccount({
      user_id: props.account.user_id,
      banner_picture: props.account.banner_picture,
      bio: props.account.bio,
      email: props.account.email,
      friends_list: props.account.friends_list,
      groups_joined: props.account.groups_joined,
      interests: newInterestArray,
      profile_picture: props.account.profile_picture,
      username: props.account.username,
      password: props.account.password,
      posts_made: props.account.posts_made,
      events: props.account.events,
      blocked: props.account.blocked
    });
  }

  //Removes set interests from the user's account
  const removeInterests = async (removedInterests) => {
    let removedInterestNames = [];
    for (let i = 0; i < removedInterests.length; i++) {
      removedInterestNames.push(removedInterests[i].interestName);
    }
    try {
      await fetch('/* REMOVE USER INTEREST API */', {
        method: 'PATCH',
        body: JSON.stringify({
          "user_id": props.account.user_id,
          "interests": removedInterestNames
        }),
      })
      .then((response) => response.json())
      console.log("User Settings Interest Removal Request Sent");
    } catch (error) {
      setFormErrorDisplay({active: true, message: "Unable to remove your old interests, please try again later!"});
      return;
    }

    //Save data on frontend
    let newInterestArray = [];
    for (let i = 0; i < accountInfo.interests.length; i++) {
      let keepInterest = true;
      for (let j = 0; j < removedInterests.length; j++) {
        if (accountInfo.interests[i].interestID === removedInterests[j].interestID) {
          keepInterest = false;
        }
      }

      if (keepInterest) {
        newInterestArray.push(accountInfo.interests[i]);
      }
    }

    console.log(newInterestArray);

    props.setAccount({
      user_id: props.account.user_id,
      banner_picture: props.account.banner_picture,
      bio: props.account.bio,
      email: props.account.email,
      friends_list: props.account.friends_list,
      groups_joined: props.account.groups_joined,
      interests: newInterestArray,
      profile_picture: props.account.profile_picture,
      username: props.account.username,
      password: props.account.password,
      posts_made: props.account.posts_made,
      events: props.account.events,
      blocked: props.account.blocked
    });
  }

  const deleteAccount = async () => {
    try {
      let endpoint = "/* DELETE ACCOUNT API */" + accountInfo.user_id;
      await fetch(endpoint, {
        method: 'DELETE'
      })
      .then((response) => response.json())
      .then((json) => console.log("API Request: Delete Account"));
    } catch (error) {
      setFormErrorDisplay({active: true, message: "Unable to delete your account, please try again later!"});
      return;
    }
  
    //Nullify account on frontend too
    props.setAccount({
      user_id: "null",
      banner_picture: "null",
      bio: "null",
      email: "null",
      friends_list: "null",
      groups_joined: "null",
      interests: "null",
      profile_picture: "null",
      username: "null",
      posts_made: [],
      events: [],
      blocked: []
    });
    props.updatePage("login", "null");
  }

  const cancelDeleteAccount = (e) => {
    setConfirmDeletion(false);
  }
  const confirmDeleteAccount = (e) => {
    setConfirmDeletion(true);
  }

  //Fetches trending interests and passes it to be populated
  const fetchData = useCallback(async () => { 
    let failedTrendingInterests = false;
    let trendingInterestsObj;
    try {
        let fetchResp = await fetch("/* GET TRENDING INTERESTS API */");
        trendingInterestsObj = await fetchResp.json();
    } catch (error) {
        failedTrendingInterests = true;
    }

    let failedGetBlockedUsers = false;
    let blockedUsersObj;
    try {
        let fetchResp = await fetch("/* GET BLOCKED USERS API */" + props.account.user_id);
        blockedUsersObj = await fetchResp.json();
        if (!failedGetBlockedUsers) {
          let blockedUsers = [];
          for (let i = 0; i < blockedUsersObj.data.blocked_users.length; i++) {
            blockedUsers.push({
              name: blockedUsersObj.data.blocked_users[i].username,
              key: blockedUsersObj.data.blocked_users[i].user_id
            })
          }
          setBlockedUsers(blockedUsers)
        } else {
          setFormErrorDisplay({active: true, message: "Unable retrieve your blocked users, please try again later!"});
        }
    } catch (error) {
      failedGetBlockedUsers = true;
    }

    if (!failedTrendingInterests) {
      let interestOptions = [];
      for (let i = 0; i < trendingInterestsObj.interests.length; i++) {
        interestOptions.push(trendingInterestsObj.interests[i]);
      }
      setTrendingInterests(interestOptions);
    } else {
      setFormErrorDisplay({active: true, message: "Unable retrieve trending interests, please try again later!"});
      setTrendingInterests([]);
    }
  }, [props.account.user_id]);

  //Fetches data on component mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const unblockUser = async (key) => {    
    if (key === "") return;

    try {
      let response = await fetch('/* UNBLOCK MEMBER API */', {
        method: 'PATCH',
        body: JSON.stringify({
          "user_id": props.account.user_id,
          "blocked_user_id": key
        }),
      })
      response = await response.json();  
      console.log(response);
      console.log("UnblockMember API Request Sent");
    } catch (error) {
      console.log(error);
      setFormErrorDisplay({active: true, message: "Unable to unblock that user, please try again later!"});
      return;
    }

    let blockedUsers = [];
    for (let i = 0; i < blockedUsers.length; i++) {
      if (blockedUsers[i].key !== key) {
        blockedUsers.push({
          name: blockedUsers[i].username,
          key: blockedUsers[i].user_id
        });  
      }
    }
    setBlockedUsers(blockedUsers);

    blockedUsers = [];
    for (let i = 0; i < blockedUsers.length; i++) {
      if (blockedUsers[i].key !== key) {
        blockedUsers.push( blockedUsers[i].user_id);  
      }
    }
    setAccountInfo({
      user_id: props.account.user_id,
      banner_picture: props.account.banner_picture,
      bio: props.account.bio,
      email: props.account.email,
      friends_list: props.account.friends_list,
      groups_joined: props.account.groups_joined,
      interests: props.account.interests,
      profile_picture: props.account.profile_picture,
      username: props.account.username,
      posts_made: props.account.posts_made,
      events: props.account.events,
      blocked: props.account.blocked
    })
  }

  const minimizeErrorBanner = () => {
    setFormErrorDisplay({active: false, message: ""});
  }

  const changeType = () => {
    setPass(!pass);
  }

  return (
    <div id={style.body}>
      {formErrorDisplay.active ?
          <div id={errorStyle.errorBanner}>
              <div id={errorStyle.errorBannerText}>
                  <h2>{formErrorDisplay.message}</h2>
              </div>
                <button className={errorStyle.minimizeErrorBannerButton} onClick={minimizeErrorBanner}><b>Minimize</b></button>
          </div>
      : React.Fragment }

      <div id={style.settings}>
        <h1>Account Settings</h1>
        <div id={standardizedStyle.inputSectionFormatting}>
          <InputBox type={"text"} name={"displayName"} headerText={"Username:"} value={accountInfo.username} onChange={handleAccountForm}/>
          <InputBox type={"text"} name={"email"} headerText={"Email:"} value={accountInfo.email} onChange={handleAccountForm}/>
          <InputBox type={pass ? "password" : "text"} name={"password"} headerText={"New Password:"} value={accountInfo.password} onChange={handleAccountForm} changeType={changeType}/>
          <InputBox type={"text"} name={"bio"} headerText={"Bio:"} value={accountInfo.bio} onChange={handleAccountForm}/>
          <InputBox type={"image"} name={"pfp"} headerText={"Profile Photo:"} buttonText={"Upload Photo"} onChange={updateMedia}/>
          <InputBox type={"image"} name={"banner"} headerText={"Banner:"} buttonText={"Upload Photo"} onChange={updateMedia}/>
          <Dropdown headerText={"Unblock a user"} dropdownSubtitle={"Select a blocked user"} submitButtonText={"Unblock user"} list={blockedUsers} confirmedSelection={unblockUser}/>
        </div>
        <InterestSelection editable={true} addInterests={addInterests} removeInterests={removeInterests} preSelectInterests={accountInfo.interests} trendingInterests={trendingInterests} account={props.account} key={Math.random()}/>
        
        {confirmDeletion ? 
          <div>
            <button className={style.deleteEntity} onClick={confirmDeleteAccount}>Confirm Account Deletion</button>
            <button className={style.deleteEntity} onClick={cancelDeleteAccount}>Cancel</button>
          </div>
          : 
          <button className={style.deleteEntity} onClick={deleteAccount}>Delete Account</button> 
        }
        <br></br>
        <button className={standardizedStyle.submitButton} onClick={saveChanges}>Save Changes</button>
      </div> 
    </div>
  );
}
 
export default UserSettings;