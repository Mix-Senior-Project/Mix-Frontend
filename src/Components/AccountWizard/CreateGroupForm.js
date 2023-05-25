import style from './AccountManagement.module.css';
import standardStyle from "../Utilities/MixStandardizedStyle.module.css";
import React, {useState} from "react";
import InputBox from "../Utilities/InputBox";

const CreateGroupForm = (props) => {
  //API Cooldown variables
  const [lastRequest, setLastRequest] = useState(0);
  const requestCooldown = 5;

  //Group Management and General States
  const [formErrorDisplay, setFormErrorDisplay] = useState(false);
  const [groupInfo, setGroupInfo] = useState({
    groupName: "",
    pfp: "image upload button TBD",
    backgroundPhoto: "image upload button TBD",
    bio: "",
    profile_picture: "null",
    banner_picture: "null"
  });

  //Handles group form user input
  const handleGroupForm = (name, value) => {
    let groupName = groupInfo.groupName;
    let bio = groupInfo.bio;

    if (name === "groupName") {
      groupName = value;
    }
    if (name === "bio") {
      bio = value;
    }

    setGroupInfo({
      groupName: groupName,
      profile_picture: groupInfo.profile_picture,
      banner_picture: groupInfo.banner_picture,
      bio: bio
    });
  }

  //Handles Group Creation click
  const handleGroupCreationRequest = async (e) => {
    e.preventDefault();
    if ((groupInfo.groupName === "") || (groupInfo.groupName[0] === ' ') || (groupInfo.groupName[groupInfo.groupName.length] === ' ')) {
      setFormErrorDisplay(true);
      return;
    }

    var currTime = new Date();
    if (requestCooldown >= (currTime.getSeconds() - lastRequest)) {
      return;
    } else {
      setLastRequest(currTime.getSeconds());
    }
  
    //Create group with backend
    const timeNow = new Date();
    let currTimeStamp = timeNow.getFullYear() + "-" + (timeNow.getMonth()+1) + "-" + (timeNow.getDate()) + " " + timeNow.getHours() + ":" + timeNow.getMinutes() + ":" + timeNow.getSeconds();

    let groupObj = "";
    
    console.log(groupInfo.profile_picture);
    console.log(groupInfo.banner_picture);

    try {
      await fetch('/* MAKE GROUP API */', {
        method: 'PUT',
        body: JSON.stringify({
        "group_id": "",
        "group_name": groupInfo.groupName,
        "creation_date": currTimeStamp,
        "s3_banner": groupInfo.banner_picture,
        "group_owner_id": props.account.user_id,
        "s3_pfp": groupInfo.profile_picture,
        "group_bio": groupInfo.bio
        }),
      })
      .then((response) => response.json())
      .then((json) => groupObj = json);  
    } catch (error) {
      console.log("API Request Failed: MakeGroup");
      props.setLogin(props.account.user_id);
      return;
    }
    console.log("MakeGroup API Request Sent");

    if (props.displayMode === "popup") {
      props.updatePage("group-profile", groupObj.group_id);
    }
    
    props.newGroup({
      group_id: groupObj.group_id,
      group_name: groupObj.group_name,
      private: groupObj.private,
      creation_date: groupObj.creation_date,
      users_and_roles: groupObj.users_and_roles,
      posts_made: groupObj.posts_made,
      group_interests: [],
      member_count: groupObj.member_count,
      banner_picture: groupObj.banner_picture,
      group_owner_id: groupObj.group_owner_id,
      profile_picture: groupObj.profile_picture,
      bio: groupInfo.bio
    });
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
          response = await fetch("/* MAKE S3 IMAGE V2 API */", {
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
        setGroupInfo({
          groupName: groupInfo.groupName,
          profile_picture: s3Response.URI,
          banner_picture: groupInfo.banner_picture,
          bio: groupInfo.bio
        });
      }

      if (name === "banner") {
        setGroupInfo({
          groupName: groupInfo.groupName,
          profile_picture: groupInfo.profile_picture,
          banner_picture: s3Response.URI,
          bio: groupInfo.bio
        });
      }
    }
  }

  //Hides error banner
  const minimizeErrorBanner = e => {
    setFormErrorDisplay(false);
  }

  //Close group creation form
  const closeWindow = e => {
    props.updatePage("user-profile", props.account.user_id);
  }

  //Skip step within account wizard
  const skipStep = () => {
    props.skipStep();
  }

  return (
    <div>
        {formErrorDisplay ?
            <div id={style.errorBanner}>
                <div id={style.errorBannerText}>
                    <h2>Invalid Group Information</h2>
                </div>
                  <button className={style.minimizeErrorBannerButton} onClick={minimizeErrorBanner}><b>Minimize</b></button>
            </div>
        : React.Fragment }

        { (props.displayMode !== "accountCreation") ?
          <div id={style.headerGrouping}>
              <div id={style.header}>
                <h2>Make a Group</h2>
                <p><b>A group will allow you to begin posting and getting connected!</b></p>
              </div>
              <button className={style.closeWindow} onClick={closeWindow}>Close</button>
          </div> : React.Fragment
        }

        <div id={standardStyle.inputSectionFormatting}>
          <InputBox type={"text"} name={"groupName"} headerText={"Group Name:"} value={groupInfo.groupName} onChange={handleGroupForm}/>
          <InputBox type={"text"} name={"bio"} headerText={"Group Bio:"} value={groupInfo.bio} onChange={handleGroupForm}/>
          <InputBox type={"image"} name={"pfp"} headerText={"Group Profile Photo:"} buttonText={"Upload Photo"} onChange={updateMedia}/>
          <InputBox type={"image"} name={"banner"} headerText={"Group Banner:"} buttonText={"Upload Photo"} onChange={updateMedia}/>
        </div>
        <br></br>
        <button className={standardStyle.submitButton} onClick={handleGroupCreationRequest}>Create Group!</button>
        { (props.displayMode === "accountCreation") ?
          <button className={standardStyle.submitButton} id={style.skipButtonFormat} onClick={skipStep}>Skip</button> : React.Fragment
        }  
    </div>
  );

}
 
export default CreateGroupForm;