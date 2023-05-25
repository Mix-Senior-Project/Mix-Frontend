import React, {useState, useEffect, useRef} from "react";
import style from "./GroupInvite.module.css";
import GroupInviteSearchItem from './GroupInviteSearchItem';

const GroupInvite = (props) => {
  //States
  const [currentSearch, setCurrentSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [userList, setUserList] = useState([]);
  const [activeSearch, setActiveSearch] = useState(false);
  const [invitedUser, setInvitedUser] = useState(null);

  //Refs
  const searchBarRef = useRef();

  //Methods
  const sendInvite = async (uuid, username) => {
    //Get current timestamp
    const timeNow = new Date();
    let currTimeStamp = timeNow.getFullYear() + "-" + (timeNow.getMonth()+1) + "-" + (timeNow.getDate()) + " " + timeNow.getHours() + ":" + timeNow.getMinutes() + ":" + timeNow.getSeconds();

    //Send invite api request
    try {
       await fetch('/* SEND GROUP INVITE API */', {
        method: 'POST',
        body: JSON.stringify({
          "user_id": uuid,
          "inviter_id": props.viewerAccount.user_id,
          "inviter_username": props.viewerAccount.username,
          "group_id": props.group.group_id,
          "timestamp": currTimeStamp,
          "group_name": props.group.group_name
          }),
      })
      .then((response) => response.json())
    } catch {}
    console.log("API Request Sent: SendGroupInvite");

    setActiveSearch(false);
  }

  const searchUsers = async () => {
    setInvitedUser(null);
    //Query to see if the search result is an existing username or groupname
    let endpoint = ("/* SEARCH ALL API */" + currentSearch);
    let returnObj;
    try {
        await fetch(endpoint, {
         method: 'GET',
       })
       .then((response) => response.json())
       .then((json) => returnObj = json);
    } catch (error) {
       console.log("API Request Failed: SearchAll");
       console.log(error);
       return;
    }

    console.log("Search API Fired!");
    //Now lets process the search results
    let userResult = [];

    if(returnObj !== "No results found") {
      //Only save the top 10 search results
      for(let i = 0; i < returnObj.users.length; i++) {
        if (userResult.length > 10) break;

        let alreadyInGroup = false;

        for (let z = 0; z < userList.length; z++) {
          if (userList[i] === returnObj.users[i].id) {
            alreadyInGroup = true;
          }
        }

        if (!alreadyInGroup) {
          userResult.push({username: returnObj.users[i].username, user_id: returnObj.users[i].id});  
        }
      }  
    }
    
    setActiveSearch(true);
    setSearchResults(userResult);
    setCurrentSearch("");
  }

  console.log(searchResults);

  const handleChange = (e) => {
    setCurrentSearch(e.target.value);
  }

  const queryFollowers = async () => {
    let groupUserList = [];
    try {
      let resp = [];
      await fetch(("/* GET GROUP MEMBERS API */" + props.group.group_id))
      .then(response => response.json())
      .then(json => resp = json);

      Object.keys(resp.members).forEach(key => {
        groupUserList.push(key);
      });
      
      console.log("API Request Sent: GetGroupMembers");
    } catch (error) {
        console.log("API Request Failed: GetGroupMembers");
        console.log(error);
        return;
    }

    setUserList(groupUserList);
  }

  //Detects if you click off the SearchBar componet
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchBarRef.current && !searchBarRef.current.contains(event.target)) {
        setSearchResults([]);
        setActiveSearch(false);
      }
    }
    // Bind the event listener
    document.addEventListener("click", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("click", handleClickOutside);
    };
  }, [searchBarRef]);

  useEffect(() => {
    queryFollowers();
  }, []);

  return (
    <div id={style.inviteForm} ref={searchBarRef}>
      <h2>Send Group Invite for {props.group.group_name}</h2>
      { (invitedUser !== null) ?
        <div><h3>Invite sent to @{invitedUser}</h3></div> : React.Fragment
      }
      <input type="text" id={style.headerInput} placeholder={"Who would you like to invite?"} value={currentSearch} aria-label="Search" onChange={handleChange} pattern="[a-zA-Z0-9]+"></input> 
      <button className={style.search} onClick={searchUsers}>Search</button>

      { (searchResults.length > 0) ?
        <div className={style.searchResults}>
          <p id={style.searchHeader}><b>Select a user to invite to your group!</b></p>
          {searchResults.map(user => {
            if (user.user_id !== props.viewerAccount.user_id) {
              return <GroupInviteSearchItem account={user} sendInvite={sendInvite} key={Math.random()}/>;
            }
            return React.Fragment;
          })}
          { (searchResults.length === 0) ? 
            <div className={style.searchItem}>
              <h3 className={style.searchItemText}>Unable to find a user, try a different search!</h3>
          </div> : React.Fragment
          }
        </div> 
        : 
        ( (activeSearch) ?
          <div className={style.searchResults}>
            <p className={style.searchItemText}>Unable to find a user, try a different search!</p>
          </div> : React.Fragment
        )
      }
    </div>
  );
}
 
export default GroupInvite;