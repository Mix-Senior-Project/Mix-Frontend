import React from "react";
import style from "./LeftSidebar.module.css";

const GroupListItem = (props) => {
  const onItemClick = e => {
    props.onGroupProfileSelect(props.group.group_id);
  }

  return (
    <button className={style.groupTab} id="testID" onClick={onItemClick}>
        <p><b>{props.group.group_name}</b></p>
    </button>
  );

}
 
export default GroupListItem;