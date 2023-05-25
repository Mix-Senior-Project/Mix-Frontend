import React, {useState, useEffect, useRef} from "react";
import style from "./DMs.module.css";
import DMSearchItem from "./DMSearchItem";

const DMSearch = (props) => {
    //Search props
    const [currentSearch, setCurrentSearch] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const searchBarRef = useRef();
    const [max, setMax] = useState(false);
    const [verified, setVerified] = useState()

    //search for users
  const searchUsers = async () => {
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

    console.log("API Search All Request Sent");

    //Now lets process the search results
    let userResult = [];
    if (returnObj.users != null){
      for(let i = 0; i < returnObj.users.length; i++) {
        if (returnObj.users[i].id[0] === 'U') {
          if (props.account.blocked !== undefined && props.account.blocked !== null && props.account.blocked !== "null") {
            for (var j = 0; j < props.account.blocked.length; j++){
              if (props.account.blocked[j].username !==  returnObj.users[i]){
                userResult.push({username: returnObj.users[i].username, user_id: returnObj.users[i].id});
              }
            }
          } else {
            userResult.push({username: returnObj.users[i].username, user_id: returnObj.users[i].id});
          }
        } 
      }
    }

    setSearchResults(userResult);
    setCurrentSearch("");
    }

    const handleChange = (e) => {
    setCurrentSearch(e.target.value);
    }

    useEffect(() => {
      props.setRecipients([]);
      props.setMutual(false);
      function handleClickOutside(event) {
          if (searchBarRef.current &&  !searchBarRef.current.contains(event.target)) {
          setCurrentSearch("");
          }
      }
      //event listener
      document.addEventListener("click", handleClickOutside);
      return () => {
          //unbind
          document.removeEventListener("click", handleClickOutside);
      };
    }, [searchBarRef]);

    return (
        <div id={style.newMessage}>
              <div id={style.searchRecipient} ref={searchBarRef}>
                <b id={style.to}>To: </b>
                <div id={style.recipients}>
                {props.recipients.map((user) => {
                  return <div key={Math.random()}><b>{user}</b></div>
                })}<br></br>
                </div>
                {!props.mutual && verified ?
                <b id={style.warning}>You are not mutual friends with this person. You cannot message them</b>
                :<div>
                  {max?
                    React.Fragment
                    :<div>
                    <input type="text" id={style.headerInput} placeholder="Who would you like to search for?" value={currentSearch} aria-label="Search" onChange={handleChange} pattern="[a-zA-Z0-9]+"></input>
                    <button className={style.search} onClick={searchUsers}>Search</button>
                    </div>
                  }
                  <br></br>
                  {max ?
                    <b id={style.max}>You can only have up to 5 users in a DM</b>
                  :React.Fragment}
                  {(searchResults.length > 0) && !max ?
                    <div className={style.searchResults}>
                      <h3 id={style.searchHeader}>Select someone to message!</h3>
                      {searchResults.map(user => {
                        return <DMSearchItem user={user} account={props.account} setRecipients={props.setRecipients} recipients={props.recipients} key={Math.random()} searchResults={searchResults} setSearchResults={setSearchResults} setMax={setMax} setMutual={props.setMutual} setVerified={setVerified}/>
                      })}
                      <br></br>
                    </div> 
                    :React.Fragment
                  }
                </div>
                }
              </div>
        </div>
    );

}
 
export default DMSearch;