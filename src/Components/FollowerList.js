import Follower from "./Follower";
import style from "./Utilities/MixStandardizedStyle.module.css";
import React, {useEffect, useState} from "react";

const FollowerList = (props) => {
    const [followerList, setFollowerList] = useState([]);
    const [filterType, setFilterType] = useState("all");

    //Query user follower's 
    const queryFollowers = async (e) => {
        let userListObj = [];
        if (props.currentViewedProfile[0] === "U") {
            let tempObj = "";
            try {
                await fetch(("/* GET USER FRIENDS API */" + props.currentViewedProfile))
                .then(response => response.json())
                .then(json => tempObj = json)
                console.log(tempObj);
                console.log("API Request Sent: GetUserFriends");
            } catch (error) {
                console.log("API Request Failed: GetUserFriends");
                console.log(error);
                return;
            }

            //Save the data
            if ((tempObj.friend_list !== null) && (tempObj.friend_list !== "null")) {
              for (let i = 0; i < tempObj.friend_list.length; i++) {
                userListObj.push({
                    username: tempObj.friend_list[i].username,
                    user_id: tempObj.friend_list[i].id,
                    role: "userFriend",
                    profile_picture: tempObj.friend_list[i].profile_picture
                });
              }
            } 
        } else if (props.currentViewedProfile[0] === "G") {
            try {
                let resp = [];
                await fetch(("/* GET GROUP MEMBERS API */" + props.currentViewedProfile))
                .then(response => response.json())
                .then(json => resp = json);

                console.log(resp);
                for (let i = 0; i < resp.members.length; i++) {
                    userListObj.push({
                        username: resp.members[i].username,
                        user_id: resp.members[i].id,
                        role: resp.members[i].type,
                        profile_picture: resp.members[i].profile_picture
                    });
                }
                console.log("API Request Sent: GetGroupMembers");
            } catch (error) {
                console.log("API Request Failed: GetGroupMembers");
                console.log(error);
                return;
            }
        } else {
            console.log("Invalid Profile Type!");
            return;
        }
        setFollowerList(userListObj);
    }

    const returnHome = () => {
        props.updatePage(((props.currentViewedProfile[0] === "G") ? "group-profile" : "user-profile"),props.currentViewedProfile)
    }

    useEffect(() => {
        queryFollowers();
    }, []);

    const setFilterModerators = () => { setFilterType("moderators"); }
    const setFilterAll = () => { setFilterType("all"); }
    const setFilterOwner = () => { setFilterType("owner"); }
    
    return (
        <div id={style.bodySection}>
            <div id={style.pageTitle}> 
                { (props.currentViewedProfile[0] === "G") ?
                    <h3>Group Followers</h3> : React.Fragment
                }
                { (props.currentViewedProfile[0] === "U") ?
                    <h3>Your Following</h3> : React.Fragment
                }
                <button className={style.backButton} onClick={returnHome}>Return to {props.currentViewedProfile[0] === "G" ? "Group" : "User"} Profile</button>
            </div>
            { (props.currentViewedProfile[0] === "G") ?
                <div id={style.notificationsFilterBar}>
                    <div className={style.notificationFilterButton} onClick={setFilterModerators}>{(filterType === "moderators") ? <p><b>Only Moderators</b></p> : <p>Only Moderators</p>}</div>
                    <div className={style.notificationFilterButton} onClick={setFilterAll}>{(filterType === "all") ? <p><b>All</b></p> : <p>All</p>}</div>
                    <div className={style.notificationFilterButton} onClick={setFilterOwner}>{(filterType === "owner") ? <p><b>Only Group Owner</b></p> : <p>Only Group Owner</p>}</div>
                </div> : React.Fragment
            }
            <div id={style.notificationsSection}>
                { 
                    (followerList.length > 0) ? 
                        followerList.map((friend) => {
                            if (friend.role === "mod" && filterType === "moderators") {
                                return <Follower friend={friend} updatePage={props.updatePage} key={Math.random()}/>
                            } else if (friend.role === "owner" && filterType === "owner") {
                                return <Follower friend={friend} updatePage={props.updatePage} key={Math.random()}/>
                            } else if (filterType === "all") {
                                return <Follower friend={friend} updatePage={props.updatePage} key={Math.random()}/>
                            }
                            return null;
                        })
                    : React.Fragment
                }
            </div>
        </div>
    );

}
 
export default FollowerList;