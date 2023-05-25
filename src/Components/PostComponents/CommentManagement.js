import React, {useEffect, useState} from "react";
import style from "./Post.module.css";
import default_pfp from "./DefaultImages/default_pfp.png";
import Comment from "./Comment";


const CommentManagement = (props) => {
    const [comment, setComment] = useState({
        id: "-1",
        pfp: null,
        name: "",
        text: ""
      });
    const [comments, setComments] = useState([]);

    //API Throttle variables
    const [lastRequest, setLastRequest] = useState(0);
    const requestCooldown = 5;

    useEffect(() => {
        if (props.postMetadata.comments !== null && props.postMetadata.comments !== "null") {
            let comments = [];
            for (let i = 0; i < props.postMetadata.comments.length; i++) {
              comments.push({
                id: i,
                pfp: null,
                name: props.postMetadata.comments[i].username,
                text: props.postMetadata.comments[i].text
              })
            }
            setComments(comments);
        }
      }, [props.postMetadata.comments]);

    //when a user adds a comment
    const postComment = async (e) => {
        //Provides a cooldown based on the request cooldown.
        var currTime = new Date();
        if (requestCooldown >= (currTime.getSeconds() - lastRequest)) {
          return;
        } else {
          setLastRequest(currTime.getSeconds());
        }

        props.setDisplayComments(!props.displayComments);
        try {
          await fetch('/* ADD COMMENT API */', {
              method: 'PATCH',
              body: JSON.stringify({
              "guid": `${props.postMetadata.id}`,
              "comments": comment.text,
              "username": comment.name
              }),
          })
          console.log(props.postMetadata.id);
          console.log(comment.text);
          console.log(comment.name);
        } catch (error) {
          console.log("API Request Failed: AddComment");
          console.log(error);
          return;
        }
        console.log("AddComment API Request Sent")

        let commentsList = comments;

        let newComment = {
          id: (comments.length),
          pfp: comment.pfp,
          name: comment.name,
          text: comment.text
        }
        commentsList.push(newComment);
        setComments(commentsList);
        
        let clearComment = {
          id: "-1",
          pfp: null,
          name: "",
          text: ""
        }
        
        setComment(clearComment);
    }

    //Remove comment
    const removeComment = async (e) => {
        if (e.target.id !== props.viewerAccount.username) return;

        let deletedComment = null;
        for (let i = 0; i < comments.length; i++) {
          if (comments[i].name === e.target.id) {
              deletedComment = comments[i];
          }
        }

        //Send API request
        try {
          await fetch('/* REMOVE COMMENT API */', {
              method: 'PATCH',
              body: JSON.stringify({
              "guid": props.postMetadata.id,
              "comments": deletedComment.text,
              "username": props.viewerAccount.username
              }),
          })
        } catch (error) {
          console.log("API Request Failed: RemoveComment");
          console.log(error);
          return;
        }
        console.log("RemoveComment API Request Sent")

        let newCommentsList = [];
        newCommentsList = comments.filter((comment) => {
          return (comment.id !== deletedComment.id);
        });

        setComments(newCommentsList);
    }

    //handles comment creation
    const handleComment = e => {
        let input = comment.text;

        if (e.target.name === "text") {
          input = e.target.value;
        }

        let newComment = {
          id: "-1",
          pfp: default_pfp,
          name: props.viewerAccount.username,
          text: input
        }

        setComment(newComment);
    }

    return (
        <div id={style.commentsSection}>
            <div className={style.createComment}>
              { (props.viewerAccount.profile_picture !== "null") ?
                <img src={props.viewerAccount.profile_picture} id={style.pfp} alt=""></img> : <img src={default_pfp} id={style.default_pfp} alt=""></img>
              }
              <textarea name="text" id={style.textInput} value={`${comment.text}`} onChange={handleComment} maxLength='500' placeholder="What do you want to comment?"></textarea><br></br>
              <button id={style.postComment} onClick={() => {props.toggleComment(); postComment();}}>Comment</button>
            </div>

            {props.displayComments ?
                <Comment viewerAccount={props.viewerAccount} comments={comments} removeComment={removeComment}/>
            : React.Fragment 
            }
        </div>
    );
}
export default CommentManagement;