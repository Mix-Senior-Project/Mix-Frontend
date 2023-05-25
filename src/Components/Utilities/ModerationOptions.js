import React, {useState, useRef, useEffect} from "react";
import style from "./ModerationOptions.module.css";

const PostOptions = (props) => {
    //States
    const [togglePostOptions, setTogglePostOptions] = useState(false);
    const [maximized, setMaximized] = useState(false);

    //Refs
    const postOptions = useRef();
    
    //When the user clicks to view the post options
    const onElipseClick = () =>{
        setTogglePostOptions(!togglePostOptions);
    }

    //Detects if you click off the PostOptions compoent
    useEffect(() => {
        if (props.role === "owner" || props.role === "mod") {
            setMaximized(true);
        }

        function handleClickOutside(event) {
            if (postOptions.current && !postOptions.current.contains(event.target)) {
                setTogglePostOptions(false);
            }
             
        }
        // Bind the event listener
        document.addEventListener("click", handleClickOutside);
        return () => {
          // Unbind the event listener on clean up
          document.removeEventListener("click", handleClickOutside);
        };
    }, [postOptions, props.role]);

    //Method will contain the API call to block the user
    const blockUser = async () => {
        let response = [];
        try {
            response = await fetch('/* BLOCK MEMBER API */', {
              method: 'PATCH',
              body: JSON.stringify({
                "user_id": props.viewerAccount.user_id,
                "blocked_user_id": props.metadata.user_id,
                }),
            })
            response = await response.json();  
            console.log("BlockMember API Request Sent");
        } catch (error) {
            console.log("BlockMember API Failure");
            return;
        }

        props.updateAccount({
            user_id: props.viewerAccount.user_id,
            banner_picture: props.viewerAccount.banner_picture,
            bio: props.viewerAccount.bio,
            email: props.viewerAccount.email,
            friends_list: props.viewerAccount.friends_list,
            groups_joined: props.viewerAccount.groups_joined,
            interests: props.viewerAccount.interests,
            profile_picture: props.viewerAccount.profile_picture,
            username: props.viewerAccount.username,
            posts_made: props.viewerAccount.posts_made,
            events: props.viewerAccount.events,
            blocked: response.data.blocked_user_ids
        });

        if (props.location === "post") {
            props.removeBlockedUserPosts(props.metadata.user_id);
        }

        props.updatePage("default", "null");
    }
    
    //Method will contain the API call to ban a user from a group
    const banGroupMember = async () => {
        try {
            await fetch('/* BAN MEMBER API */', {
              method: 'PATCH',
              body: JSON.stringify({
                "groupID": props.metadata.group_id,
                "userID": props.metadata.user_id,
                "username": props.metadata.username,
                }),
            })
            console.log("BanMember API Request Sent");
        } catch (error) {
            console.log("BanMember API Failure");
            return;
        }
    }

    return (
        <div ref={postOptions}>  
            { (props.viewerAccount.user_id !== props.metadata.user_id) ?
                <div>
                    <button id={((props.location === "post") ? style.optionsBtn: style.optionsProfileBtn)} onClick={onElipseClick}><p id={style.optionsBtnText}><b>...</b></p></button>
                    { togglePostOptions ?
                        <div className={(maximized ? style.maximized : style.minimized)} id={style.uploaderBody}>
                            <div className={style.postOptionItem}>
                                <p id={style.postOptionText} onClick={blockUser}>🚫 <b>Block User</b></p>
                            </div>
                            { ((props.role === "owner" || props.role === "mod")) ?
                                <div className={style.postOptionItem}>
                                    <p id={style.postOptionText} onClick={banGroupMember}>🔨 <b>Ban from Group</b></p>
                                </div> : React.Fragment
                            }
                        </div> : React.Fragment
                    }    
                </div> : React.Fragment
            }
        </div>
    );
}

export default PostOptions;