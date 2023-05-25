import style from "./Post.module.css";
import MediaUploader from "./MediaUploader";
import React, {useEffect, useState} from "react";
import ReactPlayer from 'react-player';
import thumb_like_unfilled from "./DefaultImages/./thumb_like_unfilled.png";
import thumb_like_filled from "./DefaultImages/./thumb_like_filled.png";
import thumb_dislike_unfilled from "./DefaultImages/./thumb_dislike_unfilled.png";
import thumb_dislike_filled from "./DefaultImages/./thumb_dislike_filled.png";
import delete_icon from "./DefaultImages/./delete_icon.png";
import edit_icon from "./DefaultImages/./edit_icon.png";
import photo_icon from "./DefaultImages/./photo_icon.png";
import down_arrow from "./DefaultImages/arrow-down.png";
import modBadge from "./DefaultImages/groupModBadge.png";
import ownerBadge from "./DefaultImages/groupOwnerBadge.png";
import CommentManagement from "./CommentManagement";
import PostOptions from "../Utilities/ModerationOptions";

const Post = (props) => {
  const [isDisliked, setIsDisliked] = useState(false);
  const [editState, setEditState] = useState(false);
  const [commentState, setCommentState] = useState(false);
  const [displayComments, setDisplayComments] = useState(false);

  //API Throttle variables
  const [lastRequest, setLastRequest] = useState(0);
  const requestCooldown = 5;

  //Post metadata
  const [metadata, setMetadata] = useState(props.postMetadata);
  const [displayMediaUpload, setDisplayMediaUpload] = useState(false);
  
  //Updates post content on submission with backend
  const updatePostData = async () => {
    //Only update post if content has changed
    if (props.postMetadata.text !== metadata.text || metadata.s3_url !== "null") {
      let newText = "null";
      if (props.postMetadata.text !== metadata.text) {
        newText = metadata.text;
      }
      props.updatePost(metadata.id, newText, metadata.s3_url, metadata.mediaType);
    } 
  }

  //Toggles visibility for post editing buttons & only allow post creator to edit their own post
  const toggleEditMode = e => {
    if (props.viewerAccount.user_id === props.postMetadata.user_id) {
      if (editState) {
        setEditState(false);
        updatePostData();
      } else {
        setEditState(true);
      }
    }
  }

  //Handles post liking and like removal
  const updateLike = async (e) => {
    //Provides a cooldown based on the request cooldown.
    var currTime = new Date();
    if (requestCooldown >= (currTime.getSeconds() - lastRequest)) {
      return;
    } else {
      setLastRequest(currTime.getSeconds());
    }

    //Handle Like API Request
    let updatedList = [];
    if (props.postMetadata.likes.includes(props.viewerAccount.user_id)) {
      try {
        await fetch('/* REMOVE LIKE API */', {
          method: 'PATCH',
          body: JSON.stringify({
            "guid": props.postMetadata.id,
            "likes": props.viewerAccount.user_id
          }),
        })
        .then((response) => response.json())
      } catch (error) {
        console.log("API Request Failed: RemoveLike");
        console.log(error);
        return;
      }
      console.log("RemoveLike API Request Sent")

      for (let i = 0; i < metadata.likes.length; i++) {
        if (metadata.likes[i] !== props.viewerAccount.user_id) {
          updatedList.push(metadata.likes[i]);
        }
      }
    } else {
      try {
        await fetch('/* ADD LIKE API */', {
          method: 'PATCH',
          body: JSON.stringify({
            "guid": props.postMetadata.id,
            "likes": props.viewerAccount.user_id
          }),
        })
        .then((response) => response.json())

        updatedList = metadata.likes;
        updatedList.push(props.viewerAccount.user_id);
      } catch (error) {
        console.log("API Request Failed: AddLike");
        console.log(error);
        return;
      }
      console.log("Add Like API Request Sent")
    }
    
    //Update post locally
    setMetadata({
      id: metadata.id,
      username: metadata.username,
      edited: metadata.edited,
      group_id: metadata.group_id,
      groupName: metadata.groupName,
      s3_url: metadata.s3_url,
      mediaType: metadata.mediaType,
      sub_type: metadata.sub_type,
      text: metadata.text,
      timestamp: metadata.timestamp,
      user_id: metadata.user_id,
      comments: metadata.comments,
      likes: updatedList,
      dislikes: metadata.dislikes,
      visibility: true,
      views: metadata.views
    });

    //Update post list with new edited values
    props.updateLikes({
      id: metadata.id,
      username: metadata.username,
      edited: metadata.edited,
      group_id: metadata.group_id,
      groupName: metadata.groupName,
      s3_url: metadata.s3_url,
      mediaType: metadata.mediaType,
      sub_type: metadata.sub_type,
      text: metadata.text,
      timestamp: metadata.timestamp,
      user_id: metadata.user_id,
      comments: metadata.comments,
      likes: updatedList,
      dislikes: metadata.dislikes,
      visibility: true,
      views: metadata.views
    });
  }

  //Update post dislike status
  const updateDislike = async () => {
    //Provides a cooldown based on the request cooldown.
    var currTime = new Date();
    if (lastRequest >= (currTime.getSeconds() - requestCooldown)) {
      return;
    } else {
      if (currTime.getSeconds() >= (60-requestCooldown)) {
        setLastRequest(0)
      } else {
        setLastRequest(currTime.getSeconds());
      }
    }

    //Handle Like API Request
    if (isDisliked) {
      try {
        await fetch('/* REMOVE DISLIKE API */', {
          method: 'PATCH',
          body: JSON.stringify({
            "postID": props.postMetadata.id,
            "userID": props.viewerAccount.user_id
          }),
        })
        .then((response) => response.json())
      } catch (error) {
        console.log("API Request Failed: RemoveDislike");
        console.log(error);
        return;
      }
      console.log("Remove Dislike API Request Sent");
    } else {
      try {
        await fetch('/* ADD DISLIKE API */', {
          method: 'PATCH',
          body: JSON.stringify({
            "postID": props.postMetadata.id,
            "userID": props.viewerAccount.user_id
          }),
        })
        .then((response) => response.json())
      } catch (error) {
        console.log("API Request Failed: AddDislike");
        console.log(error);
        return;
      }
      console.log("Add Dislike API Request Sent");
    }
    setIsDisliked(!isDisliked);
  }

  //Updates the text state when it changes and notifies the parent component of the change as well
  const handleChange = e => {
    setMetadata({
      id: metadata.id,
      username: metadata.username,
      edited: metadata.edited,
      group_id: metadata.group_id,
      groupName: metadata.groupName,
      s3_url: metadata.s3_url,
      mediaType: metadata.mediaType,
      sub_type: metadata.sub_type,
      text: e.target.value,
      timestamp: metadata.timestamp,
      user_id: metadata.user_id,
      comments: metadata.comments,
      likes: metadata.likes,
      dislikes: metadata.dislikes,
      visibility: true,
      views: metadata.views
    });
  }

  //Calls parent post delete function to handle the delete post button click.
  const onPostDelete = e => {
    props.deletePost(metadata.id);
  }

  //Rerenders the post if the post is in edit mode or not.
  useEffect(() => {
    if (props.editState === true) {
      toggleEditMode();
    }
  }, [props.editState, toggleEditMode]);

  //When the user clicks the post username
  const onUsernameClick = (e) => {
    props.updatePage("user-profile", metadata.user_id);
  }

  const onGroupClick = (e) => {
    props.updatePage("group-profile", metadata.group_id);
  }

  //toggle for showing all comments on a post
  const toggleComments = (e) => {
    setDisplayComments(!displayComments);
  }

  //toggle for creating comment state
  const toggleComment = (e) => {
    setCommentState(!commentState);
    setDisplayComments(false);
  }

  //Calculates how old the post is for so that it can be displayed to the user
  const computeAge = (e) => {
    var creationTime = new Date(metadata.timestamp);
    var currentTime = new Date();
    var difference = (currentTime.getTime() - creationTime.getTime())/1000;

    let returnString = "";
    if (difference < 60) {
      returnString = Math.round(difference) + " seconds";
    } else if ((difference/60) < 60) {
      returnString = Math.round((difference/60)) + " minutes";
    } else if (((difference/60)/60) < 24) {
      returnString = Math.round(((difference/60)/60)) + " hours";
    } else if ((((difference/60)/60)/24) < 31) {
      returnString = Math.round(((difference/60)/60)/24) + " days";
    } else {
      returnString = "A long time "
    }

    return returnString;
  }

  //Summarizes the value of how many views a post has
  const computeViews = () => {
    if (metadata.views >= 1000000000000) {
      return  (Math.round(metadata.views / 1000000000000),2) + "." + Math.round(((metadata.views%1000000000000)/10000000000)) + "T ";
    } else if (metadata.views >= 1000000000) {
      return  (Math.round(metadata.views / 1000000000),2) + "." + Math.round(((metadata.views%1000000000)/100000000)) + "B ";
    } else if (metadata.views >= 1000000) {
      return  (Math.round(metadata.views / 1000000),2) + "." + Math.round(((metadata.views%1000000)/100000)) + "M ";
    } else if (metadata.views >= 1000) {
      return  (Math.round(metadata.views / 1000),2) + "." + Math.round(((metadata.views%1000)/100)) + "K ";
    } else {
      return (metadata.views + " ");
    }
  }

  //Update media component state
  const toggleMediaComponent = () => {
    setDisplayMediaUpload(!displayMediaUpload);
  }
  
  const setNewMedia = (fileCategorization, response, file) => {
    let new_sub_type = "none";
    if (response !== "null") {
      let s3_url_substring = response.substring(0, 14);
      if (s3_url_substring === "<https://youtu") {
        new_sub_type = "https://youtube.com"
      } else {
        new_sub_type = window.location.origin;
      }
    }

    setMetadata({
      id: metadata.id,
      username: metadata.username,
      edited: metadata.edited,
      group_id: metadata.group_id,
      groupName: metadata.groupName,
      s3_url: response,
      mediaType: fileCategorization,
      sub_type: new_sub_type,
      text: metadata.text,
      timestamp: metadata.timestamp,
      user_id: metadata.user_id,
      comments: metadata.comments,
      likes: metadata.likes,
      dislikes: metadata.dislikes,
      visibility: true,
      views: metadata.views
    });

    setDisplayMediaUpload(false);
  }

  return (
    <div className={style.postBody} data-testid="post">
        <div id={style.postHeader}>
          <button className={style.userName} onClick={onUsernameClick}><h2>@{metadata.username}</h2></button>
          {props.postCreatorRole === "mod" ? 
            <img className={style.badge} alt='modBadge' src={modBadge}></img>
          :React.Fragment}

          {props.postCreatorRole === "owner" ?
            <img className={style.badge} alt='ownerBadge' src={ownerBadge}></img>
          : React.Fragment}
          
          <button className={style.groupName} onClick={onGroupClick}><h2>({metadata.groupName})</h2></button>


          { (props.windowWidth > 440) ?
            <div id={style.postHeaderRight}>
              <p><b>{computeAge()} ago - {computeViews()} views</b></p>
              <PostOptions location={"post"} metadata={metadata} role={props.viewerRole} viewerAccount={props.viewerAccount} updateAccount={props.updateAccount} updatePage={props.updatePage} removeBlockedUserPosts={props.removeBlockedUserPosts}/>
            </div> : React.Fragment
          }

          { (metadata.edited === "1") ?
            <div id={style.editLabel}><p><b>[Edited]</b></p></div> : React.Fragment
          }
        </div>
        
        <div className={style.postBodyGrouping}>
          <div id={style.postContent}>
            <div id={style.mediaSection}>
              {(metadata.mediaType === "image") ? 
                <img src={metadata.s3_url} alt="" id={style.photoStyle}></img> : React.Fragment
              }
              {(metadata.mediaType === "video") ? 
                <ReactPlayer url={metadata.s3_url} controls={true} width={"100%"} origin={metadata.sub_type}/> : React.Fragment
              }
            </div>

            { displayMediaUpload ? 
              <MediaUploader setNewMedia={setNewMedia} post_id={props.postMetadata.id} account={props.viewerAccount}/>
              :
              ( (editState && (props.viewerAccount.user_id === props.postMetadata.user_id)) ?
                <textarea className={style.postEditTextArea} value={`${metadata.text}`} onChange={handleChange}></textarea> : <h2>{metadata.text}</h2>
              )
            }
          </div>
        </div>  

        <div className={style.postButtonsGrouping}>
          { (editState && (props.viewerAccount.user_id === props.postMetadata.userID)) ?
            <div>
              <div id={style.buttonGroup}>
                <div id={style.buttonGroupItem}>
                  { (props.windowWidth > 1100) ?
                    <button className={style.buttonStyle} id={style.editButton} onClick={toggleMediaComponent}><img src={photo_icon} alt="edit_icon not found" id={style.editIcon}></img> 
                      { (displayMediaUpload) ?
                        <h2 id={style.editText}>Exit Media Upload</h2> : <h2 id={style.editText}>Upload Media</h2>
                      }
                    </button> 
                    :
                    <button className={style.buttonStyle} id={style.editButtonMinimized} onClick={toggleMediaComponent}><img src={photo_icon} alt="edit_icon not found" id={style.editIcon}></img></button> 
                  }
                </div>
              </div>
              { displayMediaUpload ?
                React.Fragment
                :
                <div id={style.submitButton} onClick={() => toggleEditMode()}>
                  <button className={style.buttonStyle}><h3 id={style.submitText}>Update</h3></button>
                </div>
              }
            </div> 
          : 
            ( (props.windowWidth >= 400) ? 
              <div id={style.buttonGroup}>
                <div id={style.buttonGroupItem} className={style.buttonItemLeft}>
                  <button id={style.likeImage} onClick={() => {updateLike()}}>
                  { props.postMetadata.likes.includes(props.viewerAccount.user_id) ?
                    <img src={thumb_like_filled} alt="Like not found" id={style.heart}></img>: <img src={thumb_like_unfilled} alt="Like not found" id={style.heart}></img>
                  }
                  </button>
                  <div>
                    <p id={style.likeCount}><b>{`${metadata.likes.length}`}</b></p>
                  </div>
                </div>
                <div id={style.buttonGroupItem} className={style.buttonItemRight}>
                  <button id={style.dislikeImage} onClick={() => {updateDislike()}}>
                  { isDisliked ?
                    <img src={thumb_dislike_filled} alt="Dislike not found" id={style.heart}></img> : <img src={thumb_dislike_unfilled} alt="Dislike not found" id={style.heart}></img>
                  }
                  </button>
                </div>
              </div> : React.Fragment 
            )
            
          }
           { ((props.viewerRole === "mod" || props.viewerRole === "owner" || (props.viewerAccount.user_id === props.postMetadata.user_id)) && (props.windowWidth > 600)) ?
            <div id={style.editPostButtons}>
              { (editState || ((props.viewerRole === "mod" || props.viewerRole === "owner") && (props.viewerAccount.user_id !== props.postMetadata.user_id))) ? 
                <div id={style.deleteBtn}>
                  {(props.windowWidth > 1360) ? 
                    <button className={style.buttonStyle} id={style.editButton} onClick={onPostDelete}> <img src={delete_icon} alt="delete_icon not found" id={style.editIcon}></img> <h2 id={style.editText}>Delete</h2></button> 
                    :
                    <button className={style.buttonStyle} id={style.editButtonMinimized} onClick={onPostDelete}> <img src={delete_icon} alt="delete_icon not found" id={style.editIcon}></img></button> 
                  }
                </div>
                : 
                ((props.windowWidth > 1360) ? 
                  <button className={style.buttonStyle} id={style.editButton} onClick={() => toggleEditMode()}><img src={edit_icon} alt="edit_icon not found" id={style.editIcon}></img> <h2 id={style.editText}>Edit</h2> </button> 
                  :
                  <button className={style.buttonStyle} id={style.editButtonMinimized} onClick={() => toggleEditMode()}><img src={edit_icon} alt="edit_icon not found" id={style.editIcon}></img></button> 
                )
              }
            </div> : React.Fragment
          }

          {editState ?
          React.Fragment
          :
          <div id={style.commentButtonSection}> 
            {console.log(props.postMetadata)}
            {(props.postMetadata.comments === "null") ?
            React.Fragment
            :
            <button id={style.commentsButton} onClick={toggleComments}>Comments <img src={down_arrow} id={style.arrow} alt=""></img></button>}
          </div>}
        </div>

        <CommentManagement toggleComment={toggleComment} displayComments={displayComments} setDisplayComments={setDisplayComments} postMetadata={props.postMetadata} viewerAccount={props.viewerAccount}/>
    </div>
  );
}

export default Post;
