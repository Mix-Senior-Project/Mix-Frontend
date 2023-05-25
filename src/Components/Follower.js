import React from "react";
import style from "./Follower.module.css";
import defaultpfp from "./Static-Images/default_pfp.png";
import modBadge from "./PostComponents/DefaultImages/groupModBadge.png";
import ownerBadge from "./PostComponents/DefaultImages/groupOwnerBadge.png";

const Follower = (props) => {
  const onUsernameClick = e => {
    props.updatePage("user-profile", props.friend.user_id);
  }

  return (
    <div id={style.spacing}>
      { (props.friend.role === 'userFriend') ? 
        <div className={style.follower} key={Math.random()}>
          { (props.friend.profile_picture !== "null") ?
            <img className={style.followerPFP} src={props.friend.profile_picture } alt={""}></img> : <img className={style.followerPFP} src={defaultpfp} alt={""}></img>
          }
          <button className={style.followerName} onClick={onUsernameClick}><h2 id={style.nameAlignment}>@{props.friend.username}</h2></button>
        </div>  : React.Fragment
      }
      { ((props.friend.role === 'mod') || (props.friend.role === 'member') || (props.friend.role === 'owner')) ? 
        <div className={style.groupFollower} key={Math.random()}>
          { (props.friend.profile_picture !== "null") ?
            <img className={style.followerPFP} src={props.friend.profile_picture} alt={""}></img> : <img className={style.followerPFP} src={defaultpfp} alt={""}></img>
          }
          <button className={style.followerName} onClick={onUsernameClick}><h2 id={style.nameAlignment}>@{props.friend.username}</h2></button> <br></br>
          { (props.friend.role === 'mod') ?
             <div id={style.userRoleSection}><img className={style.badge} src={modBadge} alt=""></img><p className={style.followerRole}> Community Moderator</p></div> : React.Fragment
          }
           { (props.friend.role === 'owner') ?
             <div id={style.userRoleSection}><img className={style.badge} src={ownerBadge} alt=""></img><p className={style.followerRole}> Community Owner</p> </div> : React.Fragment
          }
        </div>  : React.Fragment
      }
    </div>
  );
}
 
export default Follower;