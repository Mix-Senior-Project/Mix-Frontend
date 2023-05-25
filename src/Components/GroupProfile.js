import React, {useState, useCallback, useEffect} from "react";
import pfp from './Static-Images/default_pfp.png';
import style from "./ProfileStyle.module.css";
import Interests from "./Utilities/Interests";
import GroupInvite from "./GroupInvite";
import Animation from './Animation';

const GroupProfile = (props) => {
  //Group Profile states
  const [groupMemberCount, setGroupMemberCount] = useState(-1);
  const [groupInfo, setGroupInfo] = useState({
    group_name: "Loading",
    interests: "null",
    events: []
  });
  const [loading, setLoading] = useState(true);

  //"default" for normal users, "member" for group member, "moderator" for group moderators & "owner" for group owner
  const [viewerPermissionRole, setViewerPermissionRole] = useState("default");
  const [displayInvite, setDisplayInvite] = useState(false);
  const [interestView, setInterestView] = useState(false);

  //API Throttle Values
  const [lastRequest, setLastRequest] = useState(0);
  const requestCooldown = 5;
  
  //Toggles if the group member list is displayed
  const groupMemberDisplayToggle = e => {
    if (groupMemberCount === 0) return; 
    props.updatePage("profile-followers", props.groupID);
  }

  //Toggles send invite form
  const sendInviteToggle = e => {
    setDisplayInvite(!displayInvite);
  }
  
  //Called on profile load
  const fetchData = useCallback(async () => {
    let groupObj = "";
    setLoading(true);
    try {
      await fetch(("/* GET GROUP API */" + props.groupID))
      .then(response => response.json())
      .then(json => groupObj = json)
    } catch (error) {
      console.log("API Request Failed: GetGroup");
      console.log(error);
      props.updatePage("default", "null");
      return;
    } 
    console.log("Group Profile GetGroup Request Sent");

    setGroupInfo(groupObj);

    let memberCount = -1;
    try {
      await fetch(("/* GET GROUP MEMBERS COUNT API */" + props.groupID))
      .then(response => response.json())
      .then(json => memberCount = json)
    } catch (error) {
      console.log("API Request Failed: GetMemberCount");
      console.log(error);
      return;
    } 

    console.log("Group Profile GetMemberCount Request Sent");
    setGroupMemberCount(memberCount);

    if (groupObj.owner_id === props.viewerAccount.user_id) {
      setViewerPermissionRole("owner");
    } else {
      for (let i = 0; i < props.viewerAccount.groups_joined.length; i++) {
        if (props.groupID === props.viewerAccount.groups_joined[i].group_id) {
          let resp;
          try {
            await fetch(("/* GET USER ROLE API */" + props.groupID + "&userID=" + props.viewerAccount.user_id))
            .then(response => response.json())
            .then(json => resp = json);
            console.log("GetUserRole API Request Sent");
          } catch (error) {
            console.log("GetUserRole API Failure");
            return;
          }
          
          setViewerPermissionRole(resp.role);
          break;
        }
      }
    }
    setLoading(false);
  }, []);

  //Fetches data on component mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const joinGroup = async (e) => {
    // Provides a cooldown based on the request cooldown.
    var currTime = new Date();
    if (requestCooldown >= (currTime.getSeconds() - lastRequest)) {
      return;
    } else {
      setLastRequest(currTime.getSeconds());
    }

    //Handle API Request
    try {
      await fetch('/* JOIN GROUP API */', {
        method: 'PATCH',
        body: JSON.stringify({ 
          "user_id": props.viewerAccount.user_id,
          "group_id" : props.groupID
      }),
      })
      .then((response) => response.json());
      console.log("JoinGroup API Request Sent");
    } catch (error) {
      console.log("API Request Failed: JoinGroup");
      console.log(error);
      return;
    }

    //Update viewer group list
    let newGroupList = props.viewerAccount.groups_joined;
    newGroupList.push(groupInfo);

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

    setViewerPermissionRole("member");
  }

  const leaveGroup = async (e) => {
    // Provides a cooldown based on the request cooldown.
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
          "user_id": props.viewerAccount.user_id,
          "group_id" : props.groupID
      }),
      })
      .then((response) => response.json())
      console.log("LeaveGroup API Request Sent");
    } catch (error) {
      console.log("API Request Failed: LeaveGroup");
      console.log(error);
      return;
    }

    //Update viewer group list
    let newGroupList = [];
    props.viewerAccount.groups_joined.map((group) => {
      if (group.group_id !== groupInfo.group_id) {
        newGroupList.push(group);
      }
    })

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

    setViewerPermissionRole("default");
  }

  //Toggle group settings page
  const toggleGroupSettings = (e) => {
    props.updatePage("group-settings", props.groupID);
  }

  const toggleInterestView = () => { 
    setInterestView(!interestView); 
  }

  return (
    <div>
      <div>
        <div id={groupInfo.banner_picture !== "null" ? style.bodyMaximized : style.bodyMinimized}>  
          { (groupInfo.banner_picture !== "null" && !loading) ? 
            <div id={style.profileBanner}>
              <img src={groupInfo.banner_picture} id={style.profileBannerImg} alt=""></img>
            </div> : React.Fragment
          }
          { loading ?
            <div id={style.bodyMinimized}>
              <br></br><br></br><br></br><br></br>
              <Animation/>
            </div>
            :
            <div>
              <div id={style.profileInfo}>
                { (groupInfo.profile_picture !== "null") ? 
                  <img id={style.profilePhoto} src={groupInfo.profile_picture} alt=""></img> : <img id={style.profilePhoto} src={pfp} alt=""></img>
                }
                <div id={style.profileInfoTextBlock}>
                  <div id={style.displayName}><h3>{groupInfo.group_name}</h3></div> <br></br>
                  {(groupInfo.bio !== "" && groupInfo.bio !== "null") ?
                    <p id={style.bioText}>{groupInfo.bio}</p> : React.Fragment
                  }
                </div>
              </div> 

              <div className={style.profileHeaderButtonBar}>
                { (groupInfo.private === 1) ? 
                  (viewerPermissionRole !== "default" ? 
                    <button className={style.profileButton} onClick={groupMemberDisplayToggle}> {groupMemberCount !== 0 ? <b>Group Members</b> :<b>Group Members</b>} <br></br>({groupMemberCount} {(groupMemberCount === 1) ? ` Member` : ` Members` })</button>
                    : React.Fragment
                  )
                  :
                  <button className={style.profileButton} onClick={groupMemberDisplayToggle}> { groupMemberCount !== 0 ? <b>Group Followers</b> :<b>Group Follower</b>} <br></br>({groupMemberCount} {(groupMemberCount === 1) ? ` Member` : ` Members` })</button>
                }

                { interestView ?
                  <button onClick={toggleInterestView} className={style.profileButton}><p>Hide Interests</p></button> : <button onClick={toggleInterestView} className={style.profileButton}><p>View Interests</p></button>
                }

                { (viewerPermissionRole !== "default") ?
                  <button className={style.profileButton} onClick={sendInviteToggle}>{displayInvite ? "Hide Invite Form" : "Send Invite"}</button> : React.Fragment
                }

                { ((viewerPermissionRole === "owner") || (viewerPermissionRole === "mod")) ?
                  <button className={style.profileButton} onClick={toggleGroupSettings}>Edit Group</button> : React.Fragment
                }
                

                { viewerPermissionRole !== "owner" ?
                  ( (viewerPermissionRole === "default" && props.viewerAccount.groups_joined.length <= 10) ? 
                    <button className={style.profileButton} onClick={joinGroup}>Join Group</button> : <button className={style.profileButton} onClick={leaveGroup}>Leave Group</button> )
                    : 
                    React.Fragment
                }
              </div>    
            </div>
          }
          
        </div>
      </div>

      <div>
        { (interestView) ?
          <div id={style.popdown}>
            { (groupInfo.interests !== "null" && groupInfo.interests !== null && groupInfo.interests.length > 0) ?
              <div id={style.groupInterests}>
                <h3>{groupInfo.group_name}'s Interests:</h3>
                <Interests account={props.account} editable={false} preSelectInterests={groupInfo.interests} key={Math.random()}/>
              </div> : <b>This group has no interests</b>
            } 
          </div> : React.Fragment
        }
      </div>
      <div>
        {displayInvite ?
          <GroupInvite viewerAccount={props.viewerAccount} group={groupInfo}/>
        :React.Fragment}
      </div>
    </div>
  );
}

export default GroupProfile;  