import React from "react";
import style from'./Search.module.css';

const SearchItem = (props) => {
    const onComponentClick = (e) => {
        if (props.type === "group") {
            props.updatePage("group-profile",props.id);
        }
        if (props.type === "user") {
            props.updatePage("user-profile",props.id);
        }
        if (props.type === "event") {
            props.showEventDisplay(props.group_id, props.event_id);
        }
    }

    return (
        <div>
            <button className={style.searchItem} onClick={onComponentClick}>{props.name}</button><br></br>
        </div>
    );

}
 
export default SearchItem;