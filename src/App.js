import style from './App.module.css';
import React, {useState} from "react";
import Header from './Components/Header/Header';
import EventDisplay from './Components/EventDisplay';
import LeftSidebar from './Components/LeftSidebar';
import RightSidebar from './Components/RightSidebar';
import AccountManagement from './Components/AccountWizard/AccountManagement';
import UserProfile from './Components/UserProfile';
import GroupProfile from './Components/GroupProfile';
import PostManagement from './Components/PostComponents/PostManagement';
import UserSettings from './Components/UserSettings';
import GroupSettings from './Components/GroupSettings';
import CreateGroupForm from './Components/AccountWizard/CreateGroupForm';
import DMs from './Components/DirectMessaging/DMs';
import Animation from './Components/Animation';
import NotificationManager from './Components/Notifications/NotificationManager';
import FollowerList from './Components/FollowerList';
import AboutMix from './Components/Utilities/AboutMix';

function App() {
  //User account metadata
  const [account, setAccount] = useState({
    user_id: "null",
    banner_picture: "null",
    bio: "null",
    email: "null",
    friends_list: "null",
    groups_joined: [],
    interests: "null",
    profile_picture: "null",
    username: "null",
    posts_made: [],
    events: [],
    blocked: []
  });
  
  //displayPost options: all, none
  //For user it will only render posts with the same user_id
  const [displayPosts, setDisplayPosts] = useState("none");

  //Other general states
  const [displaySignIn, setDisplaySignIn] = useState (true);
  const [currentViewedProfile, setCurrentViewedProfile] = useState("null");
  const [currentPage, setCurrentPage] = useState("login");
  const [currentViewedEvent, setCurrentViewedEvent] = useState("null");

  //Toggles the visibility of the account creation component.
  const toggleAccountCreationComponent = (e) => {
    if (displaySignIn) {
      setDisplaySignIn(false);
    } else {
      if ((account.user_id === "null")) {
        setDisplaySignIn(true);
      }
    }
  }

  //Logs out user
  const logOutUser = () => {
    setAccount({
      user_id: "null",
      banner_picture: "null",
      bio: "null",
      email: "null",
      friends_list: "null",
      groups_joined: [],
      interests: "null",
      profile_picture: "null",
      username: "null",
      posts_made: [],
      events: [],
      blocked: []
    });
    updatePage("login", "null");
    setDisplaySignIn(true);
  }
  console.log(account);

  //Sets the current page, refer to frontend documentation on notion for page keys
  const updatePage = (page, uuid) => {
    if (uuid !== "null") {
      setCurrentViewedProfile(uuid);
    }
    setCurrentPage(page);

    if (page === "default") {
      setDisplayPosts("all");
      setCurrentViewedProfile("null");
    } else if ((page === "user-settings") || (page === "group-settings") || (page === "group-creation") || (page === "direct-messages") || (page === "notifications") || (page === "profile-followers") || (page === "login") || (page === "about-mix")) {
      setDisplayPosts("none");
    } else if (page === "user-profile") {
      setDisplayPosts("all");
    } else if (page === "group-profile") {
      setDisplayPosts("all");
    } 
  }

  //Handles page navigation for rendering an event
  const showEventDisplay = (group_id, event_id) => {
    setDisplayPosts("none");
    setCurrentViewedProfile(group_id);
    setCurrentPage("group-event-profile");
    setCurrentViewedEvent(event_id);
  }

  //updates global account data
  const updateAccount = (account) => {
    setAccount(account);
  }

  const updateUserGroups = (newGroup) => {
    let newGroupList = account.groups_joined;
    if(newGroupList === []) {
      newGroupList = [newGroup];
    } else {
      newGroupList.push(newGroup);
    }

    setAccount({
      user_id: account.user_id,
      banner_picture: account.banner_picture,
      bio: account.bio,
      email: account.email,
      friends_list: account.friends_list,
      groups_joined: newGroupList,
      interests: account.interests,
      profile_picture: account.profile_picture,
      username: account.username,
      posts_made: account.posts_made,
      events: account.events,
      blocked: account.blocked
    })
  }

  //True if a friends list or group list is visible & false if not
  const togglePosts = () => {
    if (displayPosts === "none") {
      setDisplayPosts("all");
    } else {
      setDisplayPosts("none");
    }
  }

  console.log(currentPage);

  return (
    <div className={style.App}>
      <Header updatePage={updatePage} showEventDisplay={showEventDisplay} account={account}/>
      
      <div className={style.appBody}>
        <div id={style.leftSidebar}>
          {(account.user_id !== "null") ? React.Fragment : <button className={style.signInButton} onClick={toggleAccountCreationComponent}><b>Sign in or Create Account</b></button>}
          { (account.user_id !== "null") ?
            <LeftSidebar account={account} updatePage={updatePage} logOutUser={logOutUser} key={Math.random()}/> : React.Fragment
          }
        </div>

        <div id={style.contentBody}>
            {((account.user_id !== "null") && (currentPage === "group-creation")) ? 
              <div id={style.popupBorder}>
                <CreateGroupForm newGroup={updateUserGroups} account={account} displayMode="popup" updatePage={updatePage} key={Math.random()}/>
              </div>
              :
              (displaySignIn ? 
                <div>
                  <AccountManagement account={account} setAccount={updateAccount} updatePage={updatePage} closeWindow={toggleAccountCreationComponent} key={Math.random()}/> 
                  <Animation/>
                </div>
                : 
                <div>
                  { (currentPage === "user-profile") ? 
                    <UserProfile
                      profileAccountID={currentViewedProfile} 
                      viewerAccount={account}
                      updateAccount={updateAccount}
                      updatePage={updatePage}
                      togglePosts={togglePosts} 
                      key={Math.random()}/>
                    : React.Fragment
                  }
                  { (currentPage === "group-profile") ? 
                    <GroupProfile 
                      groupID={currentViewedProfile}
                      viewerAccount={account}
                      setAccount={setAccount}
                      updatePage={updatePage}
                      togglePosts={togglePosts} 
                      key={Math.random()}/> 
                    : React.Fragment
                  }
                </div>    
              )
            }

            { (currentPage === "group-event-profile") ?
              <div>
                <GroupProfile 
                  groupID={currentViewedProfile}
                  viewerAccount={account}
                  setAccount={setAccount}
                  updatePage={updatePage}
                  togglePosts={togglePosts} 
                  key={Math.random()}/> 
                  <br></br>
                  <EventDisplay event_id={currentViewedEvent} group_id={currentViewedProfile} updatePage={updatePage}/>
              </div>
            : React.Fragment
            }

            { (currentPage === "notifications") ?
              <NotificationManager updatePage={updatePage} account={account} setAccount={updateAccount}/> : React.Fragment
            }
            { currentPage === "profile-followers" ?
              <FollowerList updatePage={updatePage} currentViewedProfile={currentViewedProfile} key={Math.random()}/> : React.Fragment
            }
          
            <PostManagement 
              account={account} 
              currentViewedProfile={currentViewedProfile}
              currentPage={currentPage}
              updatePage={updatePage} 
              displayPosts={displayPosts} 
              updateAccount={updateAccount}
              />

            {(currentPage === "user-settings") ?
             <UserSettings account={account} setAccount={updateAccount} updatePage={updatePage} key={Math.random()}/> : React.Fragment}

            {(currentPage === "group-settings") ?
             <GroupSettings viewerAccount={account} setAccount={updateAccount} groupID={currentViewedProfile} updatePage={updatePage} key={Math.random()}/> : React.Fragment}

            {(currentPage === "direct-messages") ?
              <DMs account={account} key={Math.random()} updatePage={updatePage}/>
              : React.Fragment
            }

            {(currentPage === "about-mix") ?
              <AboutMix /> : React.Fragment
            }
        </div>  
        
        <div id={style.rightSidebar}> 
          {(account.user_id !== "null") ?
            <RightSidebar key={Math.random()} account={account} updateAccount={updateAccount}/>
          :React.Fragment}
        </div>  
    </div>
   </div> 
  );
}

export default App;
