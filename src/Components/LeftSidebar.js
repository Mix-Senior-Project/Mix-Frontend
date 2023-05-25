import React, {useState, useEffect, useCallback} from "react";
import GroupListItem from "./GroupListItem";
import style from "./LeftSidebar.module.css";

const LeftSidebar = (props) => {
    const [expandedProfileSection, setExpandedProfileSection] = useState(false);
    const [expandedGroupSection, setExpandedGroupSection] = useState(false);
    const [pendingNotifications, setPendingNotifications] = useState([]);
    
    //Open the user's profile
    const selectMyProfile = () => {
        props.updatePage("user-profile", props.account.user_id);
    }

    //Open a group profile
    const onGroupProfileSelect = (group_id) => {
        props.updatePage("group-profile", group_id);
    }

    //Open user settings
    const onUserSettingsClick = () => {
        props.updatePage("user-settings", props.account.user_id);
    }

    const onAboutMixClick = () => {
        props.updatePage("about-mix", "null");
    }

    //Open the group creation page
    const openGroupCreationPage = (e) => {
        props.updatePage("group-creation", "null");
    }

    //Window Width State
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    //Update state if width changes
    const detectSize = () => {
        setWindowWidth( window.innerWidth);
    }

    const updateProfileButtonDisplay = () => {
        setExpandedProfileSection(!expandedProfileSection);
    }

    const updateGroupButtonDisplay = () => {
        setExpandedGroupSection(!expandedGroupSection);
    }

    const updateNotificationsDisplay = () => {
        props.updatePage("notifications", props.account.user_id);
    }

    const fetchPendingNotifications = async (e) => {
        let notificationList = [];
        try {
            await fetch(("/* GET USER NOTIFICATIONSAPI */" + props.account.user_id), {
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
        
        setPendingNotifications(notificationList);
    }

    //Loads post contents on render
    const fetchData = useCallback(async (e) => {
        fetchPendingNotifications();
    });


    //Monitors browser width for collapsing sidebars
    useEffect(() => {
        window.addEventListener('resize', detectSize)

        return () => {
        window.removeEventListener('resize', detectSize)
        }
    }, [windowWidth]);

    //Fetches notification information
    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div>
            { (windowWidth > 750) ?
                <div id={style.left} >
                    { (props.account.user_id !== "null") ? 
                        <div>
                            <div className={style.profile} id={style.headerTop}>
                                <button onClick={selectMyProfile} id={style.profileButton} data-testid="myProfileButton"><p><b>My Profile</b></p></button>
                                <button onClick={updateProfileButtonDisplay} id={style.profileToggleButton}>{ expandedProfileSection ? <p id={style.profileToggleButtonText}>-</p> : <p id={style.profileToggleButtonText}>+</p>}</button>
                            </div>
                            { expandedProfileSection ?
                                <div>
                                    <button className={style.userSettings} onClick={props.logOutUser}><p><b>Log out</b></p></button>
                                    <button onClick={onUserSettingsClick} className={style.userSettings} id={style.userSettingsButton}><p><b>User Settings</b></p></button>
                                    <button onClick={onAboutMixClick} className={style.userSettings} id={style.userSettingsButton}><p><b>About Mix</b></p></button>
                                </div> : React.Fragment
                            }
                            <div className={style.profile}>
                                <div id={style.notificationsHeaderFormatting}>
                                    <button onClick={updateNotificationsDisplay} id={style.profileButton}><p>🔔 <b>Notifications</b></p></button>
                                    { pendingNotifications.length === 0 ?
                                        React.Fragment : <div id={style.notificationBubble}><p id={style.notificationBubbleText}><b>{pendingNotifications.length <= 99 ? pendingNotifications.length : "99+"}</b></p></div>
                                    }
                                    
                                </div>
                            </div>
                            { (props.account.groups_joined.length !== 0) ?
                                <div className={style.profile} id={(expandedGroupSection ? "" : style.headerBottom )}>
                                    <div id={style.groupHeader}><p id={style.groupHeaderText}><b>Groups</b></p></div>
                                    <button onClick={updateGroupButtonDisplay} id={style.profileToggleButton}>{ expandedGroupSection ? <p id={style.profileToggleButtonText}>-</p> : <p id={style.profileToggleButtonText}>+</p>}</button>
                                </div> : React.Fragment
                            }
                            { expandedGroupSection ?
                                <div>
                                    { (props.account.groups_joined.length <= 10) ?
                                        <button onClick={openGroupCreationPage} className={style.groupTab}><p><b>✍️ Create a Group</b></p></button> : React.Fragment
                                    }
                                    { props.account.groups_joined.map((group) => {
                                        return <GroupListItem account={props.account} group={group} onGroupProfileSelect={onGroupProfileSelect} minimizedStyle={false}  key={Math.random()} />;
                                        })
                                    } 
                                </div>
                                : React.Fragment
                            }
                        </div>
                        : 
                        React.Fragment
                    }
                </div> 
                : 
                <div id={style.leftMinimized} >
                    { (props.account.user_id !== "null") ? 
                        <div>
                            <div className={style.profile}>
                                <button onClick={selectMyProfile} id={style.profileButton}  data-testid="myProfileButton"><p><b>My Profile</b></p>
                                    <button onClick={updateProfileButtonDisplay} id={style.profileToggleButton}>{ expandedProfileSection ? <p id={style.profileToggleButtonText}>-</p> : <p id={style.profileToggleButtonText}>+</p>}</button>
                                </button>
                            </div>
                            { expandedProfileSection ?
                                <div>
                                    <button onClick={props.toggleUserSettings} className={style.userSettings} id={style.userSettingsButton}><p><b>User Settings</b></p></button>
                                </div> : React.Fragment
                            }
                            { props.account.groups_joined.map((group) => {
                                return <GroupListItem account={props.account} group={group} onGroupProfileSelect={onGroupProfileSelect} minimizedStyle={true}  key={Math.random()} />;
                                })
                            }
                        </div>
                        : 
                        React.Fragment
                    }
                </div> 
            }
        </div>    
    );
}

export default LeftSidebar;