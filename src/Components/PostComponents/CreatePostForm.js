import style from "./Post.module.css";
import React, {useState} from "react";
import ReactPlayer from 'react-player';
import photo_icon from "./DefaultImages/./photo_icon.png";
import MediaUploader from "./MediaUploader";

const CreatePostForm = (props) => {
  const [image, setImage] = useState(null);
  const [displayMediaUpload, setDisplayMediaUpload] = useState(false);
  const [fileObj, setFileObj] = useState(null);
  const [metadata, setMetadata] = useState({id: "null", s3_url: "null", mediaType: "null", creationDate: "null", user_id: props.account.user_id, group_id: props.group_id, text: "", edited: false});
  
  //API Cooldown variables
  const [lastRequest, setLastRequest] = useState(0);
  const requestCooldown = 5;


  //Updates the text state when it changes and notifies the parent component of the change as well
  const handleChange = e => {
    setMetadata({id: metadata.id, s3_url: metadata.s3_url, mediaType: metadata.mediaType, creationDate: metadata.creationDate, user_id: metadata.user_id, group_id: metadata.group_id, text: e.target.value, edited: metadata.edited});
  }

  //Unmounts the component
  const onPostDelete = e => {
    props.updateCreatePostDisplay();
  }

  //Run when the user clicks 'Create Post' and this sends the post details to the backend. Then unmounts the create post component.
  const createPost = async (text) => {
    //Provides a cooldown based on the request cooldown.
    var currTime = new Date();
    if (requestCooldown >= (currTime.getSeconds() - lastRequest)) {
      return;
    } else {
      setLastRequest(currTime.getSeconds());
    }

    //Create post api content
    const timeNow = new Date();
    let currTimeStamp = timeNow.getFullYear() + "-" + (timeNow.getMonth()+1) + "-" + (timeNow.getDate()) + " " + timeNow.getHours() + ":" + timeNow.getMinutes() + ":" + timeNow.getSeconds();

    //Post creation api call
    let response  = "";
    let postObj = "";
    try {
      response = await fetch('/* POSTPOST API */', {
        method: 'POST',
        body: JSON.stringify({
          "s3_url": metadata.s3_url,
          "creation_date": currTimeStamp,
          "poster_id": metadata.user_id,
          "group_id": props.group_id,
          "caption": metadata.text
          }),
      })
      postObj = await response.json();  
      console.log("PostPost API Request Sent");
    } catch (error) {
      console.log("PostPost API Failure");
      return;
    }

    let groupName = "null";
    for (let i = 0; i < props.account.groups_joined.length; i++) {
      if (props.account.groups_joined[i].group_id === postObj.groupID) {
        groupName = props.account.groups_joined[i].group_name;
        break;
      }
    }

    props.updateCreatePostDisplay();
    props.appendCreatedPost({
      id: postObj.ID,
      edited: false,
      group_id: postObj.groupID,
      groupName: groupName,
      s3_url: postObj.s3_url,
      mediaType: metadata.mediaType,
      text: postObj.text,
      timestamp: postObj.timestamp,
      user_id: postObj.user_id,
      username: postObj.username,
      comments: null,
      likes: [],
      dislikes: [],
      views: 0,
      visibility: true
    });
  }

  //Update media component state
  const toggleMediaComponent = () => {
    setDisplayMediaUpload(!displayMediaUpload);
  }

  const setNewMedia = (type, value, mediaFile) => {
    setMetadata({id: metadata.id, s3_url: value, mediaType: type, creationDate: metadata.creationDate, user_id: metadata.user_id, group_id: metadata.group_id, text: metadata.text, edited: metadata.edited})
    
    if (type === "image") {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(mediaFile);

      setFileObj(mediaFile);
      fileReader.onload = () => {
        setImage(fileReader.result);
      }
    } else {
      setFileObj(mediaFile)
    }
    
    setDisplayMediaUpload(false);
  }

  return (
    <div className={style.postBody}>
        <button className={style.buttonStyle} id={style.hideForm} onClick={onPostDelete}> Hide Form </button>
        <div className={style.postBodyGrouping}>
          <div id={style.postContent}>
            <div id={style.mediaSection}>
              { (image !== null) ? 
                <div id={style.photoSection}>
                  <img src={image} alt="Content not found" id={style.photoStyle}></img>
                </div>  : React.Fragment
              }
              {(metadata.mediaType === "video" && fileObj !== null) ? 
                <ReactPlayer url={URL.createObjectURL(fileObj)} controls={true} width={"100%"}/> : React.Fragment
              }
               {(metadata.mediaType === "video" && fileObj === null) ? 
                <ReactPlayer url={metadata.s3_url} controls={true} width={"100%"}/> : React.Fragment
              }
            </div>

            { displayMediaUpload ? 
              <MediaUploader setNewMedia={setNewMedia} post_id={"null"} account={props.account}/>
              :
              <textarea className={style.postEditTextArea} placeholder="What do you want to post?" value={`${metadata.text}`} onChange={handleChange}></textarea>
            }
          </div>
        </div>  
        
        <div className={`${style.postFormButtons}`}>
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
        <button className={style.buttonStyle} id={style.createPostButton} onClick={createPost}><b>Create Post</b></button>
    </div>
  );
}

export default CreatePostForm;