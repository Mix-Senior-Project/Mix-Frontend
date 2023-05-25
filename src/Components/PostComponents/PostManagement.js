import fetch from "node-fetch";
import Post from './Post';
import CreatePostForm from './CreatePostForm';
import style from "./PostManagement.module.css";
import React, {useState, useEffect,useCallback} from "react";
import Animation from '../Animation';
import RecommendedGroups from '../Utilities/RecommendedGroups';
import PrivacyPopup from "./PrivacyPopup";

const PostManagement = (props) => {
  //Used to track when we change profiles
  const [currentProfile, setCurrentProfile] = useState("null");

  //Store all generic posts cached
  const [nextGenericPostPage, setNextGenericPostPage] = useState(1);
  const [genericPosts, setGenericPosts] = useState([]);
  const [localMaxGenericPostPages, setLocalMaxGenericPostPages] = useState(1);

  //Profile posts we will only store while viewing a profile page
  const [nextProfilePostPage, setNextProfilePostPage] = useState(1);
  const [profilePosts, setProfilePosts] = useState([]);
  const [localMaxProfilePostPages, setLocalMaxProfilePostPages] = useState(1);

  //Other states
  const [createPostDisplay, setCreatePostDisplay] = useState(false);
  const [isUserInGroup, setIsUserInGroup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userListObj, setUserListObj] = useState([]);
  const [userPrivacy, setUserPrivacy] = useState("none");

  //Window Width State
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  //Update state if width changes
  const detectSize = () => {
      setWindowWidth( window.innerWidth);
  }

  //Monitors browser width for collapsing sidebars
  useEffect(() => {
      window.addEventListener('resize', detectSize)
      return () => {
        window.removeEventListener('resize', detectSize)
      }
  }, [windowWidth]);

  //Delete post from DB via post delete endpoint & then remove it from the PostManagement list of postIDs
  const deletePost = async (post_id) => {
    //Delete post via backend endpoints
    try {
      await fetch(("/* DELETE POST API */" + post_id), {
        method: 'DELETE'
      })
      console.log("Post Delete Request Sent");  
    } catch (error) {
      console.log(error);
      console.log("DeletePost API Failure");
      return;
    }

    //Remove post from frontend post state array
    let newGenericPostList = [];
    genericPosts.map((idxVal) => {
      if (idxVal.id !== post_id) {
        return newGenericPostList.push(idxVal);
      } 
      return null;
    });

    let newProfilePostsList = [];
    profilePosts.map((idxVal) => {
      if (idxVal.id !== post_id) {
        return newProfilePostsList.push(idxVal);
      } 
      return null;
    });

    setGenericPosts(newGenericPostList);
    setProfilePosts(newProfilePostsList);

    let newUserPosts = [];

    for (let i = 0; i < props.account.posts_made.length; i++) {
      if (props.account.posts_made[i] !== post_id) {
        newUserPosts.push(props.account.posts_made[i]);  
      }
    }

    props.updateAccount({
      user_id: props.account.user_id,
      banner_picture: props.account.banner_picture,
      bio: props.account.bio,
      email: props.account.email,
      friends_list: props.account.friends_list,
      groups_joined: props.account.groups_joined,
      interests: props.account.interests,
      profile_picture: props.account.profile_picture,
      username: props.account.username,
      posts_made: newUserPosts,
      events: props.account.events,
      blocked: props.account.blocked,
    });
  }

  const updateLikes = (postMetadata) => {
    let newGenericPostList = [];
    newGenericPostList.push(postMetadata);
    for (let i = 0; i < genericPosts.length; i++) {
      if (genericPosts[i].id !== postMetadata.id) {
        newGenericPostList.push(genericPosts[i]);
      } 
    }

    let newProfilePostsList = [];
    newProfilePostsList.push(postMetadata);
    for (let i = 0; i < profilePosts.length; i++) {
      if (profilePosts[i].id !== postMetadata.id) {
        newProfilePostsList.push(profilePosts[i]);
      } 
    }

    setGenericPosts(newGenericPostList);
    setProfilePosts(newProfilePostsList);
  }

  //Delete post from DB via post delete endpoint & then remove it from the PostManagement list of postIDs
  const updatePost = async (id, text, s3_url, mediaType) => {
    //Get old post data
    let oldPost;
    if (props.currentPage === "default") {
      for (let i = 0; i < genericPosts.length; i++) {
        if (genericPosts[i].id === id) {
          oldPost = genericPosts[i];
          break;
        }
      } 
    } else {
      for (let i = 0; i < profilePosts.length; i++) {
        if (profilePosts[i].id === id) {
          oldPost = profilePosts[i];
          break;
        }
      }  
    }
    
    let postText = oldPost.text;

    //Update text changes with backend
    if (text !== "null") {
      try {
         await fetch('/* UPDATE POST CAPTION API */', {
          method: 'PATCH',
          body: JSON.stringify({
            "guid": id,
            "caption": text
          }),
        })
      } catch (error) {
        console.log("API Request Failed: UpdatePostCaption");
        console.log(error);
        return;
      }
      console.log("Post Patch Request Sent");

      postText = text;
    }

    //Update the metadata of post the changed in the post array state
    let new_sub_type = "none";
    if (s3_url !== "null") {
      let s3_url_substring = s3_url.substring(0, 14);
      if (s3_url_substring === "<https://youtu") {
        new_sub_type = "https://youtube.com"
      } else {
        new_sub_type = window.location.origin;
      }
    }

    //Update the metadata of post the changed in the post array state. Here we wanna put the edited post at the top of the array sort.
    let updatedPost = null;
    console.log(id);
    console.log(genericPosts)
    for (let i = 0; i < genericPosts.length; i++) {
      if (genericPosts[i].id === id) {
        updatedPost = {
          id: genericPosts[i].id,
          username: genericPosts[i].username,
          s3_url: s3_url,
          mediaType: mediaType,
          timestamp: genericPosts[i].timestamp,
          user_id: genericPosts[i].user_id,
          group_id: genericPosts[i].group_id,
          groupName: genericPosts[i].groupName,
          sub_type: new_sub_type,
          text: postText,
          edited: genericPosts[i].edited,
          comments: genericPosts[i].comments,
          likes: genericPosts[i].likes,
          dislikes: genericPosts[i].dislikes,
          visibility: true,
          views: genericPosts[i].views
        }
        break;
      }
    }

    //Puts the edited post to the top of the post feed for user viewing
    let newPostList = [];
    newPostList.push(updatedPost);
    genericPosts.map((idxVal) => {
      if (idxVal.id !== id) {
        return newPostList.push(idxVal);
      }
      return null;
    });

    if ((props.currentPage === "user-profile") || (props.currentPage === "group-profile")) {
      let updatedPost = null;

      console.log(profilePosts);
      for (let i  = 0; i < profilePosts.length; i++) {
        if (profilePosts[i].id === id) {
          updatedPost = {
            id: profilePosts[i].id,
            username: profilePosts[i].username,
            s3_url: s3_url,
            mediaType: mediaType,
            timestamp: profilePosts[i].timestamp,
            user_id: profilePosts[i].user_id,
            group_id: profilePosts[i].group_id,
            groupName: profilePosts[i].groupName,
            text: postText,
            edited: profilePosts[i].edited,
            comments: profilePosts[i].comments,
            likes: profilePosts[i].likes,
            dislikes: profilePosts[i].dislikes,
            visibility: true,
            views: profilePosts[i].views
          }
          break;
        } 
      }

      //Puts the edited post to the top of the post feed for user viewing
      let updatedProfilePostList = [];
      updatedProfilePostList.push(updatedPost);
      profilePosts.map((idxVal) => {
        if (idxVal.id !== id) {
          return updatedProfilePostList.push(idxVal);
        } 
        return null;
      });

      setProfilePosts(updatedProfilePostList);
    }

    setGenericPosts(newPostList);
 }
  const inGroup = useCallback (async (e) => {
    if (props.currentPage !== "group-profile") return;

    let isUserInGroupLocal = false;
    console.log(props.account.groups_joined);
    console.log(props.currentViewedProfile);
    for (let i = 0; i < props.account.groups_joined.length; i++) {
      if (props.account.groups_joined[i].group_id === props.currentViewedProfile) {
        isUserInGroupLocal = true;
        break;
      }
    }
    setIsUserInGroup(isUserInGroupLocal);   
  }, [props.currentViewedProfile, props.account.groups_joined, props.currentPage]);

  //Fetches data on component mount
  useEffect(() => {
    if ((props.currentPage === "user-profile") || (props.currentPage === "group-profile") || (props.currentPage === "default")) {
      inGroup();
      updatePostList();
    } 
  }, [props.currentViewedProfile, props.displayPosts, props.currentPage]);

  useEffect(() => {
    inGroup();
  }, [props.account, inGroup])

  //Update post visibility if we land on a user
  const updatePostList = useCallback (async (e) => {
    //Saves the current profile saved to help profile detect changes
    let originalProfile = currentProfile;

    //Check user privacy before asking for posts
    let userPrivacySetting = "none";
    if (props.currentPage === "user-profile") {
      let blockedUsersObj;
      try {
          let fetchResp = await fetch("/* GET BLOCKED USERS API */" + props.account.user_id);
          blockedUsersObj = await fetchResp.json();

          for (let i = 0; i < blockedUsersObj.data.blocked_users.length; i++) {
            if (blockedUsersObj.data.blocked_users[i].user_id === props.currentViewedProfile) {
              userPrivacySetting = "blocked";
              break;
            }
          }
      } catch (error) {
        console.log("GetBlockedUsers API Failure");
      }
      console.log("GetBlockedUsers API Request Sent");
    }

    if (currentProfile !== props.currentViewedProfile) {
      setCurrentProfile(props.currentViewedProfile);
      setNextProfilePostPage(1);
      setProfilePosts([]);
    }

    if (props.currentPage === "group-profile") {
      let banListObj;
      try {
          let fetchResp = await fetch(("/* GET BANNED MEMBERS API */" + props.currentViewedProfile));
          banListObj = await fetchResp.json();
      } catch (error) {
        console.log("Failed GetBannedMembers API Call");
      }

      if (banListObj !== null) {
        for (let i = 0; i < banListObj.banned.length; i++) {
          if (banListObj.banned[i].userID === props.account.user_id) {
            userPrivacySetting = "banned";
            break;
          }
        }  
      }
    }

    //Save current privacy rating
    if ((userPrivacySetting === "blocked") || (userPrivacySetting === "banned")) {
      setUserPrivacy(userPrivacySetting);
      setProfilePosts([]);
      setNextProfilePostPage(1);
      return;
    } else {
      setUserPrivacy("none");
    }
  
    //Update post list depending on the new profile view
    let newPosts = [];
    let endpoint;
    if ((props.currentPage === "user-profile") || (props.currentPage === "group-profile")) {
      let nameType = "user";
      if (props.currentPage === "group-profile") nameType = "group";
      endpoint = ("/* BATCH POSTS MADE API */" + nameType + "&id=" + props.currentViewedProfile + "&page=" + nextProfilePostPage);
    } else if (props.currentPage === "default") {
      endpoint = "/* BATCH POST FEED API */" + nextGenericPostPage + "&userID=" + props.account.user_id;
    } else {
      return;
    }

    try {
      await fetch(endpoint)
        .then(response => response.json())
        .then(json => newPosts = json)
    } catch (error) {
      console.log(error);
    }
    if (newPosts === "There are no posts on this page. Please try a lower page number") {
      console.log("No more posts!");
      return;
    } else if (newPosts.message == "Internal Server Error") {
      console.log("Post Manager API Failure! (500)");
      if ((props.currentPage === "user-profile") || (props.currentPage === "group-profile")) {
        setProfilePosts([]);
      } else if (props.currentPage === "default") {
        setGenericPosts([]);
      }
      return;
    } else {
      console.log("API Request Sent: PostManager Post Fetch - " + props.currentPage);
    }

    if (props.currentPage === "default") {
      if (newPosts.numPages !== localMaxGenericPostPages) {
        //Reset states
        setGenericPosts([]);
        setNextGenericPostPage(1);
        setLocalMaxGenericPostPages(newPosts.numPages);
        //Rerun postfeed api call starting from page 1 and overwrite the old newPosts value
        endpoint = "/* BATCH POST FEED API */" + props.account.user_id;
        console.log(endpoint)
        try {
          await fetch(endpoint)
            .then(response => response.json())
            .then(json => newPosts = json)
        } catch (error) {
          console.log(error);
          return;
        }
      }
    } else if (props.currentPage === "group-profile") {
      if (newPosts.numPages !== localMaxProfilePostPages) {
        //Reset states
        setProfilePosts([]);
        setNextProfilePostPage(1);
        setLocalMaxProfilePostPages(newPosts.numPages);
        endpoint = ("/* BATCH POSTS MADE API */" + props.currentViewedProfile + "&page=" + 1);  
      }
    }

    if ((props.currentPage === "default") && (newPosts.numPages === nextGenericPostPage) && (genericPosts.length !== 0)) return; 

    //Check if the new posts should be saved or not
    let updatedList = [];
    if (newPosts.posts !== undefined) {
      for (let i = 0; i < newPosts.posts.length; i++) {
        let mediaType = "null";
        if (newPosts.posts[i].s3_url !== "null") {
          const s3URLParts = newPosts.posts[i].s3_url.split("/");
          let specificFileType = s3URLParts[3].substring(s3URLParts[3].indexOf(".")+1, s3URLParts[3].indexOf("?"));
          if ((specificFileType === "jpeg") || (specificFileType === "png") || (specificFileType === "jpg") || (specificFileType === "apng") || (specificFileType === "gif") || (specificFileType === "gif")) {
            mediaType = "image";
          } else if ((specificFileType === "mp4") || (specificFileType === "avi") || (specificFileType === "mkv") || (specificFileType === "x-matroska") || (specificFileType === "quicktime")) {
            mediaType = "video";
          }
        }
  
        let likes = [];
        let dislikes = [];
        if ((newPosts.posts[i].likes !== "null") && (newPosts.posts[i].likes !== null)) {
          likes = newPosts.posts[i].likes; 
        }
        if ((newPosts.posts[i].dislikes !== "null") && (newPosts.posts[i].dislikes !== null)) {
          dislikes = newPosts.posts[i].dislikes; 
        }
  
        let new_sub_type = "none";
        if (newPosts.posts[i].s3_url !== "null") {
          if (newPosts.posts[i].s3_url.includes("https://www.youtube.com/") || newPosts.posts[i].s3_url.includes("https://youtu.be/")) {
            new_sub_type = "https://youtube.com"
            mediaType = "video";
          } else {
            new_sub_type = "http://localhost:3000/";  
          }
        }
  
        updatedList.push({
          id: newPosts.posts[i].ID,
          username: newPosts.posts[i].username,
          s3_url: newPosts.posts[i].s3_url,
          mediaType: mediaType,
          sub_type: new_sub_type,
          timestamp: newPosts.posts[i].timestamp,
          user_id: newPosts.posts[i].posterID,
          group_id: newPosts.posts[i].groupID,
          groupName: newPosts.posts[i].groupName,
          text: newPosts.posts[i].caption,
          edited: newPosts.posts[i].edited,
          comments: newPosts.posts[i].comments,
          likes: likes,
          dislikes: dislikes,
          visibility: true,
          views: newPosts.posts[i].views
        });  
      }
    }

    //Get group roles
    if (props.currentPage === "group-profile"){
      try {
        let resp = [];
        await fetch(("/* GET GROUP MEMBERS API */" + props.currentViewedProfile))
        .then(response => response.json())
        .then(json => resp = json)

        let tempList = [];
        Object.keys(resp.members).forEach(key => {
            const value = resp.members[key];
            tempList.push({
                user_id: key,
                role: value
            });
        })
        setUserListObj(tempList);

        console.log("API Request Sent: GetGroupMembers");
      } catch (error) {
          console.log("API Request Failed: GetGroupMembers");
          console.log(error);
          return;
      }
    }

    console.log(updatedList);
    if ((props.currentPage === "user-profile") || (props.currentPage === "group-profile")) {
      let newList = [];
      if (originalProfile === props.currentViewedProfile) { 
        newList = profilePosts;
      }

      if (nextProfilePostPage < (newPosts.numPages)) {
        for (let i  = 0; i < updatedList.length; i++) {
          newList.push(updatedList[i]);
        }
        setProfilePosts(newList);
        setNextProfilePostPage(prevState => prevState + 1);  
      } else {
        //Verify we have posts to add
        if (updatedList.length === 0) return;

        //If the user/group has less than the post batch size
        if (profilePosts.length === 0) {
          setProfilePosts(updatedList);
        } else if ((nextProfilePostPage <= (newPosts.numPages)) && (updatedList[updatedList.length-1].id !== profilePosts[profilePosts.length-1].id)) {
          for (let i = 0; i < updatedList.length; i++) {
            newList.push(updatedList[i]);
          }
          setProfilePosts(newList);
        }
        setNextProfilePostPage(newPosts.numPages);
        console.log("All profile posts have been fetched!");
      }
    } else {
      let newList = genericPosts;
      for (let i  = 0; i < updatedList.length; i++) {
        newList.push(updatedList[i]);
      }

      if (nextGenericPostPage < (newPosts.numPages)) {
        setGenericPosts(newList);
        setNextGenericPostPage(prevState => prevState + 1);
      } else {
        setNextGenericPostPage(newPosts.numPages);
        console.log("All generic posts have been fetched!");
      }
    }
    
    setLoading(false);
  }, [genericPosts, profilePosts, nextGenericPostPage, nextProfilePostPage, props]);

  useEffect(() => {
      let lastUpdate = new Date();
      const handleScroll = () => {
        if ((props.currentPage !== "default") && (props.currentPage !== "group-profile") && (props.currentPage !== "user-profile")) return;
    
        if ((document.body.scrollTop || document.body.parentNode.scrollTop) / (document.body.parentNode.scrollHeight - document.body.parentNode.clientHeight)*100 >= 75){
          var currTime = new Date();
          if (((currTime.getTime() - lastUpdate.getTime())/1000) > 5) {
            lastUpdate = currTime;
            updatePostList();
          }  
        } 
      };

      window.addEventListener('scroll', handleScroll);
      return () => {
          window.removeEventListener('scroll', handleScroll);
      };
  }, [updatePostList, props.currentPage, props.currentViewedProfile, props.displayPosts]);

  //Toggle create post form visibility
  const updateCreatePostDisplay = e => {
    setCreatePostDisplay(!createPostDisplay);
  }

  //Adds a created post to the post list and update account metadata
  //Since you can only create posts on group profiles, we only need to update the profilePosts list.
  const appendCreatedPost = (metadata) => {
    let newPostList = [];
    newPostList.push(metadata);
    for (let i = 0; i < profilePosts.length; i++) {
      newPostList.push(profilePosts[i]);
    }
    setProfilePosts(newPostList);

    let newUserPosts = [];
    newUserPosts.push(metadata.id);
    if (props.account.posts_made !== "null") {
      for (let i = 0; i < props.account.posts_made.length; i++) {
        newUserPosts.push(props.account.posts_made[i]);
      }  
    }

    props.updateAccount({
      user_id: props.account.user_id,
      banner_picture: props.account.banner_picture,
      bio: props.account.bio,
      email: props.account.email,
      friends_list: props.account.friends_list,
      groups_joined: props.account.groups_joined,
      interests: props.account.interests,
      profile_picture: props.account.profile_picture,
      username: props.account.username,
      posts_made: newUserPosts,
      events: props.account.events,
      blocked: props.account.blocked,
    });
  }

  //If a user is blocked, then remove their posts from local post caches
  const removeBlockedUserPosts = (uuid) => {
    let updatedGenericPosts = [];
    let updatedProfilePosts = [];

    for (let i  = 0; i < genericPosts.length; i++) {
      if (genericPosts[i].user_id !== uuid) {
        updatedGenericPosts.push(genericPosts[i]);
      }
    }
    for (let i  = 0; i < profilePosts.length; i++) {
      if (profilePosts[i].user_id !== uuid) {
        updatedProfilePosts.push(profilePosts[i]);
      }
    }

    setGenericPosts(updatedGenericPosts);
    setProfilePosts(updatedProfilePosts);
  }
  console.log(isUserInGroup);

  return (
    //Only display post content if displayPosts is determined to be true via App.js
    ( (props.displayPosts === "all") ? 
      <div id={style.postManagerMargin}>
        <div>
          { (props.displayPosts !== "none" && props.account.user_id !== "null" && (props.currentPage === "group-profile")) ?
            ( isUserInGroup ?
              ( createPostDisplay ? <CreatePostForm updateCreatePostDisplay={updateCreatePostDisplay} account={props.account} group_id={props.currentViewedProfile} appendCreatedPost={appendCreatedPost} windowWidth={windowWidth}/> : <button onClick={updateCreatePostDisplay} className={style.createPostButton}>Create Post</button> )
              :
              React.Fragment
            )
            :
            React.Fragment
          }
        </div>

        {loading ?
        <Animation/>
        :
        <div data-testid='postSection'>
          { (props.currentPage === "user-profile") || (props.currentPage === "group-profile") ?
            (profilePosts.map((idxVal) => {
              if (idxVal.visibility === true) {
                let viewerRole = "default";
                let postCreatorRole = "member";
                if ( props.currentPage === "group-profile") {
                  for(let i = 0; i < userListObj.length; i++) {
                    if (userListObj[i].role.id === props.account.user_id){
                      viewerRole = userListObj[i].role.type
                    }
                    if (userListObj[i].role.id === idxVal.user_id){
                      postCreatorRole = userListObj[i].role.type 
                    }
                  }
                }
                return <Post viewerAccount={props.account} edit={true} postMetadata={idxVal} key={Math.random()} deletePost={deletePost} updateLikes={updateLikes} updatePost={updatePost} updateAccount={props.updateAccount} updatePage={props.updatePage} windowWidth={windowWidth} viewerRole={viewerRole} postCreatorRole={postCreatorRole}/>;
              } else {
                return React.Fragment;
              }
            }))
            :
            (genericPosts.map((idxVal) => {
              if (idxVal.visibility === true) {
                let viewerRole = "default";
                let postCreatorRole = "member";
                return <Post viewerAccount={props.account} edit={true} postMetadata={idxVal} key={Math.random()} deletePost={deletePost} updateLikes={updateLikes} updatePost={updatePost} updateAccount={props.updateAccount} updatePage={props.updatePage} removeBlockedUserPosts={removeBlockedUserPosts} windowWidth={windowWidth} viewerRole={viewerRole} postCreatorRole={postCreatorRole}/>;
              } else {
                return React.Fragment;
              }
            }))
          }
          { (userPrivacy === "blocked" || userPrivacy === "banned") ?
            <PrivacyPopup privacyType={userPrivacy} />
            : React.Fragment

          }
        </div>}

        { loading ?
          React.Fragment :
          <div>
            {((profilePosts.length === 0) && (props.currentPage === "user-profile") && (props.currentViewedProfile === props.account.user_id) && (userPrivacy !== "blocked" && userPrivacy !== "banned")) ? 
              <div id={style.findFriendsPopup}>
                <h1 id={style.findFriendsHeader}>Looks pretty quiet here!</h1><br></br> 
                <h3 id={style.findFriendsText}>Try joining a group to start mixing.</h3>
                <RecommendedGroups updatePage={props.updatePage} dontNavigate={false}/>
              </div>
              : React.Fragment
            }
            { (profilePosts.length === 0) && ((props.currentPage === "user-profile") || (props.currentPage === "group-profile")) && (props.currentViewedProfile !== props.account.user_id)  && (userPrivacy !== "blocked" && userPrivacy !== "banned")?
              <div id={style.findFriendsPopup}>
                <h1 id={style.findFriendsHeader}>Looks pretty quiet here!</h1><br></br> 
                <h3 id={style.findFriendsText}><i>Check back later for new content.</i></h3>
              </div>
              : React.Fragment
            }
          </div>
        }
      </div>
      :
      React.Fragment
    )
  );
}

export default PostManagement;