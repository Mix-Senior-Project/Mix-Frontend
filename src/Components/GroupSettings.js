import style from "./SettingsStyle.module.css";
import errorStyle from "./AccountWizard/AccountManagement.module.css";
import standardizedStyle from "./Utilities/MixStandardizedStyle.module.css"
import React, {useState, useEffect, useCallback} from "react"; 
import InterestSelection from "./Utilities/InterestSelection";
import InputBox from "./Utilities/InputBox";
import Dropdown from "./Utilities/Dropdown";

const GroupSettings = (props) => {
  const [formErrorDisplay, setFormErrorDisplay] = useState({ active: false, message: ""});
  const [confirmDeletion, setConfirmDeletion] = useState(false);
  const [groupName, setGroupName] = useState("null");
  const [groupBio, setGroupBio] = useState("null");
  const [groupInterests, setGroupInterests] = useState([]);
  const [groupPrivacy, setGroupPrivacy] = useState("public");
  const [groupMods, setGroupMods] = useState([]);
  const [groupMembers, setGroupMembers] = useState([]);
  const [originalGroup, setOriginalGroup] = useState(null);
  const [viewerPermissionRole, setViewerPermissionRole] = useState("none");
  const [trendingInterests, setTrendingInterests] = useState([]);
  const [banList, setBanList] = useState([]);

  //API Throttle Values
  const [lastRequest, setLastRequest] = useState(0);
  const requestCooldown = 5;

  const fetchData = useCallback(async () => {
    //Get group info
    let groupObj = "";
    try {
      await fetch(("/* GET GROUP API */" + props.groupID))
        .then(response => response.json())
        .then(json => groupObj = json)
    } catch (error) {
      console.log("API Failure for GetGroup!");
      props.updatePage("group-profile", props.groupID);
      return;
    }

    //Update group metadata
    setOriginalGroup(groupObj);
    setGroupName(groupObj.group_name);
    setGroupBio(groupObj.bio);
    if ((groupObj.interests === null) || (groupObj.interests === "null")) {
      setGroupInterests([]); 
    } else {
      setGroupInterests(groupObj.interests);
    }
   
    if (groupObj.private === 0) {
      setGroupPrivacy("public");
    } else {
      setGroupPrivacy("private");
    }

    //Save user lists and roles
    let modList = [];
    let memberList = [];
    for (let i  = 0; i < groupObj.users_and_roles.length; i++) {
      if (groupObj.users_and_roles[i].role === "member") {
        memberList.push({name: groupObj.users_and_roles[i].username, key: groupObj.users_and_roles[i].userID});
      }
      if (groupObj.users_and_roles[i].role === "mod") {
        modList.push({name: groupObj.users_and_roles[i].username, key: groupObj.users_and_roles[i].userID});
      }
    }
    setGroupMods(modList);
    setGroupMembers(memberList);

    //Determine viewer permission level
    if (props.viewerAccount.user_id === groupObj.owner_id) {
      setViewerPermissionRole("owner");
    }

    for (let i = 0; i < modList.length; i++) {
      if (modList[i] === props.viewerAccount.user_id) {
        setViewerPermissionRole("mod");
      }
    }

    //Get trending interests
    let banListObj;
    try {
        let fetchResp = await fetch(("/* GET BANNED MEMBERS API */" + groupObj.group_id));
        banListObj = await fetchResp.json();
    } catch (error) {
      console.log(error);
      console.log("Failed GetBannedMembers API Call");
      setBanList([]);
    }

    let newBanList = [];
    if ((banListObj !== null) && (banListObj !== "null")) {
      for (let i  = 0; i < banListObj.banned.length; i++) {
        newBanList.push({name: banListObj.banned[i].username, key: banListObj.banned[i].userID});
      }  
    }
    
    setBanList(newBanList);

    //Get trending interests
    let trendingInterestsObj;
    try {
        let fetchResp = await fetch("/* GET TRENDING INTERESTS API */");
        trendingInterestsObj = await fetchResp.json();
    } catch (error) {
      setFormErrorDisplay({active: true, message: "Unable to get trending interests, please try again later!"});
      return;
    }
    let interestOptions = [];
    for (let i = 0; i < trendingInterestsObj.interests.length; i++) {
      interestOptions.push(trendingInterestsObj.interests[i]);
    }
    setTrendingInterests(interestOptions);
  }, []);

  //Initializes component metadata
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const saveChanges = async (e) => {
    //Provides a cooldown based on the request cooldown.
    var currTime = new Date();
    if (requestCooldown >= (currTime.getSeconds() - lastRequest)) {
      return;
    } else {
      setLastRequest(currTime.getSeconds());
    }
    
    //Update backend information and frontend group with changed
    if (originalGroup.private !== groupPrivacy) {
      try {
        await fetch(('/* FLIP GROUP PRIVACY API */' + props.groupID), {
        method: 'PATCH'
      })
      .then((response) => response.json())
      .then((json) => console.log("Flip Group Privacy Patch Request Sent"));
      } catch (error) {
        setFormErrorDisplay({active: true, message: "Unable to adjust group privacy, please try again later!"});
        return;
      }
    }

    if (originalGroup.name !== groupName) {
      try {
        await fetch('/* EDIT GROUP NAME API */', {
          method: 'PATCH',
          body: JSON.stringify({
            "group_id": props.groupID,
            "group_name": groupName
          }),
        })
        .then((response) => response.json())
        console.log("Edit Group Name Patch Request Sent");
      } catch (error) {
        setFormErrorDisplay({active: true, message: "Unable to save the new group name, please try again later!"});
        return;
      }
    }

    if (originalGroup.bio !== groupBio) {
      try {
        await fetch('/* EDIT GROUP BIO API */', {
          method: 'PATCH',
          body: JSON.stringify({
            "group_id": props.groupID,
            "bio": groupBio
          }),
        })
        .then((response) => response.json())
        console.log("Edit Group Bio Patch Request Sent");
      } catch (error) {
        setFormErrorDisplay({active: true, message: "Unable to save the new group bio, please try again later!"});
        return;
      }
    }

    //Save new group object to account.groups_joined list
    let newGroupObj = {
      group_id: originalGroup.group_id,
      group_name: groupName,
      private: groupPrivacy,
      creation_date: originalGroup.creation_date,
      users_and_roles: groupMembers,
      posts_made: originalGroup.posts_made,
      group_interests: groupInterests,
      member_count: originalGroup.member_count,
      banner_picture: originalGroup.banner_picture,
      group_owner_id: originalGroup.group_owner_id,
      profile_picture: originalGroup.profile_picture
    }

    let newGroupsJoinedList = [];
    for (let i = 0; i < props.viewerAccount.groups_joined.length; i++) {
      if (props.viewerAccount.groups_joined[i].group_id !== newGroupObj.group_id) {
        newGroupsJoinedList.push(props.viewerAccount.groups_joined[i]);
      } else {
        newGroupsJoinedList.push(newGroupObj);
      }
    }

    props.setAccount({
      user_id: props.viewerAccount.user_id,
      banner_picture: props.viewerAccount.banner_picture,
      bio: props.viewerAccount.bio,
      email: props.viewerAccount.email,
      friends_list: props.viewerAccount.friends_list,
      groups_joined: newGroupsJoinedList,
      interests: props.viewerAccount.interests,
      profile_picture: props.viewerAccount.profile_picture,
      username: props.viewerAccount.username,
      posts_made: props.viewerAccount.posts_made,
      events: props.viewerAccount.events,
      blocked: props.viewerAccount.blocked
    });

    props.updatePage("group-profile", props.groupID);
  }

  //Methods for reading user input
  const handleGroupForm = (name, value) => {
    if (name === "groupName") {
      setGroupName(value);
    } else if (name === "bio") {
      setGroupBio(value);    
    }
  }

  const updateGroupBanner = (name, file) => {
    //Handle file upload and API processing
    const fileReader = new FileReader();
    fileReader.readAsDataURL(file);
    fileReader.onload = async () => {
      let fileName = (Math.round(100000000*Math.random())) + "." + file.type.split("/")[1];
      let binaryString = fileReader.result + "=="; 
      let s3Response = "";
      let response;

      //Save image as an S3 Object with AWS
      try {
        response = await fetch("/* MAKE S3 IMAGE V2 API */", {
          method: 'POST',
          body: JSON.stringify({
            "name": fileName,
            "file": binaryString
          }),
        });
        s3Response = await response.json();
      } catch (error) {
        setFormErrorDisplay({active: true, message: "Unable to upload photo, please try again later!"});
        return;
      }
      
      //Get S3 URL and save it to the new post metadata
      try {
        response = await fetch('/* EDIT GROUP BANNER API */', {
          method: 'PATCH',
          body: JSON.stringify({
            "group_id": props.groupID,
            "s3_banner" : s3Response.URI
            }),
        })  
      } catch (error) {
        setFormErrorDisplay({active: true, message: "Unable to save the new group profile photo, please try again later!"});
        return;
      }
      await response.json();
    }
  }

  const updateGroupPFP = (name, file) => {
    //Handle file upload and API processing
    const fileReader = new FileReader();
    fileReader.readAsDataURL(file);
    fileReader.onload = async () => {
      let fileName = (Math.round(100000000*Math.random())) + "." + file.type.split("/")[1];
      let binaryString = fileReader.result + "=="; 
      let s3Response = "";
      let response;

      //Save image as an S3 Object with AWS
      try {
        response = await fetch("/* MAKE S3 IMAGE V2 API */", {
          method: 'POST',
          body: JSON.stringify({
            "name": fileName,
            "file": binaryString
          }),
        });
        s3Response = await response.json();
      } catch (error) {
        setFormErrorDisplay({active: true, message: "Unable to upload the new photo, please try again later!"});
        return;
      }
      
      //Get S3 URL and save it to the new post metadata
      try {
        response = await fetch('/* EDIT GROUP PROFILE PHOTO API */', {
          method: 'PATCH',
          body: JSON.stringify({
            "group_id": props.groupID,
            "s3_pfp" : s3Response.URI
            }),
        });
      } catch (error) {
        setFormErrorDisplay({active: true, message: "Unable to save the new group profile photo, please try again later!"});
        return;
      }
      await response.json();
    }
  }

  const updateGroupPrivacy = (key) => {
    setGroupPrivacy(key);
  }

  const removeModerator = async (key) => {
    //Provides a cooldown based on the request cooldown.
    var currTime = new Date();
    if (requestCooldown >= (currTime.getSeconds() - lastRequest)) {
      return;
    } else {
      setLastRequest(currTime.getSeconds());
    }

    try {
      await fetch('/* REMOVE MOD API */', {
        method: 'PATCH',
        body: JSON.stringify({
          "user_id": key,
          "group_id": props.groupID
        }),
      })
      .then((response) => response.json())
      console.log("Remove Group Mod Patch Request Sent");
    } catch (error) {
      setFormErrorDisplay({active: true, message: "Unable to remove moderator, please try again later!"});
      return;
    }

    //Update moderator & member list on frontend
    let memberList = groupMembers;
    for (let i = 0; i < groupMods.length; i++) {
      if (key === groupMods[i].key) {
        memberList.push({
          name: groupMods[i].name,
          key: key
        });
        break;
      }
    } 
    setGroupMembers(memberList);

    let modList = [];
    for(let i = 0; i < groupMods.length; i++) {
      if (groupMods[i].key !== key) {
        modList.push({name: groupMods[i], key: groupMods[i]});
      }
    }
    setGroupMods(modList);
  }

  const addModerator = async (key) => {
    if (key === "") return;

    //Provides a cooldown based on the request cooldown.
    var currTime = new Date();
    if (requestCooldown >= (currTime.getSeconds() - lastRequest)) {
      return;
    } else {
      setLastRequest(currTime.getSeconds());
    }

    //Make API Request to the new add mod
    try {
      await fetch('/* ADD MOD API */', {
        method: 'PATCH',
        body: JSON.stringify({
          "user_id": key,
          "group_id": props.groupID
        }),
      })
      .then((response) => response.json())
      console.log("Add Group Mod Patch Request Sent");
    } catch (error) {
      setFormErrorDisplay({active: true, message: "Unable to add the new moderator, please try again later!"});
      return;
    }

    //Add user to mod list and remove them from member list
    let moderatorList = groupMods;
    for (let i = 0; i < groupMembers.length; i++) {
      if (key === groupMembers[i].key) {
        moderatorList.push({
          name: groupMembers[i].name,
          key: key
        });
        break;
      }
    }
    
    setGroupMods(moderatorList);

    let memberList = [];
    for (let i = 0; i < groupMembers.length; i++) {
      if (groupMembers[i].key !== key) {
        memberList.push(groupMembers[i]);
      }
    }
    setGroupMembers(memberList);
  }


  const kickMember = async (key) => {
    if (key === "") return;
    
    //Provides a cooldown based on the request cooldown.
    var currTime = new Date();
    if (requestCooldown >= (currTime.getSeconds() - lastRequest)) {
      return;
    } else {
      setLastRequest(currTime.getSeconds());
    }

    //Handle API Request
    try {
      await fetch('/* LEAVE GROUP API */', {
        method: 'PATCH',
        body: JSON.stringify({ 
          "user_id": key,
          "group_id" : props.groupID
      }),
      })
      .then((response) => response.json())
      console.log("LeaveGroup API Request Sent");
    } catch (error) {
      setFormErrorDisplay({active: true, message: "Unable to remove member from the group, please try again later!"});
      return;
    }
    console.log("LeaveGroup API Request Sent");

    //Update frontend member list
    let memberList = [];
    for (let i = 0; i < groupMembers.length; i++) {
      if (groupMembers[i].key !== key) {
        memberList.push(groupMembers[i]);
      }
    }
    setGroupMembers(memberList);
  }

  const cancelDeleteGroup = (e) => {
    setConfirmDeletion(false);
  }
  
  const confirmDeleteGroup = (e) => {
    setConfirmDeletion(true);
  }

  //Delete group call
  const deleteGroup = async (e) => {
    //Provides a cooldown based on the request cooldown.
    var currTime = new Date();
    if (requestCooldown >= (currTime.getSeconds() - lastRequest)) {
      return;
    } else {
      setLastRequest(currTime.getSeconds());
    }

    try {
      await fetch(('/* DELETE GROUP API */' + props.groupID), {
        method: 'DELETE'
      });
      console.log("API Request Sent: Delete Group");
    } catch (error) {
      setFormErrorDisplay({active: true, message: "Unable to delete the group, please try again later!"});
      return;
    }
    
    //Update viewer account list on frontend with new group list
    let newGroupList = [];
    for (let i = 0; i < props.viewerAccount.groups_joined.length; i++) {
      if (props.viewerAccount.groups_joined[i].group_id !== props.groupID) {
        newGroupList.push(props.viewerAccount.groups_joined[i]);
      }
    }

    props.setAccount({
      user_id: props.viewerAccount.user_id,
      banner_picture: props.viewerAccount.banner_picture,
      bio: props.viewerAccount.bio,
      email: props.viewerAccount.email,
      friends_list: props.viewerAccount.friends_list,
      groups_joined: newGroupList,
      interests: props.viewerAccount.interests,
      profile_picture: props.viewerAccount.profile_picture,
      username: props.viewerAccount.username,
      posts_made: props.viewerAccount.posts_made,
      events: props.viewerAccount.events,
      blocked: props.viewerAccount.blocked
    })
    props.updatePage("default", "null");
  }

  //Adds newly selected interests to the user's account
  const addInterests = async (newInterests) => {
    let newInterestNames = [];
    for (let i = 0; i < newInterests.length; i++) {
      newInterestNames.push(newInterests[i].interestName);
    }
    try {
      await fetch('/* ADD GROUP INTEREST API */', {
        method: 'PATCH',
        body: JSON.stringify({
          "group_id": originalGroup.group_id,
          "group_interests" : newInterestNames
          }),
      })
      .then((response) => response.json())
      console.log("Group Settings Interest Addition Request Sent");
    } catch (error) {
      console.log(error);
      setFormErrorDisplay({active: true, message: "Unable to save new group interests, please try again later!"});
      return;
    }

    //Save data
    let newInterestArray = groupInterests;
    if (groupInterests === "null") {
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
    setGroupInterests(newInterestArray);
  }

  //Removes set interests from the user's account
  const removeInterests = async (removedInterests) => {
    console.log(removedInterests);
    let removedInterestNames = [];
    for (let i = 0; i < removedInterests.length; i++) {
      removedInterestNames.push(removedInterests[i].interestName);
    }

    try {
      await fetch('/* REMOVE GROUP INTEREST API */', {
        method: 'PATCH',
        body: JSON.stringify({
          "group_id": originalGroup.group_id,
          "group_interests" : removedInterestNames
          }),
      })
      .then((response) => response.json())
      console.log("Group Settings Interest Removal Request Sent");
    } catch (error) {
      setFormErrorDisplay({active: true, message: "Unable to save remove old group interests, please try again later!"});
      return;
    }

    //Save data on frontend
    let newInterestArray = [];
    for (let i = 0; i < groupInterests.length; i++) {
      let keepInterest = true;
      for (let j = 0; j < removedInterests.length; j++) {
        if (groupInterests[i].interestID === removedInterests[j].interestID) {
          keepInterest = false;
        }
      }

      if (keepInterest) {
        newInterestArray.push(groupInterests[i]);
      }
    }
    setGroupInterests(newInterestArray);
  }

  //Bans a user from the group
  const banMember = async (key) => {
    let accountObj = "null";
    try {
      await fetch("/* GET ACCOUNT API */" + key)
      .then(response => response.json())
      .then(json => accountObj = json)
    } catch (error) {
      console.log(error);
      console.log("GetAccount API failure!");
      return;
    }
    console.log("GetAccount API request sent!");

    try {
      await fetch('/* BAN MEMBER API */', {
        method: 'PATCH',
        body: JSON.stringify({
          "groupID": originalGroup.group_id,
          "userID": key,
          "username": accountObj.username,
        }),
      })
      console.log("BanMember API Request Sent");
    } catch (error) {
      console.log(error);
      console.log("BanMember API Failure");
      return;
    }

    let newMemberList = [];
    for (let i = 0; i < groupMembers.length; i++) {
      if (key !== groupMembers[i].key) {
        newMemberList.push(groupMembers[i]);
      }
    }
    setGroupMembers(newMemberList);

    let newBanList = banList;
    newBanList.push({name: accountObj.username, key: key});
    setBanList(newBanList);
  }

  const unbanMember = async (key) => {
    let username = "null";
    for (let i = 0; i < banList.length; i++) {
      if (key === banList[i].key) {
        username = banList[i].name;
        break
      }
    }

    try {
      await fetch('/* UNBAN MEMBER API */', {
        method: 'PATCH',
        body: JSON.stringify({
          "groupID": originalGroup.group_id,
          "userID": key,
          "username": username,
        }),
      })
      console.log("BanMember API Request Sent");
    } catch (error) {
      console.log(error);
      console.log("BanMember API Failure");
      return;
    }

    let newBanList = [];
    for (let i = 0; i < banList.length; i++) {
      if (banList[i].key !== key) {
        newBanList.push(banList[i]);
      }
    }
    setBanList(newBanList);
  }

  const minimizeErrorBanner = () => {
    setFormErrorDisplay({active: false, message: ""});
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
        <h1>Group Settings</h1>
        <div id={standardizedStyle.inputSectionFormatting}>
          <InputBox type={"text"} name={"groupName"} headerText={"Group Name:"} value={groupName} onChange={handleGroupForm}/>
          <InputBox type={"text"} name={"bio"} headerText={"Group Bio:"} value={groupBio} onChange={handleGroupForm}/>
          <InputBox type={"image"} name={"pfp"} headerText={"Group Photo:"} buttonText={"Upload Photo"} onChange={updateGroupPFP}/>
          <InputBox type={"image"} name={"banner"} headerText={"Group Banner:"} buttonText={"Upload Photo"} onChange={updateGroupBanner}/>

          <Dropdown headerText={"Group Privacy"} dropdownSubtitle={"Select your privacy level"} submitButtonText={"Save choice"} list={[{name: "Public", key: "public"}, {name: "Private", key: "private"}]} confirmedSelection={updateGroupPrivacy}/>
          <Dropdown headerText={"Kick Group Member"} dropdownSubtitle={"Select a member"} submitButtonText={"Kick Group Members"} list={groupMembers} confirmedSelection={kickMember}/>
          { viewerPermissionRole === "owner" ? 
            <div>
              <Dropdown headerText={"Add a Moderator"} dropdownSubtitle={"Select a member"} submitButtonText={"Add Moderator Role"} list={groupMembers} confirmedSelection={addModerator}/>
              <Dropdown headerText={"Remove a Moderator"} dropdownSubtitle={"Select a moderator"} submitButtonText={"Remove Moderator Role"} list={groupMods} confirmedSelection={removeModerator}/>
            </div> : React.Fragment
          }
          <Dropdown headerText={"Ban a Group Member"} dropdownSubtitle={"Select a member"} submitButtonText={"Ban User"} list={groupMembers} confirmedSelection={banMember}/>
          <Dropdown headerText={"Unban a Group Member"} dropdownSubtitle={"Select a banned user"} submitButtonText={"Unban User"} list={banList} confirmedSelection={unbanMember}/>
        </div>
        
        <br></br>
        <InterestSelection editable={true} addInterests={addInterests} removeInterests={removeInterests} preSelectInterests={groupInterests} trendingInterests={trendingInterests} account={props.viewerAccount} key={Math.random()}/>

        { viewerPermissionRole === "owner" ? 
          (confirmDeletion ? 
            <div>
              <button className={style.deleteEntity} onClick={confirmDeleteGroup}>Confirm Group Deletion</button>
              <button className={style.deleteEntity} onClick={cancelDeleteGroup}>Cancel</button>
            </div>
            : 
            <button className={style.deleteEntity} onClick={deleteGroup}>Delete Group</button> 
          )
          : React.Fragment
        } 
        <br></br>
        <button className={standardizedStyle.submitButton} onClick={saveChanges}>Save Changes</button>
      </div> 
    </div>
  );
}
 
export default GroupSettings;