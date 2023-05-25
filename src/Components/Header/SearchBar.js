import style from'./Search.module.css';
import React, {useState, useEffect, useRef} from "react";
import SearchItem from './SearchItem';

const SearchBar = (props) => {
    //API Cooldown variables
    var lastRequest = 0;
    var requestCooldown = 1;

    //States
    const [cachedSearches, setCachedSearches] = useState([]);
    const [accountSearchResults, setAccountSearchResults] = useState([]);
    const [groupSearchResults, setGroupSearchResults] = useState([]);
    const [eventSearchResults, setEventSearchResults] = useState([]);
    const [currentSearch, setCurrentSearch] = useState("");
    const [displayRecommendedSearches, setDisplayRecommendedSearches] = useState(false);
    const [displaySearchResults, setDisplaySearchResults] = useState(false);

    //Refs
    const searchBarRef = useRef();

    const handleChange = (e) => {
        setCurrentSearch(e.target.value);
        setDisplayRecommendedSearches((cachedSearches.length > 0));
        setDisplaySearchResults(false);
    }

    //Detects if you click off the SearchBar componet
    useEffect(() => {
        function handleClickOutside(event) {
            if (searchBarRef.current && !searchBarRef.current.contains(event.target)) {
                setCurrentSearch("");
                setDisplaySearchResults(false);
                setDisplayRecommendedSearches(false);
            }
        }
        // Bind the event listener
        document.addEventListener("click", handleClickOutside);
        return () => {
          // Unbind the event listener on clean up
          document.removeEventListener("click", handleClickOutside);
        };
    }, [searchBarRef]);

    const onSubmit = async (e) => {
        if (currentSearch === "") return;

        //Provides a cooldown based on the request cooldown.
        var currTime = new Date();
        if (lastRequest >= (currTime.getSeconds() - requestCooldown)) {
            return;
        } else {
            if (currTime.getSeconds() >= (60-requestCooldown)) {
                lastRequest = 0;
            } else {
                lastRequest = currTime.getSeconds();
            }
        }

        //Save old search and reset search box text
        let alreadyCached = false;
        cachedSearches.forEach(element => {
            if (currentSearch === element) {
                alreadyCached = true;
            }
        });

        if (!alreadyCached) {
            let newCachedSearchesList = cachedSearches;
            newCachedSearchesList.push(currentSearch);
            setCachedSearches(newCachedSearchesList);
        }
        setDisplayRecommendedSearches(false);

        let processedSearch = currentSearch;
        if (currentSearch.indexOf(' ') !== -1) {
            processedSearch = currentSearch.substring(0, currentSearch.indexOf(' '));
        }

        //Query to see if the search result is an existing username or groupname
        let endpoint = ("/* SEARCH ALL API */" + processedSearch);
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

        //If no search results are found then set both arrays as empty and then the error messaging will appear.
        if (returnObj.message == "No results found") {
            setGroupSearchResults([]);
            setAccountSearchResults([]);
            setCurrentSearch("");
            setDisplaySearchResults(true);
            return;
        }

        //Now lets process the search results
        let userResult = [];
        let groupResult = [];
        let eventResult = [];

        console.log(returnObj);
        if (returnObj === "No results found") {
            //Render account and group names for user in result
            setGroupSearchResults([]);
            setAccountSearchResults([]);
            setEventSearchResults([]);

            //Display search results
            setDisplaySearchResults(true);
            setCurrentSearch("");
        }

        for(let i = 0; i < returnObj.users.length; i++) {
            if (i < 5) {
                userResult.push({username: returnObj.users[i].username, user_id: returnObj.users[i].id});
            }
        }
        for(let i = 0; i < returnObj.groups.length; i++) {
            if (i < 5) {
                groupResult.push({group_name: returnObj.groups[i].group_name, group_id: returnObj.groups[i].id});
            }
        }
        for(let i = 0; i < returnObj.events.length; i++) {
            if (i < 5) {
                eventResult.push({event_name: returnObj.events[i].event_name, event_id: returnObj.events[i].event_id, group_id: returnObj.events[i].group_id});
            }
        }

        //Render account and group names for user in result
        setGroupSearchResults(groupResult);
        setAccountSearchResults(userResult);
        setEventSearchResults(eventResult);

        //Display search results
        setDisplaySearchResults(true);
        setCurrentSearch("");
    }

    const hideSearch = (e) => {
        setDisplaySearchResults(false);
        setDisplayRecommendedSearches(false);
        setCurrentSearch("");
    } 

    const updatePage = (page, target) => {
        hideSearch();
        props.updatePage(page, target);
    }

    return (
        <div ref={searchBarRef}>
            <div id={style.searchBlock}>
                <input type="text" id={style.headerInput} placeholder={"What are you looking for?"} value={currentSearch} aria-label="Search" onChange={handleChange} pattern="[a-zA-Z0-9]+"></input>
                <button className={style.btnSearch} onClick={onSubmit}>Search</button>
                { displayRecommendedSearches ? 
                    <div id={style.searchDropdown}>
                        <h3>Recent Searches</h3>
                        <div>
                            {
                            cachedSearches.map((element) => {
                                if (element.includes(currentSearch)) {
                                    return <div><button className={style.searchItem} onClick={onSubmit} key={Math.random()}>{element}</button><br></br></div>;
                                }
                                return null;
                            })
                            }
                        </div>
                    </div> : React.Fragment
                }
                { displaySearchResults ? 
                    <div id={style.searchDropdown} key={Math.random()}>
                        <h2>Search Results</h2>
                        <div>
                            {((groupSearchResults.length === 0) && (accountSearchResults.length === 0) && (eventSearchResults.length === 0) && (props.account.user_id !== "null") ) ?
                                <p>Unable to find any search results, try a new search!</p> : React.Fragment
                            }

                            { (props.account.user_id === "null") ?
                                <p>Please login to utilize search features!</p> : React.Fragment
                            }

                            { ((accountSearchResults.length > 0) && (props.account.user_id !== "null")) ?
                                <div>
                                    <h3>People:</h3>
                                    {accountSearchResults.map((account) => {
                                        return <SearchItem type="user" name={account.username} id={account.user_id} updatePage={updatePage} key={Math.random()}/>;
                                    })} 
                                </div> : React.Fragment
                            }
                            { ((groupSearchResults.length > 0) && (props.account.user_id !== "null")) ?
                                <div>
                                    <h3>Groups:</h3>
                                    {groupSearchResults.map((group) => {
                                        return <SearchItem type="group" name={group.group_name} id={group.group_id} updatePage={updatePage} key={Math.random()}/>;
                                    })} 
                                </div> : React.Fragment
                            }
                            { ((eventSearchResults.length > 0) && (props.account.user_id !== "null")) ?
                                <div>
                                    <h3>Events:</h3>
                                    {eventSearchResults.map((event) => {
                                        return <SearchItem type="event" name={event.event_name} event_id={event.event_id} group_id={event.group_id} showEventDisplay={props.showEventDisplay} key={Math.random()}/>;
                                    })} 
                                </div> : React.Fragment
                            }
                        </div>
                    </div> : React.Fragment
                }
            </div>
        </div>    
    );
}

export default SearchBar;