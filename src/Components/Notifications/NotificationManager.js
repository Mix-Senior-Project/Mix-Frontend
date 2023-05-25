import React, { useState, useCallback, useEffect } from "react";
import style from "../Utilities/MixStandardizedStyle.module.css";
import GroupInviteNotification from "./GroupInviteNotification";
import Animation from '../Animation';

const NotificationManager = (props) => {
    const [notifications, setNotifications] = useState([]);
    const [filterType, setFilterType] = useState("all");
    const [loading, setLoading] = useState(false);

    const clearNotifications = async () => {
        try {
            await fetch(("/* DELETE USER NOTIFICATIONS API */" + props.account.user_id), {
              method: 'DELETE'
            })
            .then((response) => response.json())
            .then((json) => console.log("API Request: DeleteUserNotifications"));
        } catch (error) {
            console.log("API Request Failed: DeleteUserNotifications");
            console.log(error);
            return;
        }
    }

    const fetchPendingNotifications = async () => {
        setLoading(true);
        let notificationList = [];
        try {
            await fetch(("/* GET USER NOTIFICATIONS API */" + props.account.user_id), {
                method: 'GET',
            })
            .then((response) => response.json())
            .then((json) => notificationList = json);
            console.log("GetUserNotifications API Fired");
        } catch (error) {
            console.log(error);
        }

        if (notificationList === null) {
            notificationList = [];
        }

        let pendingInvites = [];
        try {
            await fetch(("/* CHECK USER NOTIFICATIONS API */" + props.account.user_id), {
                method: 'GET',
            })
            .then((response) => response.json())
            .then((json) => pendingInvites = json);
            console.log("CheckForInvites API Fired");
        } catch (error) {
            console.log(error);
        }

        if (pendingInvites !== null) {
            for(let i = 0; i < pendingInvites.length; i++) {
                notificationList.push({
                    type: "pending-group-invite",
                    invite_id: pendingInvites[i].invite_id,
                    group_id: pendingInvites[i].group_id,
                    group_name: pendingInvites[i].group_name,
                    inviter_username: pendingInvites[i].inviter_username,
                    inviter_id: pendingInvites[i].inviter_id,
                });
            } 
        }

        setNotifications(notificationList);
        setLoading(false);
    }

    //Loads post contents on render
    const fetchData = useCallback(async (e) => {
        await fetchPendingNotifications();
        await clearNotifications();
    });

    //Fetches notification information
    useEffect(() => {
        fetchData();
    }, []);

    const notificationClick = (e) => {
        if(e.target.id.indexOf('U') === 0) {
            props.updatePage("user-profile", e.target.id);
        } else if(e.target.id.indexOf('G') === 0) { 
            props.updatePage("group-profile", e.target.id)
        }
    }

    const setNotificationsList = (newList) => { setNotifications(newList)}

    const acceptEventInvitation = async (e) => {
        //Run HandleInvite endpoint
        try {
            await fetch('/* JOIN EVENT API */', {
                method: 'PATCH',
                body: JSON.stringify({
                    "userID": props.account.user_id,
                    "eventID" : e.target.id,
                }),
            });
        } catch (error) {
            console.log("Join Event API FAILED");
            console.log(error);
            return;
        }

        let newEvent;
        try {
            await fetch(("/* GET EVENT API */" + e.target.id))
            .then(response => response.json())
            .then(json => newEvent = json)
        } catch (error) {
            console.log("GetEvent API FAILED");
            console.log(error);
            return;
        }
        console.log("GetEvent API Sent!");

        let eventList = props.account.events;
        eventList.push(newEvent);
        props.setAccount({
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
            events: eventList
        });
    }

    const setFilterPersonal = () => { setFilterType("personal"); }
    const setFilterAll = () => { setFilterType("all"); }
    const setFilterGroups = () => { setFilterType("group"); }

    console.log(notifications);

    return (
        <div id={style.bodySection}>
            <div id={style.pageTitle}><h3>My Notifications</h3></div>
            <div id={style.notificationsFilterBar}>
                <div className={style.notificationFilterButton} onClick={setFilterPersonal}>{(filterType === "personal") ? <p><b>Personal</b></p> : <p>Personal</p>}</div>
                <div className={style.notificationFilterButton} onClick={setFilterAll}>{(filterType === "all") ? <p><b>All</b></p> : <p>All</p>}</div>
                <div className={style.notificationFilterButton} onClick={setFilterGroups}>{(filterType === "group") ? <p><b>Groups</b></p> : <p>Groups</p>}</div>
            </div>
            <div id={style.notificationsSection}>
                { 
                    notifications.map((notification) => {
                        if (notification.type === "like" && (filterType === "all" || filterType === "personal")) {
                            return <div className={style.notification} id={notification.content[0]} onClick={notificationClick} key={Math.random()}>{notification.content[2]}</div>;
                        }
                        if (notification.type === "friend" && (filterType === "all" || filterType === "personal")) {
                            return <div className={style.notification} id={notification.content[0]} onClick={notificationClick} key={Math.random()}>{notification.content[1]}</div>;
                        }
                        if (notification.type === "comment" && (filterType === "all" || filterType === "personal")) {
                            return <div className={style.notification} id={notification.content[1]} onClick={notificationClick} key={Math.random()}>{notification.content[3]}</div>;
                        }
                        if (notification.type === "new-mod" && (filterType === "all" || filterType === "group")) {
                            return <div className={style.notification} id={notification.content[0]} onClick={notificationClick} key={Math.random()}>{notification.content[1]}</div>;
                        }
                        if (notification.type === "revoked-mod" && (filterType === "all" || filterType === "group")) {
                            return <div className={style.notification} id={notification.content[0]} onClick={notificationClick} key={Math.random()}>{notification.content[1]}</div>;
                        }
                        if (notification.type === "new-account" && (filterType === "all" || filterType === "personal")) {
                            return <div className={style.notification} key={Math.random()}>{notification.content[0]}</div>;
                        }
                        if (notification.type === "new-group" && (filterType === "all" || filterType === "group")) {
                            return <div className={style.notification} id={notification.content[0]} onClick={notificationClick} key={Math.random()}>A new group is born! <span className={style.groupHover} id={notification.content[1]} onClick={notificationClick}>{notification.content[1]}</span> is now live!</div>;
                        }
                        if (notification.type === "joined-group" && (filterType === "all" || filterType === "group")) {
                            return <div className={style.notification} id={notification.content[1]} onClick={notificationClick} key={Math.random()}>You have joined the group <span className={style.groupHover} id={notification.content[1]} onClick={notificationClick}>{notification.content[0]}!</span></div>;
                        }
                        if (notification.type === "left-group" && (filterType === "all" || filterType === "group")) {
                            return <div className={style.notification} id={notification.content[1]} onClick={notificationClick} key={Math.random()}>You have left the group <span className={style.groupHover} id={notification.content[0]} onClick={notificationClick}>{notification.content[0]}!</span></div>;
                        }
                        if (notification.type === "event" && (filterType === "all" || filterType === "group")) {
                            return <div className={style.notification} key={Math.random()}> You have been invited to attend "{notification.content[0]}" with <span className={style.groupHover} id={notification.content[3]} onClick={notificationClick}>{notification.content[4]}</span>
                                        <br></br> 
                                        <br></br> 
                                        <button className={style.inviteAcceptButton} id={notification.content[1]} onClick={acceptEventInvitation}>Accept Invitation</button> 
                                    </div>;
                        }

                        if (notification.type === "pending-group-invite" && (filterType === "all" || filterType === "group")) {
                            return <GroupInviteNotification notification={notification} notifications={notifications} account={props.account} setAccount={props.setAccount} setNotificationsList={setNotificationsList}/>;
                        }
                        return null;
                    })
                }

                { (notifications.length === 0) ?
                    <div className={style.notification}>You have no pending notifications</div> : React.Fragment
                }

                {loading ?
                <div>
                    <br></br>
                    <Animation/>
                </div>
                :React.Fragment}
            </div>    
        </div>
        
    );

}
 
export default NotificationManager;