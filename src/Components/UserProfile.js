import style from "./ProfileStyle.module.css";
import pfp from './Static-Images/default_pfp.png';
import React, {useState, useCallback, useEffect} from "react";
import Interests from "./Utilities/Interests";
import Animation from './Animation';
import PostOptions from "./Utilities/ModerationOptions";

const UserProfile = (props) => {
  //User Profile states
  const [profileAccount, setProfileAccount] = useState({
    user_id: "Loading",
    banner_picture: "null",
    bio: "null",
    email: "null",
    friends_list: [],
    groups_joined: [],
    interests: [],
    profile_picture: "null",
    username: "null",
    posts_made: "null"
  });

  const [groupView, setGroupView] = useState(false);
  const [interestView, setInterestView] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [viewerIsFollower, setViewerIsFollower] = useState(props.viewerAccount.friends_list !== "null" ? props.viewerAccount.friends_list.includes(props.profileAccountID) : false);

  //API Throttle values
  const [lastRequest, setLastRequest] = useState(0);
  const requestCooldown = 2;

  //Add friend with backend api call
  const followUser = async (e) => {
    //Provides a cooldown based on the request cooldown.
    var currTime = new Date();
    if (requestCooldown >= (currTime.getSeconds() - lastRequest)) {
      return;
    } else {
      setLastRequest(currTime.getSeconds());
    }

    let responseObj = "";
    try {
      await fetch('/* ADD FRIEND API */', {
        method: 'PATCH',
        body: JSON.stringify({
          "user_id": props.viewerAccount.user_id,
          "new_friend_id": profileAccount.user_id
        }),
      })
      .then((response) => response.json())
      .then((json) => responseObj = json);
    } catch (error) {
      console.log("API Request Failed: AddFriend");
      console.log(error);
      return;
    }
    console.log("Friend Add API Request Sent");

    //Update frontend account details
    let updatedAccount = {
      user_id: props.viewerAccount.user_id,
      banner_picture: props.viewerAccount.banner_picture,
      bio: props.viewerAccount.bio,
      email: props.viewerAccount.email,
      friends_list: responseObj.friends,
      groups_joined: props.viewerAccount.groups_joined,
      interests: props.viewerAccount.interests,
      profile_picture: props.viewerAccount.profile_picture,
      username: props.viewerAccount.username,
      posts_made: props.viewerAccount.posts_made,
      blocked: props.viewerAccount.blocked,
      events: props.viewerAccount.events
    };

    props.updateAccount(updatedAccount);
    setViewerIsFollower(true);
  }

  //Called when the viewer wants to unfollow the user.
  const unfollowUser = async (e) => {
    //Provides a cooldown based on the request cooldown.
    var currTime = new Date();
    if (requestCooldown >= (currTime.getSeconds() - lastRequest)) {
      return;
    } else {
      setLastRequest(currTime.getSeconds());
    }
    
    let responseObj = "";
    try {
      await fetch('/* REMOVE FRIEND API */', {
        method: 'PATCH',
        body: JSON.stringify({
          "user_id": props.viewerAccount.user_id,
          "friend_id": profileAccount.user_id
        }),
      })
      .then((response) => response.json())
      .then((json) => responseObj = json);
    } catch (error) {
      console.log("API Request Failed: RemoveFriend");
      console.log(error);
      return;
    }
    console.log("Friend Remove API Request Sent");

    //Update frontend account details
    props.updateAccount({
      user_id: props.viewerAccount.user_id,
      banner_picture: props.viewerAccount.banner_picture,
      bio: props.viewerAccount.bio,
      email: props.viewerAccount.email,
      friends_list: responseObj.friends,
      groups_joined: props.viewerAccount.groups_joined,
      interests: props.viewerAccount.interests,
      profile_picture: props.viewerAccount.profile_picture,
      username: props.viewerAccount.username,
      posts_made: props.viewerAccount.posts_made,
      blocked: props.viewerAccount.blocked,
      events: props.viewerAccount.events
    });
    setViewerIsFollower(false);
  }

  //Called when the user wants to view their follower list
  const setFollowerView = () => {
    props.updatePage("profile-followers", props.profileAccountID);
  }

  console.log(props.profileAccountID);
  //Called on profile load
  const fetchData = useCallback(async () => {
    //If we are viewing our own account, no need for another API call
    if (props.profileAccountID === props.viewerAccount.user_id) {
      setProfileAccount(props.viewerAccount);
      setLoading(false);
      return;
    }

    let accountObj = "";
    try {
      await fetch("/* GET ACCOUNT API */" + props.profileAccountID)
      .then(response => response.json())
      .then(json => accountObj = json)
    } catch (error) {
      console.log("API Request Failed: GetAccount");
      console.log(error);
      props.updatePage("default", "null");
      return;
    } 
    console.log(accountObj);
    console.log("User Profile Account GET Request Sent");

    let blockedUsersObj;
    try {
        let fetchResp = await fetch("/* GET BLOCKED USERS API */" + props.viewerAccount.user_id);
        blockedUsersObj = await fetchResp.json();
    } catch (error) {
      console.log(error)
      console.log("GetBlockedUsers API Failure");
    }
    console.log("GetBlockedUsers API Request Sent");
    
    //Check if the viewer has blocked this user
    if (blockedUsersObj.message !== "No blocked users") {
      for (let i = 0; i < blockedUsersObj.data.blocked_users.length; i++) {
        if (blockedUsersObj.data.blocked_users[i].user_id === props.profileAccountID) {
          setProfileAccount({
            user_id: accountObj.user_id,
            banner_picture: accountObj.banner_picture,
            bio: accountObj.bio,
            email: "null",
            friends_list: [],
            groups_joined: [],
            interests: "null",
            profile_picture: accountObj.profile_picture,
            username: accountObj.username,
            posts_made: [],
          });
          setIsBlocked(true);
          setLoading(false);
          return;
        }
      }  
    }
    
    //Preemptively cache groups that the user is part of
    let groupList = [];
    if ((accountObj.groups !== null) && (accountObj.groups !== "null")) {
      for (let i = 0; i < accountObj.groups.length; i++) {
        let groupObj = "";

        try {
          let fetchResp = await fetch(("/* GET GROUP API */" + accountObj.groups[i]));
          groupObj = await fetchResp.json();
          console.log("Group Profile GetGroup Request Sent");
        } catch (error) {
          console.log("API Request Failed: GetGroup");
          console.log(error);
        } 

        if (groupList !== "Failed to get group. src: rds-get-group") {
          groupList.push(groupObj);
        } else {
          console.log("Unable to get group: " + groupObj.accountObj.groups[i]);
        }
      }
    }

    setProfileAccount({
      user_id: accountObj.user_id,
      banner_picture: accountObj.banner_picture,
      bio: accountObj.bio,
      email: accountObj.email,
      friends_list: accountObj.friends,
      groups_joined: groupList,
      interests: accountObj.interests,
      profile_picture: accountObj.profile_picture,
      username: accountObj.username,
      posts_made: accountObj.posts,
    });
    setLoading(false);

    console.log(props.viewerAccount);
    //Check if the viewer is a friend of the profile owner
    if ((props.viewerAccount.friends_list === "null") || (props.viewerAccount.friends_list === null)) return;

    for (let i = 0; i < props.viewerAccount.friends_list.length; i++) {
      if (props.viewerAccount.friends_list[i] === props.profileAccountID) {
        setViewerIsFollower(true);
        return;
      }
    }
  }, [props]);

  console.log(profileAccount);

  const selectGroupProfile = (e) => {
    props.updatePage("group-profile", e.target.id);
  }

  //Fetches data on component mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleGroupView = () => { 
    if (!groupView && interestView) {
      setInterestView(false);
    }
    setGroupView(!groupView); 
  }
  
  const toggleInterestView = () => { 
    if (!interestView && groupView) {
      setGroupView(false);
    }
    setInterestView(!interestView); 
  }

  return (
    <div>
      { loading ?
        <div id={style.bodyMinimized}>
          <br></br><br></br><br></br><br></br>
          <Animation/>
        </div>
        :
        <div>
          <div id={profileAccount.banner_picture !== "null" ? style.bodyMaximized : style.bodyMinimized}>  
            { (profileAccount.banner_picture !== "null") ?
              <div id={style.profileBanner}>
                <img src={profileAccount.banner_picture} id={style.profileBannerImg} alt="Unable to display profile banner"></img>
              </div> : React.Fragment
            }
            
            <div id={style.profileInfo}>
              { (profileAccount.profile_picture !== "null") ?
                <img id={style.profilePhoto} src={profileAccount.profile_picture} alt="howdy"></img> : <img id={style.profilePhoto} src={pfp} alt="Unable to load"></img> 
              }
              <div id={style.profileInfoTextBlock}>
                <div id={style.profileInfoTextBlockHeader}>
                  { (isBlocked || (props.viewerAccount.user_id === profileAccount.user_id)) ?
                    React.Fragment : <PostOptions location={"user-profile"} metadata={profileAccount} viewerAccount={props.viewerAccount} updateAccount={props.updateAccount} updatePage={props.updatePage}/>
                  }
                  <div id={style.displayName}><h3>{profileAccount.username}</h3></div> 
                </div>
                <br></br>
                { isBlocked ?
                  <h3>You have blocked {profileAccount.username}, first unblock them in your settings to view their profile!</h3> :
                  <div>
                    {(profileAccount.bio !== "") ?
                      <p id={style.bioText}>{profileAccount.bio}</p> : React.Fragment
                    }
                  </div>
                }
              </div>
            </div> 

            { isBlocked ? 
              React.Fragment :
              <div id={style.profileHeaderButtonBar}>
                { (props.profileAccountID === props.viewerAccount.user_id) ? 
                  <div>
                    <button onClick={setFollowerView} className={style.profileButton}><p>Your Following</p></button> 
                  </div>
                :
                  ( viewerIsFollower ? 
                    <button onClick={unfollowUser} className={style.profileButton}><p>Unfollow</p></button>
                    : 
                    <button onClick={followUser} className={style.profileButton}><p>Follow</p></button> 
                  )
                }

                { groupView ?
                  <button onClick={toggleGroupView} className={style.profileButton}><p>Hide Groups</p></button> : <button onClick={toggleGroupView} className={style.profileButton}><p>View Groups</p></button>
                }

                { interestView ?
                  <button onClick={toggleInterestView} className={style.profileButton}><p>Hide Interests</p></button> : <button onClick={toggleInterestView} className={style.profileButton}><p>View Interests</p></button>
                }

                { (profileAccount.posts_made !== "null") ?
                  <p id={style.postCount}><b>Total {profileAccount.posts_made.length === 1 ? "Post" : "Posts"}: </b>{profileAccount.posts_made.length}</p> : React.Fragment
                }
              </div>
            }
          </div>
          { (groupView || interestView) ?
            <div id={style.popdown}>
              <br></br>
              { interestView ?
                ( (profileAccount.interests !== "null" && profileAccount.interests !== null && profileAccount.interests.length > 0) ?
                  <div id={style.interests}>
                    <h3>{profileAccount.username}'s Interests</h3>
                    { (profileAccount.interests.length > 0) ?
                      <Interests account={props.account} editable={false} preSelectInterests={profileAccount.interests} key={Math.random()}/> : React.Fragment
                    }
                  </div> : <b>This account has no interests</b>
                ) : React.Fragment
              }
              { groupView ?
                ( (profileAccount.groups_joined.length > 0) ?
                  <div id={style.groupList}>
                    <h3>{profileAccount.username}'s Groups</h3>
                    { profileAccount.groups_joined.map((group) => {
                      if (group.private === 0) {
                        return <button className={style.groupName} id={group.group_id} onClick={selectGroupProfile} key={Math.random()}>{group.group_name}</button>  
                      } else {
                        return React.Fragment;
                      }
                    })}
                  </div> : React.Fragment
                ) : React.Fragment
              }
            </div> : React.Fragment
          }    
        </div>
      }
      
    </div>
  );
}
export default UserProfile;