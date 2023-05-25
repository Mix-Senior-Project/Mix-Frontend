import React, {useState} from "react";
import style from "../Utilities/MixStandardizedStyle.module.css";

const NotificationManager = (props) => {
    const [inviteState, setInviteState] = useState(null);

    //On group invite accept
    const acceptGroupInvite = async (e) => {
        try {
            await fetch('/* HANDLE INVITE API */', {
                method: 'PATCH',
                body: JSON.stringify({
                    "user_id": props.account.user_id,
                    "invite_id" : props.notification.invite_id,
                    "response": "0"
                }),
            })
            .then((response) => response.json())
        } catch (error) {
            console.log("Handle Invite API FAILED");
            console.log(error);
            return;
        }
        console.log("API Request Sent: HandleInvite")

        //Update frontend account object to reflect the new group
        let group_id = "null";
        for (let i = 0; i < props.notifications.length; i++) {
            if (props.notifications[i].type === "pending-group-invite") {
                if (props.notifications[i].invite_id === props.notification.invite_id) {
                    group_id = props.notifications[i].group_id;
                }
            }
        }

        //GetGroup for the newly joined group
        let groupObj = "";
        try {
            await fetch(("/* GET GROUP API */" + group_id))
            .then(response => response.json())
            .then(json => groupObj = json)
        } catch (error) {
            console.log("API Request Failed: GetGroup");
            console.log(error);
        } 
        console.log("Group Profile GetGroup Request Sent");

        //Save new group list
        let newGroups = props.account.groups_joined;
        newGroups.push(groupObj);

        props.setAccount({
            user_id: props.account.user_id,
            banner_picture: props.account.banner_picture,
            bio: props.account.bio,
            email: props.account.email,
            friends_list: props.account.friends_list,
            groups_joined: newGroups,
            interests: props.account.interests,
            profile_picture: props.account.profile_picture,
            username: props.account.username,
            posts_made: props.account.posts_made,
            events: props.account.events
        });

        //Head to new profile
        setInviteState(true);
    }

    //On group invite decline
    const declineGroupInvite = async (e) => {
        try {
            await fetch('/* HANDLE INVITE API */', {
                method: 'PATCH',
                body: JSON.stringify({
                    "user_id": props.account.user_id,
                    "invite_id" : props.notification.invite_id,
                    "response": "1"
                }),
            });
        } catch (error) {
            console.log("Handle Invite API FAILED");
            console.log(error);
            return;
        }

        //Remove old invite
        let newNotificationsList = [];
        for (let i = 0; i < props.notifications.length; i++) { 
            if (props.notifications[i].type !== "pending-group-invite") {
                newNotificationsList.push(props.notifications[i]);
            } else {
                if (props.notifications[i].invite_id !== props.notification.invite_id) {
                    newNotificationsList.push(props.notifications[i]);
                }
            }
        }
        props.setNotificationsList(newNotificationsList);
        setInviteState(false);
    }


    return (
        <div>
            { (((props.account.groups_joined.length) <= 9) && (inviteState === null)) ?
                <div className={(props.account.groups_joined.length <= 10) ? style.notification : style.largeNotification} key={Math.random()}> You have been invited to join the group "<span className={style.groupHover} id={props.notification.group_id} onClick={props.notificationClick}>{props.notification.group_name}</span>" by {props.notification.inviter_username}
                    <br></br> <br></br> 
                        <div>
                            <button className={style.inviteAcceptButton} id={props.notification.invite_id} onClick={acceptGroupInvite}>Join Group</button> 
                            <button className={style.inviteDeclineButton} id={props.notification.invite_id} onClick={declineGroupInvite}>Decline Invitation</button>     
                        </div> 
                </div> 
                : 
                <div>
                    {props.account.groups_joined.length <= 10 ? 
                        (inviteState ? 
                            <p>You have joined <span className={style.groupHover} id={props.notification.group_id} onClick={props.notificationClick}>{props.notification.group_name}</span>!</p>
                            :
                            <p>You have declined to join <span className={style.groupHover} id={props.notification.group_id} onClick={props.notificationClick}>{props.notification.group_name}</span>!</p>
                        )
                        :
                        <div className={style.inviteError}>
                            <p>You have hit the maximum amount of groups!<br></br> First leave a group to accept.</p>
                        </div>
                    }
                </div>
            }
        </div>
        
    );

}
 
export default NotificationManager;