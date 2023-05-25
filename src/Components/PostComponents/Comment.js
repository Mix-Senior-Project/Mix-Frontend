import React from "react";
import style from "./Post.module.css";


const Comment = (props) => {
    return (
        <div className={style.comments}>
                  { props.comments.map((idxVal) => {
                    if (idxVal.name === props.viewerAccount.username){
                      if (idxVal.pfp === "/static/media/default_pfp.4b4e57864f2a8b08d686.png"){
                        return <div className={style.comment} key={Math.random()}><img src={idxVal.pfp} id={style.default_pfp} alt=""></img><b>@{idxVal.name}</b> {idxVal.text}<button id={idxVal.name} className={style.deleteComment} onClick={props.removeComment}>Delete</button></div>
                      } else {
                        return <div className={style.comment} key={Math.random()}><img src={idxVal.pfp} id={style.pfp} alt=""></img><b>@{idxVal.name}</b> {idxVal.text}<button id={idxVal.name} className={style.deleteComment} onClick={props.removeComment}>Delete</button></div>
                      }
                    } else {
                      if (idxVal.pfp === "/static/media/default_pfp.4b4e57864f2a8b08d686.png") {
                        return <div className={style.comment} key={Math.random()}><img src={idxVal.pfp} id={style.default_pfp} alt=""></img><b>@{idxVal.name}</b> {idxVal.text}</div>
                      } else {
                        return <div className={style.comment} key={Math.random()}><img src={idxVal.pfp} id={style.pfp} alt=""></img><b>@{idxVal.name}</b> {idxVal.text}</div>
                      }
                    }
                  })}
        </div>
    );
}
export default Comment;